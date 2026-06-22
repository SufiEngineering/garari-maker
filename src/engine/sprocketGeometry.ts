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
  DriveResult,
} from "../types/sprocket";
import { getChainSpec } from "../data/chainTable";
import { getMaterial } from "../data/materials";

// ============================================================================
// Shared feature colours — used by the SVG/DXF export, the 2D dimension
// overlay legend, and the parameter-panel swatches so the left panel matches
// what is drawn in the preview.
// ============================================================================
export const LAYER_COLORS = {
  outline: "#ef4444", // red — tooth profile
  bore: "#fbbf24", // amber — bore + keyway
  hub: "#f97316", // orange — hub circle
  holes: "#fb7185", // rose — mounting holes
  lightening: "#a78bfa", // violet — lightening cutouts
} as const;

export const DIM_COLORS = {
  od: "#22d3ee", // cyan — outside diameter
  pd: "#4ade80", // green — pitch diameter
  rd: "#facc15", // yellow — root diameter
  bcd: "#c084fc", // purple — bolt circle
} as const;

// ============================================================================
// Calculation Helpers
// ============================================================================

/**
 * Calculate derived sprocket dimensions from user parameters.
 */
export function calculateDimensions(
  params: SprocketParams
): CalculatedDimensions | null {
  const spec = getChainSpec(params.standard, params.chainNumber);
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

  // --- Advisory warnings (non-blocking manufacturability hints) ---
  if (params.numTeeth < 17 && params.numTeeth >= 8) {
    errors.push({
      field: "numTeeth",
      severity: "warning",
      message:
        "Fewer than 17 teeth increases chordal action and wear — use only for slow drives.",
    });
  }
  if (params.boreDiameter >= dims.rootDiameter * 0.85) {
    errors.push({
      field: "boreDiameter",
      severity: "warning",
      message: "Bore is close to the root circle — thin web may be weak.",
    });
  }
  if (params.keywayEnabled && !params.idler) {
    const remainingWall = (dims.rootDiameter - params.boreDiameter) / 2 - params.keywayDepth;
    if (remainingWall < params.boreDiameter * 0.1) {
      errors.push({
        field: "keywayDepth",
        severity: "warning",
        message: "Keyway leaves a thin wall to the root circle — risk of cracking.",
      });
    }
  }
  if (params.hubEnabled && !params.idler && params.mountingHolesEnabled) {
    const bcInner = params.boltCircleDiameter / 2 - params.mountingHoleDiameter / 2;
    if (bcInner <= params.hubDiameter / 2) {
      errors.push({
        field: "boltCircleDiameter",
        severity: "warning",
        message: "Mounting holes overlap the hub circle.",
      });
    }
  }

  return errors;
}

