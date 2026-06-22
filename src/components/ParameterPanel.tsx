// ============================================================================
// ParameterPanel — Left panel with all sprocket parameter inputs
// ============================================================================

import { useState } from "react";
import type {
  SprocketParams,
  CalculatedDimensions,
  ValidationError,
  WeightEstimate,
  ChainStandard,
  LighteningPattern,
} from "../types/sprocket";
import { CHAIN_TABLE, getChainsByStandard } from "../data/chainTable";
import { MATERIALS } from "../data/materials";
import { useLang } from "../i18n/LangContext";
import { buildShareUrl } from "../utils/shareLink";
import { hasBlockingErrors, LAYER_COLORS, DIM_COLORS } from "../engine/sprocketGeometry";
import NumberInput from "./NumberInput";
import ToggleSwitch from "./ToggleSwitch";
import SectionHeader from "./SectionHeader";
import SavedDesignsPanel from "./SavedDesignsPanel";
import QRCodeView from "./QRCode";

interface ParameterPanelProps {
  params: SprocketParams;
  dims: CalculatedDimensions | null;
  errors: ValidationError[];
  onChange: (params: SprocketParams) => void;
  onExport: () => void;
  onExportStl: () => void;
  onExportNested: (count: number, gap: number) => void;
  onPrintSpec: () => void;
  quantity: number;
  onQuantityChange: (qty: number) => void;
  weight: WeightEstimate | null;
}

/** Helper to find a blocking error (not a warning) for a field. */
function getError(errors: ValidationError[], field: string): string | undefined {
  return errors.find((e) => e.field === field && e.severity !== "warning")?.message;
}

/** Build WhatsApp message with all sprocket parameters */
function buildWhatsAppUrl(
  params: SprocketParams,
  dims: CalculatedDimensions | null,
  qty: number,
  weight: WeightEstimate | null
): string {
  const chain = CHAIN_TABLE.find(
    (c) => c.standard === params.standard && c.chainNumber === params.chainNumber
  );
  const lines = [
    `*Garari Maker Order*`,
    ``,
    `🔗 Chain: ${chain?.label ?? params.chainNumber} (${params.standard.toUpperCase()})`,
    `🦷 Teeth: ${params.numTeeth}`,
    `🧵 Strands: ${params.strandCount}`,
    `⭕ Bore Diameter: ${params.boreDiameter} mm`,
  ];
  if (params.hubEnabled) lines.push(`Hub Diameter: ${params.hubDiameter} mm`);
  if (params.keywayEnabled)
    lines.push(`🔑 Keyway: ${params.keywayWidth}×${params.keywayDepth} mm`);
  if (params.setScrewEnabled)
    lines.push(`🔩 Set-screw: ⌀${params.setScrewDiameter} mm`);
  if (params.mountingHolesEnabled)
    lines.push(
      `🕳️ Mounting Holes: ${params.mountingHoleCount}× ⌀${params.mountingHoleDiameter} mm on BCD ${params.boltCircleDiameter} mm`
    );
  if (dims) {
    lines.push(``);
    lines.push(`📐 PD: ${dims.pitchDiameter.toFixed(3)} mm`);
    lines.push(`📐 OD: ${dims.outsideDiameter.toFixed(3)} mm`);
  }
  lines.push(`🧱 Material: ${weight?.materialName ?? params.materialKey}`);
  lines.push(`📏 Thickness: ${params.plateThickness} mm`);
  if (weight) {
    lines.push(
      `⚖️ Est. Weight: ${weight.weightGrams >= 1000 ? (weight.weightGrams / 1000).toFixed(2) + " kg" : weight.weightGrams + " g"}`
    );
  }
  lines.push(``);
  lines.push(`📦 Quantity: ${qty}`);
  lines.push(``);
  lines.push(`Please manufacture and ship these sprockets.`);

  const text = encodeURIComponent(lines.join("\n"));
  return `https://wa.me/923216954361?text=${text}`;
}

