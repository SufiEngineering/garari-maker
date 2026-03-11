// ============================================================================
// App — Main Garari Maker application
// ============================================================================
// Responsive layout:
//   Desktop: Side-by-side panels (parameters left, preview right)
//   Mobile:  Tabbed view switching between parameters and preview
// ============================================================================

import { useState, useMemo, useCallback } from "react";
import { saveAs } from "file-saver";
import type { SprocketParams } from "./types/sprocket";
import {
  calculateDimensions,
  validateParams,
  buildSprocketModel,
  exportToSVG,
  exportToDXF,
  generateDxfFilename,
} from "./engine/sprocketGeometry";
import { useLang } from "./i18n/LangContext";
import ParameterPanel from "./components/ParameterPanel";
import PreviewPanel from "./components/PreviewPanel";
import DownloadModal from "./components/DownloadModal";

// ============================================================================
// Default parameter values — sensible starting configuration
// ============================================================================
const DEFAULT_PARAMS: SprocketParams = {
  chainNumber: 40,
  numTeeth: 17,
  boreDiameter: 12,
  hubEnabled: false,
  hubDiameter: 25,
  mountingHolesEnabled: false,
  mountingHoleCount: 4,
  mountingHoleDiameter: 5,
  boltCircleDiameter: 40,
  keywayEnabled: false,
  keywayWidth: 4,
  keywayDepth: 2.5,
};

export default function App() {
  const [params, setParams] = useState<SprocketParams>(DEFAULT_PARAMS);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [mobileTab, setMobileTab] = useState<"params" | "preview">("params");
  const [quantity, setQuantity] = useState(1);
  const { t, toggleLang, isUrdu } = useLang();

  // Calculate dimensions from current parameters
  const dims = useMemo(() => calculateDimensions(params), [params]);

  // Validate parameters
  const errors = useMemo(() => validateParams(params), [params]);

  // Build the Maker.js model and generate SVG preview
  const { svgContent } = useMemo(() => {
    if (errors.length > 0 || !dims) {
      return { svgContent: "" };
    }
    const model = buildSprocketModel(params);
    if (!model) return { svgContent: "" };

    const svg = exportToSVG(model);
    return { svgContent: svg };
  }, [params, errors, dims]);

  // DXF export handler — show modal after download
  const handleExport = useCallback(() => {
    if (errors.length > 0) return;

    const model = buildSprocketModel(params);
    if (!model) return;

    const dxfString = exportToDXF(model);
    const blob = new Blob([dxfString], {
      type: "application/dxf;charset=utf-8",
    });
    const filename = generateDxfFilename(params);
    saveAs(blob, filename);
    setShowDownloadModal(true);
  }, [params, errors]);

  return (
    <div
      className={`h-screen w-screen flex flex-col bg-[#0f0808] text-white overflow-hidden ${isUrdu ? "font-urdu" : ""}`}
      dir={isUrdu ? "rtl" : "ltr"}
    >
      {/* Top branding bar */}
      <header className="flex items-center justify-between px-3 sm:px-5 py-2 sm:py-2.5 bg-[#1a0e0e] border-b border-red-900/40">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-red-600 flex items-center justify-center font-black text-white text-xs sm:text-sm shadow-lg shadow-red-900/50">
            G
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-bold text-white tracking-tight leading-none">
              {t.appName}
            </h1>
            <p className="text-[9px] sm:text-[10px] text-red-300/60 tracking-wide">
              {t.appSubtitle}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Language toggle */}
          <button
            onClick={toggleLang}
            className="px-2.5 py-1 rounded-md text-xs font-semibold bg-red-900/30 hover:bg-red-900/50 border border-red-800/40 text-red-300 hover:text-white transition-colors cursor-pointer"
          >
            {t.langLabel}
          </button>
          <div className="text-right hidden sm:block">
            <p className="text-[10px] text-neutral-500">
              {t.poweredBy}{" "}
              <a
                href="https://sufi.engineering"
                target="_blank"
                rel="noopener noreferrer"
                className="text-red-400 hover:text-red-300 font-semibold transition-colors"
              >
                {t.sufiEngineering}
              </a>
            </p>
          </div>
        </div>
      </header>

      {/* Mobile tab bar — only visible on small screens */}
      <div className="flex md:hidden border-b border-red-900/40 bg-[#140a0a]">
        <button
          onClick={() => setMobileTab("params")}
          className={`flex-1 py-2.5 text-sm font-semibold text-center transition-colors cursor-pointer ${
            mobileTab === "params"
              ? "text-red-400 border-b-2 border-red-500 bg-red-950/20"
              : "text-neutral-500 hover:text-neutral-300"
          }`}
        >
          {t.tabParameters}
        </button>
        <button
          onClick={() => setMobileTab("preview")}
          className={`flex-1 py-2.5 text-sm font-semibold text-center transition-colors cursor-pointer ${
            mobileTab === "preview"
              ? "text-red-400 border-b-2 border-red-500 bg-red-950/20"
              : "text-neutral-500 hover:text-neutral-300"
          }`}
        >
          {t.tabPreview}
        </button>
      </div>

      {/* Main content — responsive */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel — Parameters (always visible on desktop, tab-controlled on mobile) */}
        <div
          className={`${
            mobileTab === "params" ? "flex" : "hidden"
          } md:flex w-full md:w-80 md:min-w-[320px] flex-col`}
        >
          <ParameterPanel
            params={params}
            dims={dims}
            errors={errors}
            onChange={setParams}
            onExport={handleExport}
            quantity={quantity}
            onQuantityChange={setQuantity}
          />
        </div>

        {/* Right Panel — SVG Preview (always visible on desktop, tab-controlled on mobile) */}
        <div
          className={`${
            mobileTab === "preview" ? "flex" : "hidden"
          } md:flex flex-1 flex-col`}
        >
          <PreviewPanel svgContent={svgContent} />
        </div>
      </div>

      {/* Download success modal */}
      {showDownloadModal && (
        <DownloadModal
          params={params}
          dims={dims}
          quantity={quantity}
          onClose={() => setShowDownloadModal(false)}
        />
      )}
    </div>
  );
}
