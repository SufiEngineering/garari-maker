// ============================================================================
// SpecSheet — printable specification sheet for the current sprocket
// ============================================================================

import type {
  SprocketParams,
  CalculatedDimensions,
  WeightEstimate,
} from "../types/sprocket";
import { CHAIN_TABLE } from "../data/chainTable";
import { useLang } from "../i18n/LangContext";
import { useSettings, formatLength } from "../i18n/SettingsContext";

interface Props {
  params: SprocketParams;
  dims: CalculatedDimensions | null;
  weight: WeightEstimate | null;
  svgContent: string;
  onClose: () => void;
}

export default function SpecSheet({ params, dims, weight, svgContent, onClose }: Props) {
  const { t } = useLang();
  const { units } = useSettings();
  const chain = CHAIN_TABLE.find(
    (c) => c.standard === params.standard && c.chainNumber === params.chainNumber
  );

  const L = (mm: number) => formatLength(mm, units);

  const rows: [string, string][] = [
    [t.chainStandard, params.standard === "iso" ? "ISO / DIN 8187" : "ANSI"],
    [t.chainNumber, chain?.label ?? String(params.chainNumber)],
    [t.numberOfTeeth, String(params.numTeeth)],
    [t.strandCount, String(params.strandCount)],
    [t.boreDiameter, L(params.boreDiameter)],
    [t.plateThickness, L(params.plateThickness)],
    [t.material, weight?.materialName ?? params.materialKey],
  ];
  if (params.hubEnabled) rows.push([t.hubDiameter, L(params.hubDiameter)]);
  if (params.keywayEnabled)
    rows.push([t.sectionKeyway, `${L(params.keywayWidth)} × ${L(params.keywayDepth)}`]);
  if (params.mountingHolesEnabled)
    rows.push([
      t.sectionMountingHoles,
      `${params.mountingHoleCount} × ⌀${L(params.mountingHoleDiameter)} @ BCD ${L(params.boltCircleDiameter)}`,
    ]);
  if (dims) {
    rows.push([t.pitchDiameter, L(dims.pitchDiameter)]);
    rows.push([t.outsideDiameter, L(dims.outsideDiameter)]);
    rows.push([t.rootDiameter, L(dims.rootDiameter)]);
  }
  if (weight)
    rows.push([
      t.estimatedWeight,
      weight.weightGrams >= 1000
        ? `${(weight.weightGrams / 1000).toFixed(2)} kg`
        : `${weight.weightGrams} g`,
    ]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-white text-black rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div id="spec-sheet" className="p-6">
          <div className="flex items-start justify-between border-b-2 border-black/80 pb-3 mb-4">
            <div>
              <h1 className="text-xl font-bold">{t.specSheetTitle}</h1>
              <p className="text-xs text-gray-600">
                {t.generatedOn} {new Date().toLocaleDateString()} — {t.sufiEngineering}
              </p>
            </div>
            <div className="text-3xl">⚙️</div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div
              className="w-40 h-40 shrink-0 border border-gray-300 rounded flex items-center justify-center spec-svg"
              dangerouslySetInnerHTML={{ __html: svgContent }}
            />
            <table className="flex-1 text-sm border-collapse">
              <thead>
                <tr className="border-b border-gray-400 text-left">
                  <th className="py-1 pr-4 font-semibold">{t.parameter}</th>
                  <th className="py-1 font-semibold">{t.value}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(([k, v], i) => (
                  <tr key={i} className="border-b border-gray-200">
                    <td className="py-1 pr-4 text-gray-700">{k}</td>
                    <td className="py-1 font-mono">{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-[10px] text-gray-500 mt-4 text-center">
            sufi.engineering — Garari Maker
          </p>
        </div>

        <div className="flex gap-2 p-4 border-t border-gray-200 print:hidden">
          <button
            onClick={() => window.print()}
            className="flex-1 py-2.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-sm font-semibold cursor-pointer"
          >
            {t.printSpec}
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-semibold cursor-pointer"
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
}
