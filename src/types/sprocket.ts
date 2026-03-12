// ============================================================================
// Sprocket Parameter Types
// ============================================================================

/** All user-configurable parameters for sprocket generation */
export interface SprocketParams {
  // --- Chain ---
  /** ANSI chain number (e.g. 25, 35, 40, 50, 60, 80, 100) */
  chainNumber: number;

  // --- Teeth ---
  /** Number of teeth on the sprocket (8–120) */
  numTeeth: number;

  // --- Bore / Hub ---
  /** Center bore hole diameter in mm */
  boreDiameter: number;
  /** Whether to draw a hub circle around the bore */
  hubEnabled: boolean;
  /** Hub outer diameter in mm (must be > boreDiameter) */
  hubDiameter: number;

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
  /** Density in g/cm³ */
  density: number;
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
}

/** Validation error for a specific parameter */
export interface ValidationError {
  field: string;
  message: string;
}
