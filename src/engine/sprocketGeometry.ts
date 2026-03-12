// ============================================================================
// Sprocket Geometry Engine
// ============================================================================
// Constructs a technically accurate sprocket profile using Maker.js,
// following ANSI B29.1M standard tooth geometry for roller chain sprockets.
//
// === Sprocket Math Reference ===
//   N  = number of teeth
//   p  = chain pitch (mm)
//   Dr = roller diameter (mm)
//
//   Pitch Diameter:    PD = p / sin(π / N)
//   Outside Diameter:  OD ≈ p * (0.6 + cot(π / N))
//   Root Diameter:     RD = PD - Dr
//   Tooth angle:       α  = 2π / N
//
// === ANSI B29.1M Tooth Profile ===
// Each tooth gap is constructed from:
//   1. Seating arc — radius ≈ 0.505*Dr + 0.069*∛Dr, centered on pitch circle
//   2. Working flanks — smooth transition curves from seat to tip
//   3. Topping arc — arc segment at the outer diameter
// The profile is symmetric about the radial centerline of each tooth gap.
// ============================================================================

import makerjs from "makerjs";
import type {
  SprocketParams,
  CalculatedDimensions,
  ValidationError,
  WeightEstimate,
} from "../types/sprocket";
import { getChainSpec } from "../data/chainTable";
import { getMaterial } from "../data/materials";

// ============================================================================
// Calculation Helpers
// ============================================================================

/**
 * Calculate derived sprocket dimensions from user parameters.
 */
export function calculateDimensions(
  params: SprocketParams
): CalculatedDimensions | null {
  const spec = getChainSpec(params.chainNumber);
  if (!spec) return null;

  const { pitch, rollerDiameter } = spec;
  const N = params.numTeeth;

  // PD = p / sin(π / N) — the circle on which roller centers lie
  const pitchDiameter = pitch / Math.sin(Math.PI / N);

  // OD ≈ p * (0.6 + cot(π/N)) — standard ANSI approximation
  const outsideDiameter = pitch * (0.6 + 1 / Math.tan(Math.PI / N));

  // RD = PD - Dr — bottom of the tooth gaps
  const rootDiameter = pitchDiameter - rollerDiameter;

  return {
    pitch,
    rollerDiameter,
    pitchDiameter,
    outsideDiameter,
    rootDiameter,
  };
}

// ============================================================================
// Validation
// ============================================================================

/**
 * Validate all sprocket parameters and return any errors.
 */
export function validateParams(params: SprocketParams): ValidationError[] {
  const errors: ValidationError[] = [];
  const dims = calculateDimensions(params);

  if (!dims) {
    errors.push({ field: "chainNumber", message: "Unknown chain number" });
    return errors;
  }

  if (params.numTeeth < 8 || params.numTeeth > 120) {
    errors.push({
      field: "numTeeth",
      message: "Number of teeth must be between 8 and 120",
    });
  }

  if (params.boreDiameter <= 0) {
    errors.push({
      field: "boreDiameter",
      message: "Bore diameter must be greater than 0",
    });
  }

  if (params.boreDiameter >= dims.rootDiameter) {
    errors.push({
      field: "boreDiameter",
      message: `Bore diameter must be less than root diameter (${dims.rootDiameter.toFixed(2)} mm)`,
    });
  }

  if (params.hubEnabled) {
    if (params.hubDiameter <= params.boreDiameter) {
      errors.push({
        field: "hubDiameter",
        message: "Hub diameter must be larger than bore diameter",
      });
    }
    if (params.hubDiameter >= dims.rootDiameter) {
      errors.push({
        field: "hubDiameter",
        message: `Hub diameter must be less than root diameter (${dims.rootDiameter.toFixed(2)} mm)`,
      });
    }
  }

  if (params.mountingHolesEnabled) {
    const holeEdgeR =
      params.boltCircleDiameter / 2 + params.mountingHoleDiameter / 2;
    if (holeEdgeR >= dims.rootDiameter / 2) {
      errors.push({
        field: "boltCircleDiameter",
        message: "Bolt circle + hole radius exceeds root diameter",
      });
    }
    const holeInnerR =
      params.boltCircleDiameter / 2 - params.mountingHoleDiameter / 2;
    if (holeInnerR <= params.boreDiameter / 2) {
      errors.push({
        field: "boltCircleDiameter",
        message: "Bolt circle too small — holes overlap the bore",
      });
    }
    if (params.mountingHoleDiameter <= 0) {
      errors.push({
        field: "mountingHoleDiameter",
        message: "Mounting hole diameter must be > 0",
      });
    }
  }

  if (params.keywayEnabled) {
    if (params.keywayWidth <= 0 || params.keywayDepth <= 0) {
      errors.push({
        field: "keywayWidth",
        message: "Keyway width and depth must be > 0",
      });
    }
    if (params.keywayWidth >= params.boreDiameter) {
      errors.push({
        field: "keywayWidth",
        message: "Keyway width must be less than bore diameter",
      });
    }
  }

  return errors;
}

