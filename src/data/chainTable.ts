// ============================================================================
// Roller Chain Lookup Table — ANSI (imperial) + ISO/DIN 8187 (metric/British)
// ============================================================================
// Pitch = distance between consecutive roller centers (mm)
// Roller Diameter = diameter of the chain roller that sits in the sprocket tooth (mm)

import type { ChainStandard } from "../types/sprocket";

export interface ChainSpec {
  /** Chain standard family */
  standard: ChainStandard;
  /** Chain number identifier (unique within a standard) */
  chainNumber: number;
  /** Distance between roller centers in mm */
  pitch: number;
  /** Roller diameter in mm */
  rollerDiameter: number;
  /** Lateral spacing between strands for multi-strand chains, in mm */
  strandSpacing: number;
  /** Display label for the chain */
  label: string;
}

/**
 * ANSI B29.1 (imperial) and ISO 606 / DIN 8187 (metric, "B" series — also the
 * British Standard) roller chain specifications.
 */
export const CHAIN_TABLE: ChainSpec[] = [
  // --- ANSI (imperial) ---
  { standard: "ansi", chainNumber: 25,  pitch: 6.35,   rollerDiameter: 3.18,  strandSpacing: 6.4,  label: '#25 (¼" pitch)' },
  { standard: "ansi", chainNumber: 35,  pitch: 9.525,  rollerDiameter: 5.08,  strandSpacing: 10.1, label: '#35 (⅜" pitch)' },
  { standard: "ansi", chainNumber: 40,  pitch: 12.7,   rollerDiameter: 7.92,  strandSpacing: 14.4, label: '#40 (½" pitch)' },
  { standard: "ansi", chainNumber: 50,  pitch: 15.875, rollerDiameter: 10.16, strandSpacing: 18.1, label: '#50 (⅝" pitch)' },
  { standard: "ansi", chainNumber: 60,  pitch: 19.05,  rollerDiameter: 11.91, strandSpacing: 22.8, label: '#60 (¾" pitch)' },
  { standard: "ansi", chainNumber: 80,  pitch: 25.4,   rollerDiameter: 15.88, strandSpacing: 29.3, label: '#80 (1" pitch)' },
  { standard: "ansi", chainNumber: 100, pitch: 31.75,  rollerDiameter: 19.05, strandSpacing: 35.8, label: '#100 (1¼" pitch)' },

  // --- ISO 606 / DIN 8187 (metric "B" series, == British Standard) ---
  { standard: "iso", chainNumber: 5,  pitch: 8.0,   rollerDiameter: 5.0,   strandSpacing: 5.6,  label: "05B (8 mm)" },
  { standard: "iso", chainNumber: 6,  pitch: 9.525, rollerDiameter: 6.35,  strandSpacing: 10.24, label: "06B (9.525 mm)" },
  { standard: "iso", chainNumber: 8,  pitch: 12.7,  rollerDiameter: 8.51,  strandSpacing: 13.92, label: "08B (12.7 mm)" },
  { standard: "iso", chainNumber: 10, pitch: 15.875, rollerDiameter: 10.16, strandSpacing: 16.59, label: "10B (15.875 mm)" },
  { standard: "iso", chainNumber: 12, pitch: 19.05, rollerDiameter: 12.07, strandSpacing: 19.46, label: "12B (19.05 mm)" },
  { standard: "iso", chainNumber: 16, pitch: 25.4,  rollerDiameter: 15.88, strandSpacing: 31.88, label: "16B (25.4 mm)" },
  { standard: "iso", chainNumber: 20, pitch: 31.75, rollerDiameter: 19.05, strandSpacing: 36.45, label: "20B (31.75 mm)" },
];

/** Chains belonging to a given standard. */
export function getChainsByStandard(standard: ChainStandard): ChainSpec[] {
  return CHAIN_TABLE.filter((c) => c.standard === standard);
}

/**
 * Look up chain specifications by standard + chain number.
 * Returns undefined if the chain is not in the table.
 */
export function getChainSpec(
  standard: ChainStandard,
  chainNumber: number
): ChainSpec | undefined {
  return CHAIN_TABLE.find(
    (c) => c.standard === standard && c.chainNumber === chainNumber
  );
}
