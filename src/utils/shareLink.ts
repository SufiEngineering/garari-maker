// ============================================================================
// Share Link — encode/decode SprocketParams in the URL hash
// ============================================================================
// Uses compact keys → Base64 JSON to keep URLs short. Older links (without the
// newer fields) still decode, falling back to sensible defaults.
// ============================================================================

import type {
  SprocketParams,
  ChainStandard,
  LighteningPattern,
} from "../types/sprocket";

/** Compact key map — minimises URL length */
interface Compact {
  cn: number;  nt: number;  bd: number;
  he: 0 | 1;   hd: number;
  me: 0 | 1;   mc: number;  md: number;  bc: number;
  ke: 0 | 1;   kw: number;  kd: number;
  mk: string;  pt: number;
  // newer fields (optional for backward compatibility)
  st?: 0 | 1;          // 0 = ansi, 1 = iso
  sc?: number;         // strand count
  id?: 0 | 1;          // idler
  hds?: 0 | 1;         // hub double-sided
  hl?: number;         // hub length
  sse?: 0 | 1;         // set-screw enabled
  ssd?: number;        // set-screw diameter
  lp?: 0 | 1 | 2;      // lightening pattern: none/holes/spokes
  lc?: number;         // lightening count
  ls?: number;         // lightening size
}

const PATTERNS: LighteningPattern[] = ["none", "holes", "spokes"];

export function encodeParams(p: SprocketParams): string {
  const c: Compact = {
    cn: p.chainNumber,   nt: p.numTeeth,        bd: p.boreDiameter,
    he: p.hubEnabled ? 1 : 0,   hd: p.hubDiameter,
    me: p.mountingHolesEnabled ? 1 : 0,
    mc: p.mountingHoleCount,    md: p.mountingHoleDiameter, bc: p.boltCircleDiameter,
    ke: p.keywayEnabled ? 1 : 0,
    kw: p.keywayWidth,  kd: p.keywayDepth,
    mk: p.materialKey,  pt: p.plateThickness,
    st: p.standard === "iso" ? 1 : 0,
    sc: p.strandCount,
    id: p.idler ? 1 : 0,
    hds: p.hubDoubleSided ? 1 : 0,
    hl: p.hubLength,
    sse: p.setScrewEnabled ? 1 : 0,
    ssd: p.setScrewDiameter,
    lp: PATTERNS.indexOf(p.lighteningPattern) as 0 | 1 | 2,
    lc: p.lighteningCount,
    ls: p.lighteningSize,
  };
  return btoa(JSON.stringify(c));
}

export function decodeParams(hash: string): SprocketParams | null {
  try {
    const c: Compact = JSON.parse(atob(hash));
    if (typeof c.cn !== "number" || typeof c.nt !== "number") return null;
    const standard: ChainStandard = c.st === 1 ? "iso" : "ansi";
    return {
      standard,
      chainNumber: c.cn,
      strandCount: c.sc ?? 1,
      numTeeth: c.nt,
      idler: c.id === 1,
      boreDiameter: c.bd ?? 12,
      hubEnabled: c.he === 1,
      hubDiameter: c.hd ?? 25,
      hubDoubleSided: c.hds === 1,
      hubLength: c.hl ?? 10,
      setScrewEnabled: c.sse === 1,
      setScrewDiameter: c.ssd ?? 6,
      mountingHolesEnabled: c.me === 1,
      mountingHoleCount: c.mc ?? 4,
      mountingHoleDiameter: c.md ?? 5,
      boltCircleDiameter: c.bc ?? 40,
      keywayEnabled: c.ke === 1,
      keywayWidth: c.kw ?? 4,
      keywayDepth: c.kd ?? 2.5,
      lighteningPattern: PATTERNS[c.lp ?? 0] ?? "none",
      lighteningCount: c.lc ?? 6,
      lighteningSize: c.ls ?? 10,
      materialKey: c.mk ?? "mild_steel",
      plateThickness: c.pt ?? 6,
    };
  } catch {
    return null;
  }
}

/** Build full shareable URL */
export function buildShareUrl(params: SprocketParams): string {
  return `${window.location.origin}${window.location.pathname}#${encodeParams(params)}`;
}

/** Read params from current URL hash. Returns null if empty/invalid. */
export function readUrlParams(): SprocketParams | null {
  const h = window.location.hash.slice(1);
  if (!h) return null;
  return decodeParams(h);
}
