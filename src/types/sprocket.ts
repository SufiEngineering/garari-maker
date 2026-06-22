// ============================================================================
// Sprocket Parameter Types
// ============================================================================

/** Chain standard family */
export type ChainStandard = "ansi" | "iso";

/** Lightening (weight-reduction) cutout pattern */
export type LighteningPattern = "none" | "holes" | "spokes";

/** All user-configurable parameters for sprocket generation */
export interface SprocketParams {
  // --- Chain ---
  /** Chain standard family (ANSI imperial or ISO/metric DIN 8187) */
  standard: ChainStandard;
  /** Chain number within the standard (e.g. 40 for ANSI #40, 8 for ISO 08B) */
  chainNumber: number;
  /** Number of chain strands (1 = simplex, 2 = duplex, 3 = triplex) */
  strandCount: number;

  // --- Teeth ---
  /** Number of teeth on the sprocket (8–120) */
  numTeeth: number;
  /** Idler / plain-rim variant — a smooth rim with no shaft features */
  idler: boolean;

  // --- Bore / Hub ---
  /** Center bore hole diameter in mm */
  boreDiameter: number;
  /** Whether to draw a hub circle around the bore */
  hubEnabled: boolean;
  /** Hub outer diameter in mm (must be > boreDiameter) */
  hubDiameter: number;
  /** Hub projects from both faces (affects weight & 3D) */
  hubDoubleSided: boolean;
  /** Hub projection length per side in mm (used for weight & 3D) */
  hubLength: number;
  /** Radial set-screw hole through the hub (spec + 3D only) */
  setScrewEnabled: boolean;
  /** Set-screw tapped hole diameter in mm */
  setScrewDiameter: number;

  // --- Mounting Holes ---
  /** Whether to include bolt-circle mounting holes */
  mountingHolesEnabled: boolean;
  /** Number of bolt holes (3–12) */
  mountingHoleCount: number;
  /** Diameter of each bolt hole in mm */
  mountingHoleDiameter: number;
  /** Bolt circle diameter in mm (center-to-center of holes) */
  boltCircleDiameter: number;

  // --- Keyway ---
  /** Whether to cut a keyway slot into the bore */
  keywayEnabled: boolean;
  /** Keyway width in mm */
  keywayWidth: number;
  /** Keyway depth/height in mm (radial depth from bore surface) */
  keywayDepth: number;

  // --- Lightening (weight reduction) ---
  /** Lightening cutout pattern */
  lighteningPattern: LighteningPattern;
  /** Number of lightening holes / spokes */
  lighteningCount: number;
  /** Diameter (holes) or width (spokes) of the cutout in mm */
  lighteningSize: number;

  // --- Material & Thickness ---
  /** Material key for weight estimation (e.g. "mild_steel") */
  materialKey: string;
  /** Plate thickness in mm */
  plateThickness: number;
}

/** Material specification for weight estimation */
export interface MaterialSpec {
  key: string;
  labelEn: string;
  labelUr: string;
  labelAr: string;
  /** Density in g/cm³ */
  density: number;
  /** Approximate price per kg in USD (for rough cost estimate) */
  pricePerKg: number;
}

/** Calculated sprocket dimensions derived from the parameters */
export interface CalculatedDimensions {
  /** Chain pitch in mm */
  pitch: number;
  /** Roller diameter in mm */
  rollerDiameter: number;
  /** Pitch Diameter: PD = pitch / sin(π / N) */
  pitchDiameter: number;
  /** Outside Diameter: OD ≈ PD + rollerDiameter */
  outsideDiameter: number;
  /** Root Diameter: RD = PD - rollerDiameter */
  rootDiameter: number;
}

/** Estimated weight result */
export interface WeightEstimate {
  /** Net solid area in mm² (after cutouts) */
  netArea: number;
  /** Volume in cm³ */
  volume: number;
  /** Estimated weight in grams */
  weightGrams: number;
  /** Material display name */
  materialName: string;
  /** Rough material cost in USD */
  costUsd: number;
}

/** Severity of a validation entry */
export type Severity = "error" | "warning";

/** Validation issue for a specific parameter */
export interface ValidationError {
  field: string;
  message: string;
  severity?: Severity;
}

/** A saved design stored locally */
export interface SavedDesign {
  id: string;
  name: string;
  params: SprocketParams;
  savedAt: number;
}

/** Two-sprocket drive calculation result */
export interface DriveResult {
  ratio: number;
  drivenRpm: number;
  pitchMm: number;
  /** Chain length in number of pitches (links), rounded up to even */
  chainLinks: number;
  /** Resulting center distance in mm for the rounded link count */
  centerDistanceMm: number;
}
