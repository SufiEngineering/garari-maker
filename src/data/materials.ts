// ============================================================================
// Material Database — densities (g/cm³) and rough prices (USD/kg)
// ============================================================================
// Prices are coarse market approximations used only for a rough cost estimate.

import type { MaterialSpec } from "../types/sprocket";

export const MATERIALS: MaterialSpec[] = [
  { key: "mild_steel",    labelEn: "Mild Steel (MS)",     labelUr: "مائلڈ سٹیل (MS)",    labelAr: "فولاذ طري",          density: 7.85, pricePerKg: 1.2  },
  { key: "ss_304",        labelEn: "Stainless Steel 304", labelUr: "سٹین لیس سٹیل 304", labelAr: "فولاذ مقاوم 304",   density: 8.00, pricePerKg: 4.5  },
  { key: "ss_316",        labelEn: "Stainless Steel 316", labelUr: "سٹین لیس سٹیل 316", labelAr: "فولاذ مقاوم 316",   density: 8.00, pricePerKg: 6.0  },
  { key: "aluminum_6061", labelEn: "Aluminum 6061",       labelUr: "ایلومینیم 6061",     labelAr: "ألمنيوم 6061",       density: 2.70, pricePerKg: 3.0  },
  { key: "aluminum_7075", labelEn: "Aluminum 7075",       labelUr: "ایلومینیم 7075",     labelAr: "ألمنيوم 7075",       density: 2.81, pricePerKg: 5.5  },
  { key: "cast_iron",     labelEn: "Cast Iron",           labelUr: "کاسٹ آئرن",         labelAr: "حديد زهر",           density: 7.20, pricePerKg: 1.0  },
  { key: "brass",         labelEn: "Brass",               labelUr: "پیتل",              labelAr: "نحاس أصفر",          density: 8.50, pricePerKg: 8.0  },
  { key: "nylon",         labelEn: "Nylon / Delrin",      labelUr: "نائلون / ڈیلرن",     labelAr: "نايلون / دلرين",     density: 1.14, pricePerKg: 4.0  },
  { key: "hardox",        labelEn: "Hardox 400/500",      labelUr: "ہارڈوکس 400/500",   labelAr: "هاردوكس 400/500",   density: 7.85, pricePerKg: 2.5  },
];

/** Get a material spec by key. Defaults to mild steel. */
export function getMaterial(key: string): MaterialSpec {
  return MATERIALS.find((m) => m.key === key) ?? MATERIALS[0];
}
