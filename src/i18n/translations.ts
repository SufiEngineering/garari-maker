// ============================================================================
// Multilingual Translations — English, Urdu, Arabic
// ============================================================================

export const LANGS = [
  { code: "en", label: "English" },
  { code: "ur", label: "اردو" },
  { code: "ar", label: "العربية" },
] as const;

export type Lang = (typeof LANGS)[number]["code"];

export interface Translations {
  // App header
  appName: string;
  appSubtitle: string;
  poweredBy: string;
  sufiEngineering: string;
  language: string;
  units: string;
  theme: string;

  // Tool modes
  toolSprocket: string;
  toolGear: string;
  toolDrive: string;

  // Mobile tabs
  tabParameters: string;
  tabPreview: string;

  // Section headers
  sectionChain: string;
  sectionTeeth: string;
  sectionBoreHub: string;
  sectionMountingHoles: string;
  sectionKeyway: string;
  sectionLightening: string;
  sectionAdvanced: string;
  sectionCalculated: string;
  sectionOrder: string;
  sectionPresets: string;

  // Chain
  chainNumber: string;
  chainStandard: string;
  standardAnsi: string;
  standardIso: string;
  pitch: string;
  rollerDiameter: string;
  strandCount: string;

  // Teeth
  numberOfTeeth: string;
  idlerVariant: string;

  // Bore & Hub
  boreDiameter: string;
  hubCircle: string;
  hubDiameter: string;
  hubLength: string;
  hubDoubleSided: string;
  setScrew: string;
  setScrewDiameter: string;

  // Mounting Holes
  enableBoltHoles: string;
  numberOfHoles: string;
  holeDiameter: string;
  boltCircleDiameter: string;

  // Keyway
  enableKeyway: string;
  keywayWidth: string;
  keywayDepth: string;

  // Lightening
  lighteningPattern: string;
  patternNone: string;
  patternHoles: string;
  patternSpokes: string;
  lighteningCount: string;
  lighteningSize: string;

  // Calculated
  pitchDiameter: string;
  outsideDiameter: string;
  rootDiameter: string;

  // Export
  downloadDxf: string;
  downloadStl: string;
  downloadPng: string;
  fixErrors: string;
  freeTool: string;
  resetDefaults: string;
  loadExample: string;
  undo: string;
  redo: string;
  printSpec: string;

  // Nesting
  nestedExport: string;
  nestCount: string;
  nestGap: string;
  exportNested: string;

  // Preview
  livePreview: string;
  previewNote: string;
  adjustToPreview: string;
  showDimensions: string;

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
  estCost: string;
  totalCost: string;

  // Share
  shareLink: string;
  linkCopied: string;
  scanToOpen: string;

  // 2D / 3D toggle
  view2d: string;
  view3d: string;
  previewNote3d: string;

  // Warnings
  warnings: string;

  // Saved designs
  saveDesign: string;
  designName: string;
  noDesigns: string;
  loadDesign: string;
  deleteDesign: string;

  // Drive calculator
  driveTitle: string;
  driveDesc: string;
  driverTeeth: string;
  drivenTeeth: string;
  inputRpm: string;
  centerDistance: string;
  gearRatio: string;
  outputRpm: string;
  chainLength: string;
  links: string;
  actualCenter: string;

  // Gear tool
  sectionGear: string;
  gearModule: string;
  gearPressureAngle: string;
  downloadGearDxf: string;

  // Spec sheet
  specSheetTitle: string;
  parameter: string;
  value: string;
  generatedOn: string;
}

