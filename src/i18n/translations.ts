// ============================================================================
// Bilingual Translations — English & Urdu
// ============================================================================

export type Lang = "en" | "ur";

export interface Translations {
  // App header
  appName: string;
  appSubtitle: string;
  poweredBy: string;
  sufiEngineering: string;

  // Mobile tabs
  tabParameters: string;
  tabPreview: string;

  // Section headers
  sectionChain: string;
  sectionTeeth: string;
  sectionBoreHub: string;
  sectionMountingHoles: string;
  sectionKeyway: string;
  sectionCalculated: string;
  sectionOrder: string;

  // Chain
  chainNumber: string;
  pitch: string;
  rollerDiameter: string;

  // Teeth
  numberOfTeeth: string;

  // Bore & Hub
  boreDiameter: string;
  hubCircle: string;
  hubDiameter: string;

  // Mounting Holes
  enableBoltHoles: string;
  numberOfHoles: string;
  holeDiameter: string;
  boltCircleDiameter: string;

  // Keyway
  enableKeyway: string;
  keywayWidth: string;
  keywayDepth: string;

  // Calculated
  pitchDiameter: string;
  outsideDiameter: string;
  rootDiameter: string;

  // Export
  downloadDxf: string;
  fixErrors: string;
  freeTool: string;

  // Preview
  livePreview: string;
  previewNote: string;
  adjustToPreview: string;

  // Order section
  quantity: string;
  quantityUnit: string;
  orderViaWhatsApp: string;
  orderDescription: string;

  // Download Modal
  dxfDownloaded: string;
  fileReady: string;
  needManufactured: string;
  manufacturingDesc: string;
  whatsappSufi: string;
  emailDxf: string;
  visitWebsite: string;
  close: string;
  orOrderDirectly: string;
  manufacturingCta: string;

  // Language toggle
  langLabel: string;

  // Material & Weight
  sectionMaterial: string;
  material: string;
  plateThickness: string;
  sectionWeight: string;
  estimatedWeight: string;
  netArea: string;
  volume: string;

  // Share
  shareLink: string;
  linkCopied: string;

  // 2D / 3D toggle
  view2d: string;
  view3d: string;
  previewNote3d: string;
}

