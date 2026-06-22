// ============================================================================
// Sprocket 3D Mesh — builds Three.js geometry from the 2D profile
// ============================================================================
// Imported lazily (it pulls in Three.js) by Preview3D and the STL exporter.
// ============================================================================

import * as THREE from "three";
import { STLExporter } from "three/examples/jsm/exporters/STLExporter.js";
import type { SprocketParams } from "../types/sprocket";
import { getSprocketProfile } from "./sprocketGeometry";

const SEGS = 64;

function circlePath(cx: number, cy: number, r: number): THREE.Path {
  const p = new THREE.Path();
  for (let i = 0; i <= SEGS; i++) {
    const a = (i / SEGS) * Math.PI * 2;
    const x = cx + r * Math.cos(a);
    const y = cy + r * Math.sin(a);
    if (i === 0) p.moveTo(x, y);
    else p.lineTo(x, y);
  }
  return p;
}

/**
 * Build an extruded sprocket geometry (centered on origin) with bore, mounting
 * holes, keyway and lightening cutouts punched through.
 */
export function buildSprocketGeometry(
  params: SprocketParams
): THREE.ExtrudeGeometry | null {
  const profile = getSprocketProfile(params);
  if (!profile || profile.toothProfile.length < 3) return null;

  const shape = new THREE.Shape();
  const pts = profile.toothProfile;
  shape.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) shape.lineTo(pts[i][0], pts[i][1]);
  shape.closePath();

  // Bore
  shape.holes.push(circlePath(0, 0, profile.boreRadius));

  // Mounting holes
  for (const h of profile.mountingHoles) {
    shape.holes.push(circlePath(h.cx, h.cy, h.r));
  }

  // Lightening circular holes
  for (const c of profile.lighteningCircles) {
    shape.holes.push(circlePath(c.cx, c.cy, c.r));
  }

  // Lightening polygon (spoke) openings
  for (const poly of profile.lighteningPolys) {
    const path = new THREE.Path();
    path.moveTo(poly[0][0], poly[0][1]);
    for (let i = 1; i < poly.length; i++) path.lineTo(poly[i][0], poly[i][1]);
    path.closePath();
    shape.holes.push(path);
  }

  // Keyway
  if (profile.keyway) {
    const k = profile.keyway;
    const kw = new THREE.Path();
    kw.moveTo(-k.halfW, k.innerY);
    kw.lineTo(-k.halfW, k.outerY);
    kw.lineTo(k.halfW, k.outerY);
    kw.lineTo(k.halfW, k.innerY);
    kw.closePath();
    shape.holes.push(kw);
  }

  const depth = (params.plateThickness || 6) * Math.max(1, Math.round(params.strandCount));
  const extrudeSettings: THREE.ExtrudeGeometryOptions = {
    depth,
    bevelEnabled: true,
    bevelThickness: Math.min(0.3, depth * 0.05),
    bevelSize: Math.min(0.3, depth * 0.05),
    bevelSegments: 2,
    curveSegments: 1,
  };

  const geo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  geo.center();
  return geo;
}

/** Export the current sprocket as a binary-free ASCII STL string. */
export function exportSprocketSTL(params: SprocketParams): string | null {
  const geo = buildSprocketGeometry(params);
  if (!geo) return null;
  const mesh = new THREE.Mesh(geo, new THREE.MeshStandardMaterial());
  const exporter = new STLExporter();
  const stl = exporter.parse(mesh);
  geo.dispose();
  return stl;
}
