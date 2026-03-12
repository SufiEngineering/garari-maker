// ============================================================================
// Share Link — encode/decode SprocketParams in the URL hash
// ============================================================================
// Uses compact keys → Base64 JSON to keep URLs short.
// Example: https://gararimaker.bysufi.com/#eyJjbiI6NDAuLi59
// ============================================================================

import type { SprocketParams } from "../types/sprocket";

/** Compact key map — minimises URL length */
interface Compact {
  cn: number;  nt: number;  bd: number;
  he: 0 | 1;   hd: number;
  me: 0 | 1;   mc: number;  md: number;  bc: number;
  ke: 0 | 1;   kw: number;  kd: number;
  mk: string;  pt: number;
}

export function encodeParams(p: SprocketParams): string {
  const c: Compact = {
    cn: p.chainNumber,   nt: p.numTeeth,        bd: p.boreDiameter,
    he: p.hubEnabled ? 1 : 0,   hd: p.hubDiameter,
    me: p.mountingHolesEnabled ? 1 : 0,
    mc: p.mountingHoleCount,    md: p.mountingHoleDiameter, bc: p.boltCircleDiameter,
    ke: p.keywayEnabled ? 1 : 0,
    kw: p.keywayWidth,  kd: p.keywayDepth,
    mk: p.materialKey,  pt: p.plateThickness,
  };
  return btoa(JSON.stringify(c));
}

export function decodeParams(hash: string): SprocketParams | null {
  try {
    const c: Compact = JSON.parse(atob(hash));
    if (typeof c.cn !== "number" || typeof c.nt !== "number") return null;
    return {
      chainNumber: c.cn,
      numTeeth: c.nt,
      boreDiameter: c.bd ?? 12,
      hubEnabled: c.he === 1,
      hubDiameter: c.hd ?? 25,
      mountingHolesEnabled: c.me === 1,
      mountingHoleCount: c.mc ?? 4,
      mountingHoleDiameter: c.md ?? 5,
      boltCircleDiameter: c.bc ?? 40,
      keywayEnabled: c.ke === 1,
      keywayWidth: c.kw ?? 4,
      keywayDepth: c.kd ?? 2.5,
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