export const translations: Record<Lang, Translations> = {
  en: {
    appName: "Garari Maker",
    appSubtitle: "PRECISION SPROCKET DXF GENERATOR",
    poweredBy: "Powered by",
    sufiEngineering: "Sufi Engineering",

    tabParameters: "⚙️ Parameters",
    tabPreview: "👁️ Preview",

    sectionChain: "Chain",
    sectionTeeth: "Teeth",
    sectionBoreHub: "Bore & Hub",
    sectionMountingHoles: "Mounting Holes",
    sectionKeyway: "Keyway",
    sectionCalculated: "Calculated Dimensions",
    sectionOrder: "Order Sprocket",

    chainNumber: "Chain Number",
    pitch: "Pitch",
    rollerDiameter: "Roller ⌀",

    numberOfTeeth: "Number of Teeth",

    boreDiameter: "Bore Diameter",
    hubCircle: "Hub Circle",
    hubDiameter: "Hub Diameter",

    enableBoltHoles: "Enable Bolt Holes",
    numberOfHoles: "Number of Holes",
    holeDiameter: "Hole Diameter",
    boltCircleDiameter: "Bolt Circle Diameter",

    enableKeyway: "Enable Keyway",
    keywayWidth: "Keyway Width",
    keywayDepth: "Keyway Depth",

    pitchDiameter: "Pitch Diameter",
    outsideDiameter: "Outside Diameter",
    rootDiameter: "Root Diameter",

    downloadDxf: "📥 Download DXF",
    fixErrors: "Fix errors before exporting",
    freeTool: "Free tool by Sufi Engineering",

    livePreview: "🔍 Live Preview",
    previewNote: "SVG preview — download DXF for CNC use",
    adjustToPreview: "Adjust parameters to see preview",

    quantity: "Quantity Needed",
    quantityUnit: "pcs",
    orderViaWhatsApp: "📱 Order via WhatsApp",
    orderDescription:
      "Want physical sprockets? Sufi Engineering will manufacture and ship them to you!",

    dxfDownloaded: "DXF Downloaded!",
    fileReady: "Your sprocket file is ready.",
    needManufactured: "Need it manufactured?",
    manufacturingDesc:
      "Send this DXF file to Sufi Engineering and get your sprocket CNC-machined in steel, aluminum, or stainless steel. Fast turnaround, precision guaranteed.",
    whatsappSufi: "WhatsApp Sufi Engineering",
    emailDxf: "Email Your DXF File",
    visitWebsite: "sufi.engineering",
    close: "Close",
    orOrderDirectly: "Or order directly — we'll manufacture and ship to you!",
    manufacturingCta:
      "Tell us the quantity, and we'll make and ship your sprockets.",
    langLabel: "اردو",

    sectionMaterial: "Material & Thickness",
    material: "Material",
    plateThickness: "Plate Thickness",
    sectionWeight: "Weight Estimate",
    estimatedWeight: "Estimated Weight",
    netArea: "Net Area",
    volume: "Volume",

    shareLink: "🔗 Copy Share Link",
    linkCopied: "✅ Link Copied!",

    view2d: "2D",
    view3d: "3D",
    previewNote3d: "3D preview — drag to rotate, scroll to zoom",
  },

  ur: {
    appName: "گراری میکر",
    appSubtitle: "اسپراکٹ DXF جنریٹر",
    poweredBy: "تیار کردہ",
    sufiEngineering: "صوفی انجینئرنگ",

    tabParameters: "⚙️ پیرامیٹرز",
    tabPreview: "👁️ پیش نظارہ",

    sectionChain: "چین",
    sectionTeeth: "دانتے",
    sectionBoreHub: "بور اور ہب",
    sectionMountingHoles: "بولٹ سوراخ",
    sectionKeyway: "کی وے",
    sectionCalculated: "حسابی پیمائشیں",
    sectionOrder: "گراری آرڈر کریں",

    chainNumber: "چین نمبر",
    pitch: "پچ",
    rollerDiameter: "رولر قطر",

    numberOfTeeth: "دانتوں کی تعداد",

    boreDiameter: "بور قطر",
    hubCircle: "ہب دائرہ",
    hubDiameter: "ہب قطر",

    enableBoltHoles: "بولٹ سوراخ شامل کریں",
    numberOfHoles: "سوراخوں کی تعداد",
    holeDiameter: "سوراخ قطر",
    boltCircleDiameter: "بولٹ سرکل قطر",

    enableKeyway: "کی وے شامل کریں",
    keywayWidth: "کی وے چوڑائی",
    keywayDepth: "کی وے گہرائی",

    pitchDiameter: "پچ قطر",
    outsideDiameter: "بیرونی قطر",
    rootDiameter: "جڑ قطر",

    downloadDxf: "📥 DXF ڈاؤن لوڈ کریں",
    fixErrors: "ایکسپورٹ سے پہلے غلطیاں ٹھیک کریں",
    freeTool: "صوفی انجینئرنگ کا مفت ٹول",

    livePreview: "🔍 براہ راست نظارہ",
    previewNote: "SVG پیش نظارہ — CNC کے لیے DXF ڈاؤن لوڈ کریں",
    adjustToPreview: "پیش نظارہ دیکھنے کے لیے پیرامیٹرز ایڈجسٹ کریں",

    quantity: "مطلوبہ تعداد",
    quantityUnit: "عدد",
    orderViaWhatsApp: "📱 واٹس ایپ پر آرڈر کریں",
    orderDescription:
      "اصلی گراری چاہیے؟ صوفی انجینئرنگ بنا کر آپ کو بھجوائے گی!",

    dxfDownloaded: "!DXF ڈاؤن لوڈ ہو گئی",
    fileReady: "آپ کی اسپراکٹ فائل تیار ہے۔",
    needManufactured: "بنوانا چاہتے ہیں؟",
    manufacturingDesc:
      "صوفی انجینئرنگ کو یہ DXF فائل بھیجیں اور اپنی گراری اسٹیل، ایلومینیم یا سٹینلیس اسٹیل میں CNC سے بنوائیں۔ تیز ترسیل، درستگی کی ضمانت۔",
    whatsappSufi: "واٹس ایپ صوفی انجینئرنگ",
    emailDxf: "DXF فائل ای میل کریں",
    visitWebsite: "sufi.engineering",
    close: "بند کریں",
    orOrderDirectly:
      "یا براہ راست آرڈر کریں — ہم بنا کر آپ کو بھجوائیں گے!",
    manufacturingCta:
      "تعداد بتائیں، ہم آپ کی گراریاں بنا کر بھیج دیں گے۔",
    langLabel: "English",

    sectionMaterial: "مٹیریل اور موٹائی",
    material: "مٹیریل",
    plateThickness: "پلیٹ موٹائی",
    sectionWeight: "وزن کا اندازہ",
    estimatedWeight: "تخمینہ وزن",
    netArea: "خالص رقبہ",
    volume: "حجم",

    shareLink: "🔗 شیئر لنک کاپی کریں",
    linkCopied: "✅ لنک کاپی ہو گیا!",

    view2d: "2D",
    view3d: "3D",
    previewNote3d: "3D پیش نظارہ — گھمانے کے لیے کھینچیں، زوم کے لیے اسکرول کریں",
  },
};