// ============================================================================
// Geometry Construction — Polar-sweep Tooth Profile
// ============================================================================
//
// Strategy: sweep angle θ monotonically from 0 → 2π.  At each sample
// angle, compute the radial distance r(θ) from the origin.  This
// guarantees zero crossovers because the path never backtracks in angle.
//
// For each tooth period (one gap + one tip), the profile alternates:
//   seat (concave root) → flank (rising) → tip (outer peak) → flank (falling)
// Everything is computed as r(θ), then converted to Cartesian.
// ============================================================================

/**
 * Generate all tooth profile points using a polar sweep.
 *
 * We define the profile as r(θ) — a continuous function of angle.
 * Gaps are at angles  gapAngle_k = k · (2π/N),  k = 0..N-1
 * Tips are at angles  tipAngle_k = (k + 0.5) · (2π/N)
 *
 * For each sample θ we find the nearest gap center and compute
 * an offset δ ∈ [0, toothAngle/2] measuring how far we are from
 * that gap center.  Then:
 *   δ ∈ [0, seatHW]                   → seating arc (ray-circle intersection)
 *   δ ∈ [seatHW, toothAngle/2 - tipHW] → flank (smooth interpolation)
 *   δ ∈ [toothAngle/2 - tipHW, toothAngle/2] → tip arc
 */