export const translations: Record<Lang, Translations> = {
  en: {
    appName: "Garari Maker",
    appSubtitle: "PRECISION SPROCKET DXF GENERATOR",
    poweredBy: "Powered by",
    sufiEngineering: "Sufi Engineering",
    language: "Language",
    units: "Units",
    theme: "Theme",

    toolSprocket: "Sprocket",
    toolGear: "Spur Gear",
    toolDrive: "Drive Calc",

    tabParameters: "⚙️ Parameters",
    tabPreview: "👁️ Preview",

    sectionChain: "Chain",
    sectionTeeth: "Teeth",
    sectionBoreHub: "Bore & Hub",
    sectionMountingHoles: "Mounting Holes",
    sectionKeyway: "Keyway",
    sectionLightening: "Lightening",
    sectionAdvanced: "Advanced",
    sectionCalculated: "Calculated Dimensions",
    sectionOrder: "Order Sprocket",
    sectionPresets: "Saved Designs",

    chainNumber: "Chain Number",
    chainStandard: "Chain Standard",
    standardAnsi: "ANSI (imperial)",
    standardIso: "ISO / Metric (DIN 8187)",
    pitch: "Pitch",
    rollerDiameter: "Roller ⌀",
    strandCount: "Strands",

    numberOfTeeth: "Number of Teeth",
    idlerVariant: "Idler (plain rim)",

    boreDiameter: "Bore Diameter",
    hubCircle: "Hub Circle",
    hubDiameter: "Hub Diameter",
    hubLength: "Hub Length (per side)",
    hubDoubleSided: "Hub on Both Faces",
    setScrew: "Set-Screw Hole",
    setScrewDiameter: "Set-Screw ⌀",

    enableBoltHoles: "Enable Bolt Holes",
    numberOfHoles: "Number of Holes",
    holeDiameter: "Hole Diameter",
    boltCircleDiameter: "Bolt Circle Diameter",

    enableKeyway: "Enable Keyway",
    keywayWidth: "Keyway Width",
    keywayDepth: "Keyway Depth",

    lighteningPattern: "Pattern",
    patternNone: "None",
    patternHoles: "Holes",
    patternSpokes: "Spokes",
    lighteningCount: "Count",
    lighteningSize: "Hole/Arm Size",

    pitchDiameter: "Pitch Diameter",
    outsideDiameter: "Outside Diameter",
    rootDiameter: "Root Diameter",

    downloadDxf: "📥 Download DXF",
    downloadStl: "🧊 Download STL (3D)",
    downloadPng: "🖼️ Download PNG",
    fixErrors: "Fix errors before exporting",
    freeTool: "Free tool by Sufi Engineering",
    resetDefaults: "↺ Reset",
    loadExample: "🎲 Example",
    undo: "Undo",
    redo: "Redo",
    printSpec: "🖨️ Print Spec Sheet",

    nestedExport: "Batch Sheet (nested DXF)",
    nestCount: "Parts on Sheet",
    nestGap: "Gap",
    exportNested: "📦 Export Batch Sheet",

    livePreview: "🔍 Live Preview",
    previewNote: "SVG preview — download DXF for CNC use",
    adjustToPreview: "Adjust parameters to see preview",
    showDimensions: "Dimensions",

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
    estCost: "Material Cost (each)",
    totalCost: "Total Cost",

    shareLink: "🔗 Copy Share Link",
    linkCopied: "✅ Link Copied!",
    scanToOpen: "Scan to open this design",

    view2d: "2D",
    view3d: "3D",
    previewNote3d: "3D preview — drag to rotate, scroll to zoom",

    warnings: "Advisories",

    saveDesign: "💾 Save",
    designName: "Design name",
    noDesigns: "No saved designs yet.",
    loadDesign: "Load",
    deleteDesign: "Delete",

    driveTitle: "Chain Drive Calculator",
    driveDesc:
      "Compute ratio, output speed and the chain length needed between two sprockets.",
    driverTeeth: "Driver Teeth",
    drivenTeeth: "Driven Teeth",
    inputRpm: "Input Speed (RPM)",
    centerDistance: "Center Distance",
    gearRatio: "Ratio",
    outputRpm: "Output Speed",
    chainLength: "Chain Length",
    links: "links",
    actualCenter: "Actual Center Distance",

    sectionGear: "Spur Gear",
    gearModule: "Module (m)",
    gearPressureAngle: "Pressure Angle",
    downloadGearDxf: "📥 Download Gear DXF",

    specSheetTitle: "Sprocket Specification Sheet",
    parameter: "Parameter",
    value: "Value",
    generatedOn: "Generated on",
  },

  ur: {
    appName: "گراری میکر",
    appSubtitle: "اسپراکٹ DXF جنریٹر",
    poweredBy: "تیار کردہ",
    sufiEngineering: "صوفی انجینئرنگ",
    language: "زبان",
    units: "اکائیاں",
    theme: "تھیم",

    toolSprocket: "گراری",
    toolGear: "گیئر",
    toolDrive: "ڈرائیو کیلکولیٹر",

    tabParameters: "⚙️ پیرامیٹرز",
    tabPreview: "👁️ پیش نظارہ",

    sectionChain: "چین",
    sectionTeeth: "دانتے",
    sectionBoreHub: "بور اور ہب",
    sectionMountingHoles: "بولٹ سوراخ",
    sectionKeyway: "کی وے",
    sectionLightening: "وزن کمی",
    sectionAdvanced: "ایڈوانس",
    sectionCalculated: "حسابی پیمائشیں",
    sectionOrder: "گراری آرڈر کریں",
    sectionPresets: "محفوظ ڈیزائن",

    chainNumber: "چین نمبر",
    chainStandard: "چین معیار",
    standardAnsi: "ANSI (انچ)",
    standardIso: "ISO / میٹرک (DIN 8187)",
    pitch: "پچ",
    rollerDiameter: "رولر قطر",
    strandCount: "اسٹرینڈز",

    numberOfTeeth: "دانتوں کی تعداد",
    idlerVariant: "آئیڈلر (سادہ رِم)",

    boreDiameter: "بور قطر",
    hubCircle: "ہب دائرہ",
    hubDiameter: "ہب قطر",
    hubLength: "ہب لمبائی (فی طرف)",
    hubDoubleSided: "دونوں اطراف ہب",
    setScrew: "سیٹ اسکرو سوراخ",
    setScrewDiameter: "سیٹ اسکرو قطر",

    enableBoltHoles: "بولٹ سوراخ شامل کریں",
    numberOfHoles: "سوراخوں کی تعداد",
    holeDiameter: "سوراخ قطر",
    boltCircleDiameter: "بولٹ سرکل قطر",

    enableKeyway: "کی وے شامل کریں",
    keywayWidth: "کی وے چوڑائی",
    keywayDepth: "کی وے گہرائی",

    lighteningPattern: "پیٹرن",
    patternNone: "کوئی نہیں",
    patternHoles: "سوراخ",
    patternSpokes: "اسپوکس",
    lighteningCount: "تعداد",
    lighteningSize: "سوراخ/آرم سائز",

    pitchDiameter: "پچ قطر",
    outsideDiameter: "بیرونی قطر",
    rootDiameter: "جڑ قطر",

    downloadDxf: "📥 DXF ڈاؤن لوڈ کریں",
    downloadStl: "🧊 STL ڈاؤن لوڈ (3D)",
    downloadPng: "🖼️ PNG ڈاؤن لوڈ",
    fixErrors: "ایکسپورٹ سے پہلے غلطیاں ٹھیک کریں",
    freeTool: "صوفی انجینئرنگ کا مفت ٹول",
    resetDefaults: "↺ ری سیٹ",
    loadExample: "🎲 مثال",
    undo: "واپس",
    redo: "دوبارہ",
    printSpec: "🖨️ تفصیلات پرنٹ کریں",

    nestedExport: "بیچ شیٹ (نیسٹڈ DXF)",
    nestCount: "شیٹ پر پرزے",
    nestGap: "فاصلہ",
    exportNested: "📦 بیچ شیٹ ایکسپورٹ",

    livePreview: "🔍 براہ راست نظارہ",
    previewNote: "SVG پیش نظارہ — CNC کے لیے DXF ڈاؤن لوڈ کریں",
    adjustToPreview: "پیش نظارہ دیکھنے کے لیے پیرامیٹرز ایڈجسٹ کریں",
    showDimensions: "پیمائشیں",

    quantity: "مطلوبہ تعداد",
    quantityUnit: "عدد",
    orderViaWhatsApp: "📱 واٹس ایپ پر آرڈر کریں",
    orderDescription: "اصلی گراری چاہیے؟ صوفی انجینئرنگ بنا کر آپ کو بھجوائے گی!",

    dxfDownloaded: "!DXF ڈاؤن لوڈ ہو گئی",
    fileReady: "آپ کی اسپراکٹ فائل تیار ہے۔",
    needManufactured: "بنوانا چاہتے ہیں؟",
    manufacturingDesc:
      "صوفی انجینئرنگ کو یہ DXF فائل بھیجیں اور اپنی گراری اسٹیل، ایلومینیم یا سٹینلیس اسٹیل میں CNC سے بنوائیں۔ تیز ترسیل، درستگی کی ضمانت۔",
    whatsappSufi: "واٹس ایپ صوفی انجینئرنگ",
    emailDxf: "DXF فائل ای میل کریں",
    visitWebsite: "sufi.engineering",
    close: "بند کریں",
    orOrderDirectly: "یا براہ راست آرڈر کریں — ہم بنا کر آپ کو بھجوائیں گے!",
    manufacturingCta: "تعداد بتائیں، ہم آپ کی گراریاں بنا کر بھیج دیں گے۔",
    langLabel: "English",

    sectionMaterial: "مٹیریل اور موٹائی",
    material: "مٹیریل",
    plateThickness: "پلیٹ موٹائی",
    sectionWeight: "وزن کا اندازہ",
    estimatedWeight: "تخمینہ وزن",
    netArea: "خالص رقبہ",
    volume: "حجم",
    estCost: "مٹیریل لاگت (فی عدد)",
    totalCost: "کل لاگت",

    shareLink: "🔗 شیئر لنک کاپی کریں",
    linkCopied: "✅ لنک کاپی ہو گیا!",
    scanToOpen: "اس ڈیزائن کو کھولنے کے لیے اسکین کریں",

    view2d: "2D",
    view3d: "3D",
    previewNote3d: "3D پیش نظارہ — گھمانے کے لیے کھینچیں، زوم کے لیے اسکرول کریں",

    warnings: "مشورے",

    saveDesign: "💾 محفوظ کریں",
    designName: "ڈیزائن کا نام",
    noDesigns: "ابھی کوئی محفوظ ڈیزائن نہیں۔",
    loadDesign: "لوڈ",
    deleteDesign: "حذف",

    driveTitle: "چین ڈرائیو کیلکولیٹر",
    driveDesc: "دو گراریوں کے درمیان تناسب، رفتار اور چین کی لمبائی معلوم کریں۔",
    driverTeeth: "ڈرائیور دانتے",
    drivenTeeth: "ڈرون دانتے",
    inputRpm: "ان پٹ رفتار (RPM)",
    centerDistance: "مرکزی فاصلہ",
    gearRatio: "تناسب",
    outputRpm: "آؤٹ پٹ رفتار",
    chainLength: "چین لمبائی",
    links: "لنکس",
    actualCenter: "اصل مرکزی فاصلہ",

    sectionGear: "اسپر گیئر",
    gearModule: "ماڈیول (m)",
    gearPressureAngle: "پریشر اینگل",
    downloadGearDxf: "📥 گیئر DXF ڈاؤن لوڈ",

    specSheetTitle: "اسپراکٹ تفصیلاتی شیٹ",
    parameter: "پیرامیٹر",
    value: "قدر",
    generatedOn: "تاریخ",
  },

  ar: {
    appName: "غراري ميكر",
    appSubtitle: "مولّد ملفات DXF للتروس",
    poweredBy: "بدعم من",
    sufiEngineering: "صوفي إنجينيرنغ",
    language: "اللغة",
    units: "الوحدات",
    theme: "السمة",

    toolSprocket: "ترس سلسلة",
    toolGear: "ترس مستقيم",
    toolDrive: "حاسبة النقل",

    tabParameters: "⚙️ المعاملات",
    tabPreview: "👁️ معاينة",

    sectionChain: "السلسلة",
    sectionTeeth: "الأسنان",
    sectionBoreHub: "التجويف والصرة",
    sectionMountingHoles: "ثقوب التثبيت",
    sectionKeyway: "مجرى الخابور",
    sectionLightening: "تخفيف الوزن",
    sectionAdvanced: "متقدم",
    sectionCalculated: "الأبعاد المحسوبة",
    sectionOrder: "اطلب الترس",
    sectionPresets: "التصاميم المحفوظة",

    chainNumber: "رقم السلسلة",
    chainStandard: "معيار السلسلة",
    standardAnsi: "ANSI (إنش)",
    standardIso: "ISO / متري (DIN 8187)",
    pitch: "الخطوة",
    rollerDiameter: "قطر البكرة",
    strandCount: "عدد الصفوف",

    numberOfTeeth: "عدد الأسنان",
    idlerVariant: "ترس حر (حافة ملساء)",

    boreDiameter: "قطر التجويف",
    hubCircle: "دائرة الصرة",
    hubDiameter: "قطر الصرة",
    hubLength: "طول الصرة (لكل جهة)",
    hubDoubleSided: "صرة على الوجهين",
    setScrew: "ثقب مسمار التثبيت",
    setScrewDiameter: "قطر مسمار التثبيت",

    enableBoltHoles: "تفعيل ثقوب البراغي",
    numberOfHoles: "عدد الثقوب",
    holeDiameter: "قطر الثقب",
    boltCircleDiameter: "قطر دائرة البراغي",

    enableKeyway: "تفعيل مجرى الخابور",
    keywayWidth: "عرض المجرى",
    keywayDepth: "عمق المجرى",

    lighteningPattern: "النمط",
    patternNone: "بدون",
    patternHoles: "ثقوب",
    patternSpokes: "أذرع",
    lighteningCount: "العدد",
    lighteningSize: "حجم الثقب/الذراع",

    pitchDiameter: "قطر الخطوة",
    outsideDiameter: "القطر الخارجي",
    rootDiameter: "قطر الجذر",

    downloadDxf: "📥 تنزيل DXF",
    downloadStl: "🧊 تنزيل STL (ثلاثي الأبعاد)",
    downloadPng: "🖼️ تنزيل PNG",
    fixErrors: "صحّح الأخطاء قبل التصدير",
    freeTool: "أداة مجانية من صوفي إنجينيرنغ",
    resetDefaults: "↺ إعادة ضبط",
    loadExample: "🎲 مثال",
    undo: "تراجع",
    redo: "إعادة",
    printSpec: "🖨️ طباعة المواصفات",

    nestedExport: "لوح دفعة (DXF متعدد)",
    nestCount: "القطع على اللوح",
    nestGap: "الفاصل",
    exportNested: "📦 تصدير لوح الدفعة",

    livePreview: "🔍 معاينة حية",
    previewNote: "معاينة SVG — نزّل DXF للاستخدام على CNC",
    adjustToPreview: "اضبط المعاملات لرؤية المعاينة",
    showDimensions: "الأبعاد",

    quantity: "الكمية المطلوبة",
    quantityUnit: "قطعة",
    orderViaWhatsApp: "📱 اطلب عبر واتساب",
    orderDescription: "تريد تروساً فعلية؟ ستقوم صوفي إنجينيرنغ بتصنيعها وشحنها إليك!",

    dxfDownloaded: "!تم تنزيل DXF",
    fileReady: "ملف الترس جاهز.",
    needManufactured: "تريد تصنيعه؟",
    manufacturingDesc:
      "أرسل ملف DXF إلى صوفي إنجينيرنغ لتصنيع الترس على CNC من الفولاذ أو الألمنيوم أو الفولاذ المقاوم. تسليم سريع ودقة مضمونة.",
    whatsappSufi: "واتساب صوفي إنجينيرنغ",
    emailDxf: "أرسل ملف DXF بالبريد",
    visitWebsite: "sufi.engineering",
    close: "إغلاق",
    orOrderDirectly: "أو اطلب مباشرة — سنصنعه ونشحنه إليك!",
    manufacturingCta: "أخبرنا بالكمية وسنصنع التروس ونشحنها.",
    langLabel: "English",

    sectionMaterial: "المادة والسماكة",
    material: "المادة",
    plateThickness: "سماكة اللوح",
    sectionWeight: "تقدير الوزن",
    estimatedWeight: "الوزن التقديري",
    netArea: "المساحة الصافية",
    volume: "الحجم",
    estCost: "تكلفة المادة (للقطعة)",
    totalCost: "التكلفة الإجمالية",

    shareLink: "🔗 نسخ رابط المشاركة",
    linkCopied: "✅ تم نسخ الرابط!",
    scanToOpen: "امسح لفتح هذا التصميم",

    view2d: "2D",
    view3d: "3D",
    previewNote3d: "معاينة ثلاثية — اسحب للتدوير، مرّر للتكبير",

    warnings: "تنبيهات",

    saveDesign: "💾 حفظ",
    designName: "اسم التصميم",
    noDesigns: "لا توجد تصاميم محفوظة بعد.",
    loadDesign: "تحميل",
    deleteDesign: "حذف",

    driveTitle: "حاسبة نقل السلسلة",
    driveDesc: "احسب النسبة والسرعة وطول السلسلة بين ترسين.",
    driverTeeth: "أسنان القائد",
    drivenTeeth: "أسنان المقود",
    inputRpm: "سرعة الإدخال (RPM)",
    centerDistance: "المسافة بين المركزين",
    gearRatio: "النسبة",
    outputRpm: "سرعة الإخراج",
    chainLength: "طول السلسلة",
    links: "وصلة",
    actualCenter: "المسافة الفعلية بين المركزين",

    sectionGear: "ترس مستقيم",
    gearModule: "المعامل (m)",
    gearPressureAngle: "زاوية الضغط",
    downloadGearDxf: "📥 تنزيل DXF للترس",

    specSheetTitle: "ورقة مواصفات الترس",
    parameter: "المعامل",
    value: "القيمة",
    generatedOn: "أُنشئت في",
  },
};