/** True if there are blocking errors (warnings are ignored). */
export function hasBlockingErrors(errors: ValidationError[]): boolean {
  return errors.some((e) => e.severity !== "warning");
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
  // 2. BORE — plain circle, or a single merged "keyhole" contour when a
  //    keyway is enabled (one closed loop, no overlapping cut lines)
  // ================================================================
  const keywayActive =
    !params.idler &&
    params.keywayEnabled &&
    params.keywayWidth > 0 &&
    params.keywayDepth > 0 &&
    params.keywayWidth < params.boreDiameter;

  const bore: makerjs.IModel = keywayActive
    ? buildKeyholeBore(
        params.boreDiameter / 2,
        params.keywayWidth,
        params.keywayDepth
      )
    : {
        paths: {
          bore: new makerjs.paths.Circle([0, 0], params.boreDiameter / 2),
        },
      };
  assignLayer(bore, "bore");
  makerjs.model.addModel(model, bore, "bore");

  // ================================================================
  // 3. HUB CIRCLE (optional) — raised area around bore
  // ================================================================
  if (!params.idler && params.hubEnabled && params.hubDiameter > params.boreDiameter) {
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
  // 5. LIGHTENING CUTOUTS (optional) — holes or spokes for weight reduction
  // ================================================================
  const lightening = computeLightening(params, dims);
  if (lightening.circles.length > 0 || lightening.polys.length > 0) {
    const lm: makerjs.IModel = { paths: {}, models: {} };
    lightening.circles.forEach((c, i) => {
      lm.paths![`lh_${i}`] = new makerjs.paths.Circle([c.cx, c.cy], c.r);
    });
    lightening.polys.forEach((poly, i) => {
      const pm: makerjs.IModel = { paths: {} };
      for (let j = 0; j < poly.length; j++) {
        const next = (j + 1) % poly.length;
        pm.paths![`s_${j}`] = new makerjs.paths.Line(poly[j], poly[next]);
      }
      lm.models![`lp_${i}`] = pm;
    });
    assignLayer(lm, "lightening");
    makerjs.model.addModel(model, lm, "lightening");
  }

  return model;
}

// ============================================================================
// Lightening (weight-reduction) cutouts
// ============================================================================

interface LighteningGeometry {
  circles: { cx: number; cy: number; r: number }[];
  polys: [number, number][][];
}

/**
 * Compute lightening cutouts placed in the web between the hub/bore and the
 * tooth root circle. "holes" → ring of circular holes; "spokes" → annular
 * sector openings leaving radial spoke arms.
 */
export function computeLightening(
  params: SprocketParams,
  dims: CalculatedDimensions
): LighteningGeometry {
  const out: LighteningGeometry = { circles: [], polys: [] };
  if (params.idler) return out;
  if (params.lighteningPattern === "none" || params.lighteningCount < 1) return out;

  const rootR = dims.rootDiameter / 2;
  const innerEdge =
    (params.hubEnabled ? params.hubDiameter : params.boreDiameter) / 2;
  const bandInner = innerEdge + 4;
  const bandOuter = rootR - 4;
  if (bandOuter - bandInner < 5) return out; // not enough room

  const ringR = (bandInner + bandOuter) / 2;
  const n = Math.max(1, Math.round(params.lighteningCount));

  if (params.lighteningPattern === "holes") {
    const maxByBand = bandOuter - bandInner;
    const chord = 2 * ringR * Math.sin(Math.PI / n); // spacing between centers
    const d = Math.min(params.lighteningSize, maxByBand, chord * 0.8);
    if (d < 1) return out;
    for (let i = 0; i < n; i++) {
      const a = (i * 2 * Math.PI) / n;
      out.circles.push({
        cx: ringR * Math.cos(a),
        cy: ringR * Math.sin(a),
        r: d / 2,
      });
    }
  } else {
    // spokes: each opening is an annular sector; spoke arm width = lighteningSize
    const armHalfAngle = Math.asin(
      Math.min(params.lighteningSize / (2 * ringR), 0.9)
    );
    const sector = (2 * Math.PI) / n;
    const openHalf = sector / 2 - armHalfAngle;
    if (openHalf <= 0.05) return out;
    const rIn = bandInner;
    const rOut = bandOuter;
    const ARC = 8;
    for (let i = 0; i < n; i++) {
      const center = (i + 0.5) * sector;
      const poly: [number, number][] = [];
      // outer arc, left → right
      for (let k = 0; k <= ARC; k++) {
        const a = center - openHalf + (2 * openHalf * k) / ARC;
        poly.push([rOut * Math.cos(a), rOut * Math.sin(a)]);
      }
      // inner arc, right → left
      for (let k = 0; k <= ARC; k++) {
        const a = center + openHalf - (2 * openHalf * k) / ARC;
        poly.push([rIn * Math.cos(a), rIn * Math.sin(a)]);
      }
      out.polys.push(poly);
    }
  }
  return out;
}

/** Shoelace area of a polygon. */
function polygonArea(poly: [number, number][]): number {
  let a = 0;
  for (let i = 0; i < poly.length; i++) {
    const [x1, y1] = poly[i];
    const [x2, y2] = poly[(i + 1) % poly.length];
    a += x1 * y2 - x2 * y1;
  }
  return Math.abs(a) / 2;
}

/**
 * Build the bore as a single closed "keyhole" contour: the major arc of the
 * bore circle (everything except the small top arc) joined to the keyway notch
 * at 12 o'clock (+Y). This avoids the overlapping cut lines you would get by
 * drawing a full circle plus a separate keyway rectangle — important for
 * laser/CNC where coincident lines cause double cuts.
 *
 * @param boreRadius - Bore hole radius
 * @param width      - Keyway width (tangential)
 * @param depth      - Keyway depth (radial, outward from bore surface)
 */
function buildKeyholeBore(
  boreRadius: number,
  width: number,
  depth: number
): makerjs.IModel {
  const halfW = width / 2;
  // Where the keyway sides meet the bore circle
  const innerY = Math.sqrt(Math.max(boreRadius * boreRadius - halfW * halfW, 0));
  const outerY = boreRadius + depth;

  const bl: makerjs.IPoint = [-halfW, innerY];
  const br: makerjs.IPoint = [halfW, innerY];
  const tl: makerjs.IPoint = [-halfW, outerY];
  const tr: makerjs.IPoint = [halfW, outerY];

  // Angles (degrees) of bl and br on the bore circle.
  const toDeg = (r: number) => (r * 180) / Math.PI;
  const angBl = toDeg(Math.atan2(innerY, -halfW)); // ~ second quadrant
  const angBr = toDeg(Math.atan2(innerY, halfW)); //  ~ first quadrant

  // Arc CCW from bl → (around the bottom) → br = the major arc (skips the top).
  const arc = new makerjs.paths.Arc([0, 0], boreRadius, angBl, angBr);

  // Keyway notch: br → up to tr → across to tl → down to bl
  return {
    paths: {
      arc,
      right: new makerjs.paths.Line(br, tr),
      top: new makerjs.paths.Line(tr, tl),
      left: new makerjs.paths.Line(tl, bl),
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
  lighteningCircles: { cx: number; cy: number; r: number }[];
  lighteningPolys: [number, number][][];
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
  const hubRadius = !params.idler && params.hubEnabled && params.hubDiameter > params.boreDiameter
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
  const keyway = !params.idler && params.keywayEnabled && params.keywayWidth > 0 && params.keywayDepth > 0
    ? {
        halfW: params.keywayWidth / 2,
        innerY: Math.sqrt(Math.max(boreRadius * boreRadius - (params.keywayWidth / 2) ** 2, 0)),
        outerY: boreRadius + params.keywayDepth,
      }
    : null;

  // Lightening cutouts
  const lightening = computeLightening(params, dims);

  return {
    toothProfile,
    boreRadius,
    hubRadius,
    mountingHoles,
    keyway,
    lighteningCircles: lightening.circles,
    lighteningPolys: lightening.polys,
  };
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

  const grossArea = coreArea + effectiveToothArea;
  let cutoutArea = Math.PI * boreR * boreR;

  if (params.mountingHolesEnabled) {
    const holeR = params.mountingHoleDiameter / 2;
    cutoutArea += params.mountingHoleCount * Math.PI * holeR * holeR;
  }
  if (params.keywayEnabled && !params.idler) {
    cutoutArea += params.keywayWidth * params.keywayDepth;
  }

  // Lightening cutouts
  const lightening = computeLightening(params, dims);
  for (const c of lightening.circles) cutoutArea += Math.PI * c.r * c.r;
  for (const p of lightening.polys) cutoutArea += polygonArea(p);

  const netArea = Math.max(0, grossArea - cutoutArea);
  // Plate volume, scaled by strand count (multi-strand sprockets stack plates)
  const strands = Math.max(1, Math.round(params.strandCount));
  let volume = (netArea * params.plateThickness * strands) / 1000;

  // Hub projection beyond the plate adds material
  if (!params.idler && params.hubEnabled && params.hubDiameter > params.boreDiameter) {
    const hubR = params.hubDiameter / 2;
    const hubRingArea = Math.PI * (hubR * hubR - boreR * boreR);
    const sides = params.hubDoubleSided ? 2 : 1;
    volume += (hubRingArea * Math.max(0, params.hubLength) * sides) / 1000;
  }

  const weightGrams = volume * material.density;
  const costUsd = (weightGrams / 1000) * material.pricePerKg;

  return {
    netArea: Math.round(netArea * 100) / 100,
    volume: Math.round(volume * 100) / 100,
    weightGrams: Math.round(weightGrams),
    materialName: material.labelEn,
    costUsd: Math.round(costUsd * 100) / 100,
  };
}

// ============================================================================
// Drive / Ratio Calculator
// ============================================================================

/**
 * Compute drive ratio, driven RPM and required chain length / center distance
 * for a two-sprocket drive. Chain length uses the standard approximation and is
 * rounded up to an even number of pitches (links).
 *
 * @param driverTeeth   teeth on the driving sprocket
 * @param drivenTeeth   teeth on the driven sprocket
 * @param driverRpm     input speed (RPM)
 * @param pitchMm       chain pitch (mm)
 * @param centerMm      desired center distance (mm)
 */
export function computeDrive(
  driverTeeth: number,
  drivenTeeth: number,
  driverRpm: number,
  pitchMm: number,
  centerMm: number
): DriveResult {
  const ratio = drivenTeeth / driverTeeth;
  const drivenRpm = driverRpm / ratio;

  // Center distance in pitches
  const C = centerMm / pitchMm;
  const N1 = driverTeeth;
  const N2 = drivenTeeth;
  // L = 2C + (N1+N2)/2 + ((N2-N1)/2π)² / C   (in pitches)
  const Lraw =
    2 * C +
    (N1 + N2) / 2 +
    Math.pow((N2 - N1) / (2 * Math.PI), 2) / C;
  const chainLinks = Math.ceil(Lraw / 2) * 2; // round up to even

  // Recompute the actual center distance for the rounded link count.
  const L = chainLinks;
  const p1 = L - (N1 + N2) / 2;
  const term = p1 * p1 - 8 * Math.pow((N2 - N1) / (2 * Math.PI), 2);
  const Cpitches = term > 0 ? (p1 + Math.sqrt(term)) / 4 : C;

  return {
    ratio: Math.round(ratio * 1000) / 1000,
    drivenRpm: Math.round(drivenRpm * 10) / 10,
    pitchMm,
    chainLinks,
    centerDistanceMm: Math.round(Cpitches * pitchMm * 100) / 100,
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
      outline: { stroke: LAYER_COLORS.outline },
      bore: { stroke: LAYER_COLORS.bore },
      hub: { stroke: LAYER_COLORS.hub },
      holes: { stroke: LAYER_COLORS.holes },
      lightening: { stroke: LAYER_COLORS.lightening },
      dimOD: { stroke: DIM_COLORS.od },
      dimPD: { stroke: DIM_COLORS.pd },
      dimRD: { stroke: DIM_COLORS.rd },
      dimBCD: { stroke: DIM_COLORS.bcd },
    },
  } as makerjs.exporter.ISVGRenderOptions);
}

/**
 * Export an SVG with faint reference circles for OD / PD / RD / bolt-circle,
 * each on its own colour layer (see DimensionOverlay legend).
 */
export function exportDimensionedSVG(params: SprocketParams): string {
  const model = buildSprocketModel(params);
  const dims = calculateDimensions(params);
  if (!model || !dims) return "";

  const addCircle = (layer: string, dia: number) => {
    const m: makerjs.IModel = {
      paths: { c: new makerjs.paths.Circle([0, 0], dia / 2) },
    };
    m.paths!.c.layer = layer;
    makerjs.model.addModel(model, m, layer);
  };
  addCircle("dimOD", dims.outsideDiameter);
  addCircle("dimPD", dims.pitchDiameter);
  addCircle("dimRD", dims.rootDiameter);
  if (params.mountingHolesEnabled) addCircle("dimBCD", params.boltCircleDiameter);

  return exportToSVG(model);
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
      lightening: { color: makerjs.exporter.colors.fuchsia },
    },
  });
}

/**
 * Export several copies of a model nested in a grid on a single sheet — useful
 * for laser/CNC batch cutting. Copies are spaced by the part size plus a gap.
 */
export function exportNestedDXF(
  base: makerjs.IModel,
  count: number,
  gapMm: number
): string {
  const measure = makerjs.measure.modelExtents(base);
  const w = measure ? measure.high[0] - measure.low[0] : 100;
  const h = measure ? measure.high[1] - measure.low[1] : 100;
  const cols = Math.max(1, Math.ceil(Math.sqrt(count)));

  const sheet: makerjs.IModel = { models: {}, units: makerjs.unitType.Millimeter };
  for (let i = 0; i < count; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const clone = makerjs.cloneObject(base);
    makerjs.model.moveRelative(clone, [col * (w + gapMm), row * (h + gapMm)]);
    sheet.models![`part_${i}`] = clone;
  }
  return exportToDXF(sheet);
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
  const std = params.standard === "iso" ? "ISO" : "C";
  return `garari_T${params.numTeeth}_${std}${params.chainNumber}_${ts}.dxf`;
}