function generateToothPoints(
  N: number,
  pitch: number,
  rollerDiameter: number,
  pitchDiameter: number,
  outsideDiameter: number,
): makerjs.IPoint[] {
  const pitchRadius = pitchDiameter / 2;
  const outerRadius = outsideDiameter / 2;
  const rootRadius = (pitchDiameter - rollerDiameter) / 2;
  const toothAngle = (2 * Math.PI) / N;
  const halfTooth = toothAngle / 2;

  // ANSI seating radius
  const Rs = 0.505 * rollerDiameter + 0.069 * Math.cbrt(rollerDiameter);
  const seatHalfAngle = Math.asin(Math.min(pitch / (2 * Rs), 1));

  // Compute the angular half-width of the seat zone as seen from origin.
  // Use tooth 0 (gap at angle 0) to measure it once.
  const seatCx0 = pitchRadius; // seat center for gap 0
  const seatEndPt = [
    seatCx0 + Rs * Math.cos(Math.PI + seatHalfAngle),
    Rs * Math.sin(Math.PI + seatHalfAngle),
  ];
  const seatHW = Math.abs(Math.atan2(seatEndPt[1], seatEndPt[0]));

  // Tip arc
  const Rt = 0.04 * pitch;
  const tipHW = Math.asin(Math.min(Rt / outerRadius, 1));
  const tipCenterRadius = outerRadius - Rt;

  // Points per tooth — enough for smooth curves
  const PTS_PER_TOOTH = 64;
  const totalPts = N * PTS_PER_TOOTH;
  const points: makerjs.IPoint[] = [];

  for (let i = 0; i < totalPts; i++) {
    const theta = (i / totalPts) * 2 * Math.PI;

    // Find the nearest gap center
    const nearestGapIdx = Math.round(theta / toothAngle);
    const gapCenter = nearestGapIdx * toothAngle;
    // Signed offset from the nearest gap center
    const delta = theta - gapCenter;
    // Absolute offset — how far from the gap center, in [0, halfTooth]
    const absDelta = Math.abs(delta);

    let r: number;

    if (absDelta <= seatHW) {
      // === SEATING ZONE ===
      // Ray-circle intersection with seat arc centered on pitch circle
      const gapIdx = ((nearestGapIdx % N) + N) % N;
      const gc = gapIdx * toothAngle;
      const scx = pitchRadius * Math.cos(gc);
      const scy = pitchRadius * Math.sin(gc);

      const dx = Math.cos(theta);
      const dy = Math.sin(theta);
      const dot = scx * dx + scy * dy;
      const cSq = scx * scx + scy * scy;
      const disc = dot * dot - (cSq - Rs * Rs);

      if (disc >= 0) {
        r = dot - Math.sqrt(disc);
        if (r < rootRadius * 0.8) r = rootRadius;
      } else {
        r = rootRadius;
      }

    } else if (absDelta >= halfTooth - tipHW) {
      // === TIP ZONE ===
      // The tip center is between this gap and the next/previous gap.
      // If delta > 0 we're heading toward the "next" tip (gapCenter + halfTooth)
      // If delta < 0 we're heading toward the "previous" tip (gapCenter - halfTooth)
      const tipAngle = gapCenter + (delta >= 0 ? halfTooth : -halfTooth);
      const tcx = tipCenterRadius * Math.cos(tipAngle);
      const tcy = tipCenterRadius * Math.sin(tipAngle);

      const dx = Math.cos(theta);
      const dy = Math.sin(theta);
      const dot = tcx * dx + tcy * dy;
      const cSq = tcx * tcx + tcy * tcy;
      const disc = dot * dot - (cSq - Rt * Rt);

      if (disc >= 0) {
        r = dot + Math.sqrt(disc);
      } else {
        r = outerRadius;
      }

    } else {
      // === FLANK ZONE ===
      // Smoothly interpolate between seat-edge radius and outer radius.
      const flankStart = seatHW;
      const flankEnd = halfTooth - tipHW;
      const t = (absDelta - flankStart) / (flankEnd - flankStart);
      // Hermite smoothstep for C1-continuous transition
      const s = t * t * (3 - 2 * t);

      // Compute rSeat at the seat boundary using ray-circle
      const gapIdx = ((nearestGapIdx % N) + N) % N;
      const gc = gapIdx * toothAngle;
      const scx = pitchRadius * Math.cos(gc);
      const scy = pitchRadius * Math.sin(gc);
      const edgeAngle = gc + (delta >= 0 ? seatHW : -seatHW);
      const edx = Math.cos(edgeAngle);
      const edy = Math.sin(edgeAngle);
      const edot = scx * edx + scy * edy;
      const ecSq = scx * scx + scy * scy;
      const edisc = edot * edot - (ecSq - Rs * Rs);
      const rSeat = edisc >= 0 ? edot - Math.sqrt(edisc) : rootRadius;

      r = rSeat + (outerRadius - rSeat) * s;
    }

    points.push([r * Math.cos(theta), r * Math.sin(theta)]);
  }

  return points;
}

/**
 * Convert an array of points into a Maker.js model of connected line segments,
 * forming a closed polygon.
 */
