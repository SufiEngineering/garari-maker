// ============================================================================
// GearTool — involute spur gear designer (parameters + preview + DXF export)
// ============================================================================

import { useMemo, useState } from "react";
import { useLang } from "../i18n/LangContext";
import { useSettings, formatLength } from "../i18n/SettingsContext";
import { MATERIALS } from "../data/materials";
import {
  DEFAULT_GEAR,
  calcGearDimensions,
  validateGear,
  exportGearSVG,
  exportGearDXF,
  estimateGearWeight,
  gearFilename,
  type GearParams,
} from "../engine/gearGeometry";
import { downloadText } from "../utils/exporters";
import { hasBlockingErrors } from "../engine/sprocketGeometry";
import NumberInput from "./NumberInput";

export default function GearTool() {
  const { t, lang } = useLang();
  const { units } = useSettings();
  const [p, setP] = useState<GearParams>(DEFAULT_GEAR);

  const set = <K extends keyof GearParams>(k: K, v: GearParams[K]) =>
    setP((prev) => ({ ...prev, [k]: v }));

  const errors = useMemo(() => validateGear(p), [p]);
  const blocking = hasBlockingErrors(errors);
  const dim = useMemo(() => calcGearDimensions(p), [p]);
  const weight = useMemo(() => estimateGearWeight(p), [p]);
  const svg = useMemo(() => (blocking ? "" : exportGearSVG(p)), [p, blocking]);

  const matLabel = (m: (typeof MATERIALS)[number]) =>
    lang === "ur" ? m.labelUr : lang === "ar" ? m.labelAr : m.labelEn;

  const L = (mm: number) => formatLength(mm, units);

  return (
    <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
      {/* Params */}
      <div className="param-panel w-full md:w-80 md:min-w-[320px] overflow-y-auto bg-[var(--c-surface)] border-r border-[var(--c-border)] p-4">
        <h3 className="text-sm font-semibold text-[var(--c-accent)] uppercase tracking-wide mb-3 pb-1 border-b border-[var(--c-border)]">
          ⚙️ {t.sectionGear}
        </h3>
        <NumberInput label={t.gearModule} value={p.module} onChange={(v) => set("module", Math.max(0.2, v))} min={0.2} step={0.25} length />
        <NumberInput label={t.numberOfTeeth} value={p.numTeeth} onChange={(v) => set("numTeeth", Math.round(v))} min={6} max={200} step={1} unit="" error={errors.find((e) => e.field === "numTeeth" && e.severity !== "warning")?.message} />
        <NumberInput label={t.gearPressureAngle} value={p.pressureAngle} onChange={(v) => set("pressureAngle", v)} min={14.5} max={25} step={0.5} unit="°" />
        <NumberInput label={t.boreDiameter} value={p.boreDiameter} onChange={(v) => set("boreDiameter", v)} min={0.5} step={0.5} length error={errors.find((e) => e.field === "boreDiameter")?.message} />
        <NumberInput label={t.plateThickness} value={p.plateThickness} onChange={(v) => set("plateThickness", v)} min={1} step={0.5} length />

        <div className="mb-2">
          <label className="text-sm text-[var(--c-text-2)]">{t.material}</label>
          <select
            value={p.materialKey}
            onChange={(e) => set("materialKey", e.target.value)}
            className="mt-1 w-full rounded-md border border-[var(--c-border)] bg-[var(--c-surface-2)] px-3 py-2 text-sm text-[var(--c-text)] focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            {MATERIALS.map((m) => (
              <option key={m.key} value={m.key}>{matLabel(m)}</option>
            ))}
          </select>
        </div>

        <div className="bg-[var(--c-surface-2)] rounded-lg p-3 text-xs space-y-1 border border-[var(--c-border)] mt-3">
          <Row label={t.pitchDiameter} value={L(dim.pitchDiameter)} />
          <Row label={t.outsideDiameter} value={L(dim.outsideDiameter)} />
          <Row label={t.rootDiameter} value={L(dim.rootDiameter)} />
          <Row label={t.estimatedWeight} value={weight.weightGrams >= 1000 ? `${(weight.weightGrams / 1000).toFixed(2)} kg` : `${weight.weightGrams} g`} />
        </div>

        <button
          onClick={() => downloadText(exportGearDXF(p), gearFilename(p), "application/dxf")}
          disabled={blocking}
          className="w-full mt-4 py-3 rounded-lg font-semibold text-sm bg-red-600 hover:bg-red-500 text-white disabled:bg-neutral-800 disabled:text-neutral-500 disabled:cursor-not-allowed cursor-pointer"
        >
          {t.downloadGearDxf}
        </button>
      </div>

      {/* Preview */}
      <div className="flex-1 preview-bg flex items-center justify-center p-6 overflow-auto">
        {svg ? (
          <div className="preview-container w-full h-full flex items-center justify-center" dangerouslySetInnerHTML={{ __html: svg }} />
        ) : (
          <p className="text-[var(--c-text-muted)] text-sm">{t.fixErrors}</p>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-[var(--c-text-muted)]">{label}</span>
      <span className="text-[var(--c-accent-2)] font-mono">{value}</span>
    </div>
  );
}
