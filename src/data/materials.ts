// ============================================================================
// Material Database — densities for weight estimation
// ============================================================================

import type { MaterialSpec } from "../types/sprocket";

export const MATERIALS: MaterialSpec[] = [
  { key: "mild_steel",     labelEn: "Mild Steel (MS)",       labelUr: "مائلڈ سٹیل (MS)",       density: 7.85  },
  { key: "ss_304",         labelEn: "Stainless Steel 304",   labelUr: "سٹین لیس سٹیل 304",    density: 8.00  },
  { key: "ss_316",         labelEn: "Stainless Steel 316",   labelUr: "سٹین لیس سٹیل 316",    density: 8.00  },
  { key: "aluminum_6061",  labelEn: "Aluminum 6061",         labelUr: "ایلومینیم 6061",         density: 2.70  },
  { key: "aluminum_7075",  labelEn: "Aluminum 7075",         labelUr: "ایلومینیم 7075",         density: 2.81  },
  { key: "cast_iron",      labelEn: "Cast Iron",             labelUr: "کاسٹ آئرن",             density: 7.20  },
  { key: "brass",          labelEn: "Brass",                 labelUr: "پیتل",                  density: 8.50  },
  { key: "nylon",          labelEn: "Nylon / Delrin",        labelUr: "نائلون / ڈیلرن",        density: 1.14  },
  { key: "hardox",         labelEn: "Hardox 400/500",        labelUr: "ہارڈوکس 400/500",       density: 7.85  },
];

/** Get a material spec by key. Defaults to mild steel. */
export function getMaterial(key: string): MaterialSpec {
  return MATERIALS.find((m) => m.key === key) ?? MATERIALS[0];
}