function pointsToModel(points: makerjs.IPoint[]): makerjs.IModel {
  const model: makerjs.IModel = { paths: {} };
  for (let i = 0; i < points.length; i++) {
    const next = (i + 1) % points.length;
    model.paths![`seg_${i}`] = new makerjs.paths.Line(
      points[i],
      points[next]
    );
  }
  return model;
}

// ============================================================================
// Model Assembly
// ============================================================================

/**
 * Build the complete sprocket model with all features.
 */
export function buildSprocketModel(
  params: SprocketParams
): makerjs.IModel | null {
  const dims = calculateDimensions(params);
  if (!dims) return null;

  const { pitch, rollerDiameter, pitchDiameter, outsideDiameter } = dims;
  const N = params.numTeeth;

  const model: makerjs.IModel = {
    models: {},
    paths: {},
    units: makerjs.unitType.Millimeter,
  };

  // ================================================================
  // 1. TOOTH PROFILE — full sprocket outline
  // ================================================================
  const toothPoints = generateToothPoints(
    N,
    pitch,
    rollerDiameter,
    pitchDiameter,
    outsideDiameter
  );
  const toothModel = pointsToModel(toothPoints);
  assignLayer(toothModel, "outline");
  makerjs.model.addModel(model, toothModel, "teeth");

  // ================================================================
  // 2. BORE CIRCLE — center shaft hole
  // ================================================================
  const bore: makerjs.IModel = {
    paths: {
      bore: new makerjs.paths.Circle([0, 0], params.boreDiameter / 2),
    },
  };
  assignLayer(bore, "bore");
  makerjs.model.addModel(model, bore, "bore");

  // ================================================================
  // 3. HUB CIRCLE (optional) — raised area around bore
  // ================================================================
  if (params.hubEnabled && params.hubDiameter > params.boreDiameter) {
    const hub: makerjs.IModel = {
      paths: {
        hub: new makerjs.paths.Circle([0, 0], params.hubDiameter / 2),
      },
    };
    assignLayer(hub, "hub");
    makerjs.model.addModel(model, hub, "hub");
  }

  // ================================================================
  // 4. MOUNTING HOLES on bolt circle (optional)
  //    Holes are evenly distributed: angular offset = 360° / numHoles
  // ================================================================
  if (params.mountingHolesEnabled && params.mountingHoleCount > 0) {
    const boltR = params.boltCircleDiameter / 2;
    const holeAngle = 360 / params.mountingHoleCount;
    const holesModel: makerjs.IModel = { paths: {} };

    for (let i = 0; i < params.mountingHoleCount; i++) {
      const angleDeg = i * holeAngle;
      const angleRad = (angleDeg * Math.PI) / 180;
      holesModel.paths![`hole_${i}`] = new makerjs.paths.Circle(
        [boltR * Math.cos(angleRad), boltR * Math.sin(angleRad)],
        params.mountingHoleDiameter / 2
      );
    }
    assignLayer(holesModel, "holes");
    makerjs.model.addModel(model, holesModel, "mountingHoles");
  }

  // ================================================================
  // 5. KEYWAY SLOT (optional) — rectangular notch in bore
  // ================================================================
  if (
    params.keywayEnabled &&
    params.keywayWidth > 0 &&
    params.keywayDepth > 0
  ) {
    const keyway = buildKeyway(
      params.boreDiameter / 2,
      params.keywayWidth,
      params.keywayDepth
    );
    assignLayer(keyway, "bore");
    makerjs.model.addModel(model, keyway, "keyway");
  }

  return model;
}

/**
 * Build a keyway slot — rectangular notch at 12 o'clock position (+Y).
 *
 * @param boreRadius - Bore hole radius
 * @param width      - Keyway width (tangential)
 * @param depth      - Keyway depth (radial, outward from bore surface)
 */
