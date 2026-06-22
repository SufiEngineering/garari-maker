// ============================================================================
// Involute Spur Gear Generator
// ============================================================================
// A sister tool to the sprocket engine. Produces a standard involute spur gear
// profile (ISO module system) as a Maker.js model for SVG/DXF export.
//
//   m  = module (mm)            pitch diameter d = m·N
//   N  = number of teeth        base diameter   db = d·cos(φ)
//   φ  = pressure angle         addendum a = m,  dedendum b = 1.25·m
// ============================================================================

import makerjs from "makerjs";
import type { ValidationError, WeightEstimate } from "../types/sprocket";
import { getMaterial } from "../data/materials";

export interface GearParams {
  module: number;
  numTeeth: number;
  pressureAngle: number; // degrees
  boreDiameter: number;
  plateThickness: number;
  materialKey: string;
}

export interface GearDimensions {
  pitchDiameter: number;
  baseDiameter: number;
  outsideDiameter: number;
  rootDiameter: number;
}

export const DEFAULT_GEAR: GearParams = {
  module: 2,
  numTeeth: 20,
  pressureAngle: 20,
  boreDiameter: 8,
  plateThickness: 6,
  materialKey: "mild_steel",
};

const inv = (a: number) => Math.tan(a) - a;

export function calcGearDimensions(p: GearParams): GearDimensions {
  const d = p.module * p.numTeeth;
  return {
    pitchDiameter: d,
    baseDiameter: d * Math.cos((p.pressureAngle * Math.PI) / 180),
    outsideDiameter: d + 2 * p.module,
    rootDiameter: d - 2.5 * p.module,
  };
}

export function validateGear(p: GearParams): ValidationError[] {
  const errors: ValidationError[] = [];
  const dim = calcGearDimensions(p);
  if (p.numTeeth < 6 || p.numTeeth > 200)
    errors.push({ field: "numTeeth", message: "Teeth must be 6–200" });
  if (p.module <= 0) errors.push({ field: "module", message: "Module must be > 0" });
  if (p.boreDiameter <= 0)
    errors.push({ field: "boreDiameter", message: "Bore must be > 0" });
  if (p.boreDiameter >= dim.rootDiameter)
    errors.push({
      field: "boreDiameter",
      message: `Bore must be < root diameter (${dim.rootDiameter.toFixed(2)} mm)`,
    });
  if (p.numTeeth < 17)
    errors.push({
      field: "numTeeth",
      severity: "warning",
      message: "Below 17 teeth, standard gears undercut — profile is approximate.",
    });
  return errors;
}

/** Build the involute gear outline points (closed polygon). */
function gearOutlinePoints(p: GearParams): [number, number][] {
  const dim = calcGearDimensions(p);
  const N = p.numTeeth;
  const phi = (p.pressureAngle * Math.PI) / 180;
  const rBase = dim.baseDiameter / 2;
  const rOut = dim.outsideDiameter / 2;
  const rRoot = Math.max(dim.rootDiameter / 2, 0.5);
  const invPhi = inv(phi);
  const halfTooth = Math.PI / (2 * N); // half tooth angle at pitch circle

  // Right-flank angle (relative to tooth center) at radius r ≥ rBase
  const angleR = (r: number) => {
    const ar = Math.acos(Math.min(rBase / r, 1));
    return halfTooth + invPhi - inv(ar);
  };

  const STEPS = 12;
  const rStart = Math.max(rBase, rRoot);
  const pts: [number, number][] = [];
  const toothAngle = (2 * Math.PI) / N;

  for (let i = 0; i < N; i++) {
    const center = i * toothAngle;
    const rootHalf = angleR(rStart);

    // root corner (right)
    pts.push([rRoot * Math.cos(center + rootHalf), rRoot * Math.sin(center + rootHalf)]);
    // right flank rStart → rOut
    for (let s = 0; s <= STEPS; s++) {
      const r = rStart + ((rOut - rStart) * s) / STEPS;
      const a = center + angleR(r);
      pts.push([r * Math.cos(a), r * Math.sin(a)]);
    }
    // tip arc +angleR(rOut) → -angleR(rOut)
    const tip = angleR(rOut);
    for (let s = 0; s <= 4; s++) {
      const a = center + tip - (2 * tip * s) / 4;
      pts.push([rOut * Math.cos(a), rOut * Math.sin(a)]);
    }
    // left flank rOut → rStart
    for (let s = 0; s <= STEPS; s++) {
      const r = rOut - ((rOut - rStart) * s) / STEPS;
      const a = center - angleR(r);
      pts.push([r * Math.cos(a), r * Math.sin(a)]);
    }
    // root corner (left)
    pts.push([rRoot * Math.cos(center - rootHalf), rRoot * Math.sin(center - rootHalf)]);
  }
  return pts;
}

export function buildGearModel(p: GearParams): makerjs.IModel {
  const pts = gearOutlinePoints(p);
  const outline: makerjs.IModel = { paths: {} };
  for (let i = 0; i < pts.length; i++) {
    const next = (i + 1) % pts.length;
    outline.paths![`seg_${i}`] = new makerjs.paths.Line(pts[i], pts[next]);
    outline.paths![`seg_${i}`].layer = "outline";
  }

  const bore: makerjs.IModel = {
    paths: { bore: new makerjs.paths.Circle([0, 0], p.boreDiameter / 2) },
  };
  bore.paths!.bore.layer = "bore";

  return {
    models: { gear: outline, bore },
    units: makerjs.unitType.Millimeter,
  };
}

export function exportGearSVG(p: GearParams): string {
  return makerjs.exporter.toSVG(buildGearModel(p), {
    strokeWidth: "0.3mm",
    accuracy: 0.001,
    viewBox: true,
    layerOptions: {
      outline: { stroke: "#ef4444" },
      bore: { stroke: "#fbbf24" },
    },
  } as makerjs.exporter.ISVGRenderOptions);
}

export function exportGearDXF(p: GearParams): string {
  return makerjs.exporter.toDXF(buildGearModel(p), {
    units: makerjs.unitType.Millimeter,
    accuracy: 0.001,
    layerOptions: {
      outline: { color: makerjs.exporter.colors.white },
      bore: { color: makerjs.exporter.colors.yellow },
    },
  });
}

export function estimateGearWeight(p: GearParams): WeightEstimate {
  const material = getMaterial(p.materialKey);
  const dim = calcGearDimensions(p);
  const rOut = dim.outsideDiameter / 2;
  const rRoot = dim.rootDiameter / 2;
  const boreR = p.boreDiameter / 2;
  const core = Math.PI * rRoot * rRoot;
  const ring = Math.PI * (rOut * rOut - rRoot * rRoot) * 0.5;
  const netArea = Math.max(0, core + ring - Math.PI * boreR * boreR);
  const volume = (netArea * p.plateThickness) / 1000;
  const weightGrams = volume * material.density;
  return {
    netArea: Math.round(netArea * 100) / 100,
    volume: Math.round(volume * 100) / 100,
    weightGrams: Math.round(weightGrams),
    materialName: material.labelEn,
    costUsd: Math.round((weightGrams / 1000) * material.pricePerKg * 100) / 100,
  };
}

export function gearFilename(p: GearParams): string {
  const ts = new Date().toISOString().replace(/[:\-T]/g, "").slice(0, 14);
  return `gear_m${p.module}_T${p.numTeeth}_${ts}.dxf`;
}
