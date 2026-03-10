// ============================================================================
// ANSI Roller Chain Lookup Table
// ============================================================================
// Standard ANSI chain specifications used for sprocket tooth geometry.
// Pitch = distance between consecutive roller centers (mm)
// Roller Diameter = diameter of the chain roller that sits in the sprocket tooth (mm)

export interface ChainSpec {
  /** ANSI chain number identifier */
  chainNumber: number;
  /** Distance between roller centers in mm */
  pitch: number;
  /** Roller diameter in mm */
  rollerDiameter: number;
  /** Display label for the chain */
  label: string;
}

/**
 * ANSI standard roller chain specifications.
 * These values come from ANSI B29.1 standard.
 */
export const CHAIN_TABLE: ChainSpec[] = [
  { chainNumber: 25, pitch: 6.35, rollerDiameter: 3.18, label: "#25 (¼\" pitch)" },
  { chainNumber: 35, pitch: 9.525, rollerDiameter: 5.08, label: "#35 (⅜\" pitch)" },
  { chainNumber: 40, pitch: 12.7, rollerDiameter: 7.92, label: "#40 (½\" pitch)" },
  { chainNumber: 50, pitch: 15.875, rollerDiameter: 10.16, label: "#50 (⅝\" pitch)" },
  { chainNumber: 60, pitch: 19.05, rollerDiameter: 11.91, label: "#60 (¾\" pitch)" },
  { chainNumber: 80, pitch: 25.4, rollerDiameter: 15.88, label: "#80 (1\" pitch)" },
  { chainNumber: 100, pitch: 31.75, rollerDiameter: 19.05, label: "#100 (1¼\" pitch)" },
];

/**
 * Look up chain specifications by ANSI chain number.
 * Returns undefined if the chain number is not in the table.
 */
export function getChainSpec(chainNumber: number): ChainSpec | undefined {
  return CHAIN_TABLE.find((c) => c.chainNumber === chainNumber);
}