function buildKeyway(
  boreRadius: number,
  width: number,
  depth: number
): makerjs.IModel {
  const halfW = width / 2;
  // Inner Y: intersection of keyway sides with bore circle
  const innerY = Math.sqrt(
    Math.max(boreRadius * boreRadius - halfW * halfW, 0)
  );
  const outerY = boreRadius + depth;

  const tl: makerjs.IPoint = [-halfW, outerY];
  const tr: makerjs.IPoint = [halfW, outerY];
  const br: makerjs.IPoint = [halfW, innerY];
  const bl: makerjs.IPoint = [-halfW, innerY];

  return {
    paths: {
      left: new makerjs.paths.Line(bl, tl),
      top: new makerjs.paths.Line(tl, tr),
      right: new makerjs.paths.Line(tr, br),
      bottom: new makerjs.paths.Line(br, bl),
    },
  };
}

/**
 * Recursively assign a DXF layer to all paths in a model.
 * This separates features onto different DXF layers for CNC workflows.
 */
function assignLayer(m: makerjs.IModel, layer: string): void {
  if (m.paths) {
    for (const key in m.paths) {
      m.paths[key].layer = layer;
    }
  }
  if (m.models) {
    for (const key in m.models) {
      assignLayer(m.models[key], layer);
    }
  }
}

// ============================================================================
// 2D Profile Points — for Three.js 3D extrusion
// ============================================================================

/**
 * Return the 2D outline points of the full sprocket including bore, hub,
 * keyway, and mounting holes — suitable for Three.js Shape/ExtrudeGeometry.
 *
 * Returns an object with:
 *   toothProfile: [x,y][]   — outer tooth contour (closed polygon)
 *   boreRadius: number       — center bore radius
 *   hubRadius: number | null — hub circle radius (if enabled)
 *   mountingHoles: {x,y,r}[] — mounting bolt holes (if enabled)
 *   keyway: {x1,y1,x2,y2,x3,y3,x4,y4} | null — keyway rectangle
 */
export interface SprocketProfile2D {
  toothProfile: [number, number][];
  boreRadius: number;
  hubRadius: number | null;
  mountingHoles: { cx: number; cy: number; r: number }[];
  keyway: { halfW: number; innerY: number; outerY: number } | null;
}

export function getSprocketProfile(params: SprocketParams): SprocketProfile2D | null {
  const dims = calculateDimensions(params);
  if (!dims) return null;

  const { pitch, rollerDiameter, pitchDiameter, outsideDiameter } = dims;
  const N = params.numTeeth;

  // Get tooth outline as [x,y] tuples
  const makerPts = generateToothPoints(N, pitch, rollerDiameter, pitchDiameter, outsideDiameter);
  const toothProfile: [number, number][] = makerPts.map((p) => [p[0], p[1]]);

  // Bore
  const boreRadius = params.boreDiameter / 2;

  // Hub
  const hubRadius = params.hubEnabled && params.hubDiameter > params.boreDiameter
    ? params.hubDiameter / 2
    : null;

  // Mounting holes
  const mountingHoles: { cx: number; cy: number; r: number }[] = [];
  if (params.mountingHolesEnabled && params.mountingHoleCount > 0) {
    const boltR = params.boltCircleDiameter / 2;
    for (let i = 0; i < params.mountingHoleCount; i++) {
      const angle = (i * 2 * Math.PI) / params.mountingHoleCount;
      mountingHoles.push({
        cx: boltR * Math.cos(angle),
        cy: boltR * Math.sin(angle),
        r: params.mountingHoleDiameter / 2,
      });
    }
  }

  // Keyway
  const keyway = params.keywayEnabled && params.keywayWidth > 0 && params.keywayDepth > 0
    ? {
        halfW: params.keywayWidth / 2,
        innerY: Math.sqrt(Math.max(boreRadius * boreRadius - (params.keywayWidth / 2) ** 2, 0)),
        outerY: boreRadius + params.keywayDepth,
      }
    : null;

  return { toothProfile, boreRadius, hubRadius, mountingHoles, keyway };
}