export default function ParameterPanel({
  params,
  dims,
  errors,
  onChange,
  onExport,
  onExportStl,
  onExportNested,
  onPrintSpec,
  quantity,
  onQuantityChange,
  weight,
}: ParameterPanelProps) {
  const { t, lang } = useLang();
  const isUrdu = lang === "ur";
  const [linkCopied, setLinkCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [nestCount, setNestCount] = useState(4);
  const [nestGap, setNestGap] = useState(5);
  const blocking = hasBlockingErrors(errors);
  const warnings = errors.filter((e) => e.severity === "warning");

  const matLabel = (m: (typeof MATERIALS)[number]) =>
    lang === "ur" ? m.labelUr : lang === "ar" ? m.labelAr : m.labelEn;

  const set = <K extends keyof SprocketParams>(
    key: K,
    value: SprocketParams[K]
  ) => {
    onChange({ ...params, [key]: value });
  };

  const onStandardChange = (s: ChainStandard) => {
    const list = getChainsByStandard(s);
    const stillValid = list.some((c) => c.chainNumber === params.chainNumber);
    onChange({
      ...params,
      standard: s,
      chainNumber: stillValid
        ? params.chainNumber
        : list[Math.min(2, list.length - 1)].chainNumber,
    });
  };

  const chains = getChainsByStandard(params.standard);

  return (
    <div className="param-panel w-full h-full overflow-y-auto bg-[var(--c-surface)] border-r border-[var(--c-border)] p-3 sm:p-4 flex flex-col">

      {/* CHAIN */}
      <SectionHeader title={t.sectionChain} icon="🔗" />

      <div className="mb-2">
        <label className="text-sm text-[var(--c-text-2)]">{t.chainStandard}</label>
        <select
          value={params.standard}
          onChange={(e) => onStandardChange(e.target.value as ChainStandard)}
          className="mt-1 w-full rounded-md border border-[var(--c-border)] bg-[var(--c-surface-2)] px-3 py-2 text-sm text-[var(--c-text)] focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          <option value="ansi">{t.standardAnsi}</option>
          <option value="iso">{t.standardIso}</option>
        </select>
      </div>

      <div className="mb-2">
        <label className="text-sm text-[var(--c-text-2)]">{t.chainNumber}</label>
        <select
          value={params.chainNumber}
          onChange={(e) => set("chainNumber", Number(e.target.value))}
          className="mt-1 w-full rounded-md border border-[var(--c-border)] bg-[var(--c-surface-2)] px-3 py-2 text-sm text-[var(--c-text)] focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          {chains.map((c) => (
            <option key={c.chainNumber} value={c.chainNumber}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      {dims && (
        <div className="text-xs text-[var(--c-text-muted)] space-y-0.5 mb-2 ps-1">
          <p>{t.pitch}: <span className="text-[var(--c-text-2)]">{dims.pitch.toFixed(3)} mm</span></p>
          <p>{t.rollerDiameter}: <span className="text-[var(--c-text-2)]">{dims.rollerDiameter.toFixed(2)} mm</span></p>
        </div>
      )}

      <NumberInput
        label={t.strandCount}
        value={params.strandCount}
        onChange={(v) => set("strandCount", Math.max(1, Math.min(3, Math.round(v))))}
        min={1}
        max={3}
        step={1}
        unit=""
        tooltip="1 = simplex, 2 = duplex, 3 = triplex"
      />

      {/* TEETH */}
      <SectionHeader title={t.sectionTeeth} icon="🦷" color={LAYER_COLORS.outline} />
      <NumberInput
        label={t.numberOfTeeth}
        value={params.numTeeth}
        onChange={(v) => set("numTeeth", Math.round(v))}
        min={8}
        max={120}
        step={1}
        unit=""
        error={getError(errors, "numTeeth")}
      />
      <ToggleSwitch
        label={t.idlerVariant}
        checked={params.idler}
        onChange={(v) => set("idler", v)}
      />

      {/* BORE / HUB */}
      <SectionHeader title={t.sectionBoreHub} icon="⭕" color={LAYER_COLORS.bore} />
      <NumberInput
        label={t.boreDiameter}
        value={params.boreDiameter}
        onChange={(v) => set("boreDiameter", v)}
        min={0.1}
        step={0.5}
        length
        error={getError(errors, "boreDiameter")}
      />
      <ToggleSwitch label={t.hubCircle} checked={params.hubEnabled} onChange={(v) => set("hubEnabled", v)} />
      {params.hubEnabled && (
        <div className="ps-2 border-s-2" style={{ borderColor: LAYER_COLORS.hub }}>
          <NumberInput label={t.hubDiameter} value={params.hubDiameter} onChange={(v) => set("hubDiameter", v)} min={0.1} step={0.5} length error={getError(errors, "hubDiameter")} />
          <NumberInput label={t.hubLength} value={params.hubLength} onChange={(v) => set("hubLength", Math.max(0, v))} min={0} step={1} length tooltip="Projection beyond the plate (for weight & 3D)" />
          <ToggleSwitch label={t.hubDoubleSided} checked={params.hubDoubleSided} onChange={(v) => set("hubDoubleSided", v)} />
        </div>
      )}

      {/* MOUNTING HOLES */}
      <SectionHeader title={t.sectionMountingHoles} icon="🕳️" color={LAYER_COLORS.holes} />
      <ToggleSwitch label={t.enableBoltHoles} checked={params.mountingHolesEnabled} onChange={(v) => set("mountingHolesEnabled", v)} />
      {params.mountingHolesEnabled && (
        <>
          <NumberInput label={t.numberOfHoles} value={params.mountingHoleCount} onChange={(v) => set("mountingHoleCount", Math.round(v))} min={2} max={12} step={1} unit="" error={getError(errors, "mountingHoleCount")} />
          <NumberInput label={t.holeDiameter} value={params.mountingHoleDiameter} onChange={(v) => set("mountingHoleDiameter", v)} min={0.1} step={0.5} length error={getError(errors, "mountingHoleDiameter")} />
          <NumberInput label={t.boltCircleDiameter} value={params.boltCircleDiameter} onChange={(v) => set("boltCircleDiameter", v)} min={0.1} step={0.5} length tooltip="Diameter of the circle the bolt-hole centers lie on (BCD)" error={getError(errors, "boltCircleDiameter")} />
        </>
      )}

      {/* KEYWAY */}
      <SectionHeader title={t.sectionKeyway} icon="🔑" color={LAYER_COLORS.bore} />
      <ToggleSwitch label={t.enableKeyway} checked={params.keywayEnabled} onChange={(v) => set("keywayEnabled", v)} />
      {params.keywayEnabled && (
        <>
          <NumberInput label={t.keywayWidth} value={params.keywayWidth} onChange={(v) => set("keywayWidth", v)} min={0.1} step={0.5} length error={getError(errors, "keywayWidth")} />
          <NumberInput label={t.keywayDepth} value={params.keywayDepth} onChange={(v) => set("keywayDepth", v)} min={0.1} step={0.5} length error={getError(errors, "keywayDepth")} />
        </>
      )}

      {/* LIGHTENING */}
      <SectionHeader title={t.sectionLightening} icon="🪶" color={LAYER_COLORS.lightening} />
      <div className="mb-2">
        <label className="text-sm text-[var(--c-text-2)]">{t.lighteningPattern}</label>
        <select
          value={params.lighteningPattern}
          onChange={(e) => set("lighteningPattern", e.target.value as LighteningPattern)}
          className="mt-1 w-full rounded-md border border-[var(--c-border)] bg-[var(--c-surface-2)] px-3 py-2 text-sm text-[var(--c-text)] focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          <option value="none">{t.patternNone}</option>
          <option value="holes">{t.patternHoles}</option>
          <option value="spokes">{t.patternSpokes}</option>
        </select>
      </div>
      {params.lighteningPattern !== "none" && (
        <>
          <NumberInput label={t.lighteningCount} value={params.lighteningCount} onChange={(v) => set("lighteningCount", Math.max(1, Math.round(v)))} min={1} max={24} step={1} unit="" />
          <NumberInput label={t.lighteningSize} value={params.lighteningSize} onChange={(v) => set("lighteningSize", Math.max(1, v))} min={1} step={0.5} length />
        </>
      )}

      {/* ADVANCED — set screw */}
      <SectionHeader title={t.sectionAdvanced} icon="🔧" />
      <ToggleSwitch label={t.setScrew} checked={params.setScrewEnabled} onChange={(v) => set("setScrewEnabled", v)} />
      {params.setScrewEnabled && (
        <NumberInput label={t.setScrewDiameter} value={params.setScrewDiameter} onChange={(v) => set("setScrewDiameter", v)} min={1} step={0.5} length tooltip="Radial tapped hole through the hub (shown in order spec)" />
      )}

      {/* MATERIAL & THICKNESS */}
      <SectionHeader title={t.sectionMaterial} icon="🧱" />
      <div className="mb-2">
        <label className="text-sm text-[var(--c-text-2)]">{t.material}</label>
        <select
          value={params.materialKey}
          onChange={(e) => set("materialKey", e.target.value)}
          className="mt-1 w-full rounded-md border border-[var(--c-border)] bg-[var(--c-surface-2)] px-3 py-2 text-sm text-[var(--c-text)] focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          {MATERIALS.map((m) => (
            <option key={m.key} value={m.key}>{matLabel(m)}</option>
          ))}
        </select>
      </div>
      <NumberInput label={t.plateThickness} value={params.plateThickness} onChange={(v) => set("plateThickness", v)} min={1} max={50} step={0.5} length />

      {/* CALCULATED */}
      {dims && (
        <>
          <SectionHeader title={t.sectionCalculated} icon="📐" />
          <div className="bg-[var(--c-surface-2)] rounded-lg p-3 text-xs space-y-1.5 border border-[var(--c-border)]">
            <DimRow label={t.pitchDiameter} value={dims.pitchDiameter} color={DIM_COLORS.pd} />
            <DimRow label={t.outsideDiameter} value={dims.outsideDiameter} color={DIM_COLORS.od} />
            <DimRow label={t.rootDiameter} value={dims.rootDiameter} color={DIM_COLORS.rd} />
          </div>
        </>
      )}

      {/* WEIGHT + COST */}
      {weight && (
        <>
          <SectionHeader title={t.sectionWeight} icon="⚖️" />
          <div className="bg-[var(--c-surface-2)] rounded-lg p-3 text-xs space-y-1.5 border border-[var(--c-border)]">
            <div className="flex justify-between">
              <span className="text-[var(--c-text-muted)]">{t.material}</span>
              <span className="text-[var(--c-accent-2)]">{isUrdu ? MATERIALS.find((m) => m.key === params.materialKey)?.labelUr : weight.materialName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--c-text-muted)]">{t.netArea}</span>
              <span className="text-[var(--c-accent-2)] font-mono">{weight.netArea.toFixed(0)} mm²</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--c-text-muted)]">{t.volume}</span>
              <span className="text-[var(--c-accent-2)] font-mono">{weight.volume.toFixed(1)} cm³</span>
            </div>
            <div className="flex justify-between border-t border-[var(--c-border)] pt-1.5">
              <span className="text-[var(--c-text-2)] font-semibold">{t.estimatedWeight}</span>
              <span className="text-[var(--c-text)] font-bold font-mono">
                {weight.weightGrams >= 1000 ? `${(weight.weightGrams / 1000).toFixed(2)} kg` : `${weight.weightGrams} g`}
              </span>
            </div>
          </div>
        </>
      )}

      {/* WARNINGS */}
      {warnings.length > 0 && (
        <>
          <SectionHeader title={t.warnings} icon="⚠️" />
          <ul className="bg-amber-950/20 border border-amber-700/40 rounded-lg p-3 text-xs space-y-1.5 list-disc list-inside text-amber-300/90">
            {warnings.map((w, i) => <li key={i}>{w.message}</li>)}
          </ul>
        </>
      )}

      {/* SAVED DESIGNS */}
      <SectionHeader title={t.sectionPresets} icon="💾" />
      <SavedDesignsPanel params={params} onLoad={onChange} />

      {/* ACTIONS */}
      <div className="mt-auto pt-4 space-y-3">
        <button
          onClick={onExport}
          disabled={blocking}
          className="w-full py-3 rounded-lg font-semibold text-sm transition-all bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-900/30 disabled:bg-neutral-800 disabled:text-neutral-500 disabled:cursor-not-allowed disabled:shadow-none active:scale-[0.98] cursor-pointer"
        >
          {t.downloadDxf}
        </button>
        {blocking && <p className="text-xs text-[var(--c-accent)] text-center">{t.fixErrors}</p>}

        <div className="grid grid-cols-2 gap-2">
          <button onClick={onExportStl} disabled={blocking} className="py-2 rounded-lg text-xs font-semibold bg-red-900/30 hover:bg-red-900/50 border border-red-800/40 text-[var(--c-accent-2)] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer">{t.downloadStl}</button>
          <button onClick={onPrintSpec} disabled={blocking} className="py-2 rounded-lg text-xs font-semibold bg-red-900/30 hover:bg-red-900/50 border border-red-800/40 text-[var(--c-accent-2)] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer">{t.printSpec}</button>
        </div>

        {/* Batch sheet */}
        <div className="bg-[var(--c-surface-2)] rounded-lg p-3 border border-[var(--c-border)]">
          <p className="text-xs text-[var(--c-text-2)] font-semibold mb-2">{t.nestedExport}</p>
          <div className="grid grid-cols-2 gap-2">
            <NumberInput label={t.nestCount} value={nestCount} onChange={(v) => setNestCount(Math.max(1, Math.round(v)))} min={1} max={100} step={1} unit="" />
            <NumberInput label={t.nestGap} value={nestGap} onChange={(v) => setNestGap(Math.max(0, v))} min={0} step={1} length />
          </div>
          <button onClick={() => onExportNested(nestCount, nestGap)} disabled={blocking} className="w-full mt-1 py-2 rounded-lg text-xs font-semibold bg-red-900/30 hover:bg-red-900/50 border border-red-800/40 text-[var(--c-accent-2)] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer">{t.exportNested}</button>
        </div>

        {/* ORDER VIA WHATSAPP */}
        <div className="bg-[var(--c-surface-2)] rounded-lg p-3 border border-[var(--c-border)]">
          <SectionHeader title={t.sectionOrder} icon="📦" />
          <p className="text-xs text-[var(--c-text-3)] mb-3 leading-relaxed">{t.orderDescription}</p>
          <NumberInput label={t.quantity} value={quantity} onChange={(v) => onQuantityChange(Math.max(1, Math.round(v)))} min={1} max={10000} step={1} unit={t.quantityUnit} />
          <a
            href={buildWhatsAppUrl(params, dims, quantity, weight)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-3 mt-2 rounded-lg bg-green-600 hover:bg-green-500 text-white text-sm font-semibold transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            {t.orderViaWhatsApp}
          </a>
        </div>

        {/* SHARE + QR */}
        <button
          onClick={() => {
            navigator.clipboard.writeText(buildShareUrl(params));
            setLinkCopied(true);
            setShowQr(true);
            setTimeout(() => setLinkCopied(false), 2000);
          }}
          className="w-full py-2.5 rounded-lg font-semibold text-sm transition-all bg-red-900/30 hover:bg-red-900/50 border border-red-800/40 text-[var(--c-accent-2)] active:scale-[0.98] cursor-pointer"
        >
          {linkCopied ? t.linkCopied : t.shareLink}
        </button>
        {showQr && (
          <div className="flex flex-col items-center gap-1 pt-1">
            <QRCodeView value={buildShareUrl(params)} size={120} />
            <p className="text-[10px] text-[var(--c-text-faint)]">{t.scanToOpen}</p>
          </div>
        )}

        <p className="text-[10px] text-[var(--c-text-faint)] text-center">{t.freeTool}</p>
      </div>
    </div>
  );
}

function DimRow({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className="flex items-center gap-1.5 text-[var(--c-text-muted)]">
        {color && (
          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: color }} />
        )}
        {label}
      </span>
      <span className="text-[var(--c-accent-2)] font-mono">{value.toFixed(3)} mm</span>
    </div>
  );
}
