// ============================================================================
// Saved Designs — local (browser) persistence of sprocket configurations
// ============================================================================

import type { SavedDesign, SprocketParams } from "../types/sprocket";

const KEY = "gm_saved_designs";

export function loadDesigns(): SavedDesign[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function persist(designs: SavedDesign[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(designs));
  } catch {
    /* storage full or unavailable — ignore */
  }
}

export function saveDesign(name: string, params: SprocketParams): SavedDesign[] {
  const designs = loadDesigns();
  const design: SavedDesign = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: name.trim() || "Untitled",
    params,
    savedAt: Date.now(),
  };
  const next = [design, ...designs].slice(0, 50);
  persist(next);
  return next;
}

export function deleteDesign(id: string): SavedDesign[] {
  const next = loadDesigns().filter((d) => d.id !== id);
  persist(next);
  return next;
}