// ============================================================================
// Weight Estimation
// ============================================================================
//
// Calculates approximate weight from 2D geometry:
//   1. Gross area = π × (OD/2)²
//   2. Subtract bore, mounting holes, keyway
//   3. Account for tooth valleys (only ~55% of outer annular ring is solid)
//   4. Volume = netArea × plateThickness  →  cm³
//   5. Weight = volume × density
// ============================================================================

/**
 * Compute net solid area in mm² and estimate weight.
 */
export function estimateWeight(
  params: SprocketParams,
  dims: CalculatedDimensions,
): WeightEstimate {
  const material = getMaterial(params.materialKey);

  const outerR = dims.outsideDiameter / 2;
  const rootR = dims.rootDiameter / 2;
  const boreR = params.boreDiameter / 2;

  const coreArea = Math.PI * rootR * rootR;
  const toothRingArea = Math.PI * (outerR * outerR - rootR * rootR);
  const effectiveToothArea = toothRingArea * 0.55;

  let grossArea = coreArea + effectiveToothArea;
  let cutoutArea = Math.PI * boreR * boreR;

  if (params.mountingHolesEnabled) {
    const holeR = params.mountingHoleDiameter / 2;
    cutoutArea += params.mountingHoleCount * Math.PI * holeR * holeR;
  }
  if (params.keywayEnabled) {
    cutoutArea += params.keywayWidth * params.keywayDepth;
  }

  const netArea = Math.max(0, grossArea - cutoutArea);
  const volume = (netArea * params.plateThickness) / 1000;
  const weightGrams = volume * material.density;

  return {
    netArea: Math.round(netArea * 100) / 100,
    volume: Math.round(volume * 100) / 100,
    weightGrams: Math.round(weightGrams),
    materialName: material.labelEn,
  };
}

// ============================================================================
// Export Helpers
// ============================================================================

/**
 * Export the sprocket model to SVG string for live preview rendering.
 * Uses different colors per layer for visual distinction on dark background.
 */
export function exportToSVG(model: makerjs.IModel): string {
  return makerjs.exporter.toSVG(model, {
    strokeWidth: "0.3mm",
    stroke: "#ef4444", // default red for outline
    useSvgPathOnly: false,
    accuracy: 0.001,
    viewBox: true,
    layerOptions: {
      outline: { stroke: "#ef4444" }, // red — tooth profile
      bore: { stroke: "#fbbf24" }, // amber — bore + keyway
      hub: { stroke: "#f97316" }, // orange — hub circle
      holes: { stroke: "#fb7185" }, // rose — mounting holes
    },
  } as makerjs.exporter.ISVGRenderOptions);
}

/**
 * Export the sprocket model to DXF string for CNC/laser cutting.
 * Uses millimeter units. Features are on separate layers:
 *   - outline: tooth profile (white)
 *   - bore:    center hole + keyway (yellow)
 *   - hub:     hub circle (green)
 *   - holes:   mounting bolt holes (aqua)
 */
export function exportToDXF(model: makerjs.IModel): string {
  return makerjs.exporter.toDXF(model, {
    units: makerjs.unitType.Millimeter,
    accuracy: 0.001,
    usePOLYLINE: false,
    layerOptions: {
      outline: { color: makerjs.exporter.colors.white },
      bore: { color: makerjs.exporter.colors.yellow },
      hub: { color: makerjs.exporter.colors.green },
      holes: { color: makerjs.exporter.colors.aqua },
    },
  });
}

/**
 * Auto-generate a DXF filename.
 * Format: garari_T{teeth}_C{chain}_{timestamp}.dxf
 */
export function generateDxfFilename(params: SprocketParams): string {
  const ts = new Date()
    .toISOString()
    .replace(/[:\-T]/g, "")
    .slice(0, 14);
  return `garari_T${params.numTeeth}_C${params.chainNumber}_${ts}.dxf`;
}
