// ============================================================================
// App — Main Garari Maker application
// ============================================================================
// Two-panel layout:
//   Left:  Parameter inputs (chain, teeth, bore, mounting holes, keyway)
//   Right: Live SVG preview of the sprocket geometry
//
// The sprocket model is rebuilt on every parameter change using Maker.js,
// and the SVG preview is re-rendered from the model. DXF export creates
// a CNC/laser-ready file with proper layers and mm units.
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
    <div className="h-screen w-screen flex flex-col bg-[#0f0808] text-white overflow-hidden">
      {/* Top branding bar */}
      <header className="flex items-center justify-between px-5 py-2.5 bg-[#1a0e0e] border-b border-red-900/40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center font-black text-white text-sm shadow-lg shadow-red-900/50">
            G
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-tight leading-none">
              Garari Maker
            </h1>
            <p className="text-[10px] text-red-300/60 tracking-wide">
              PRECISION SPROCKET DXF GENERATOR
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-neutral-500">
            Powered by{" "}
            <a
              href="https://gararimaker.bysufi.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-red-400 hover:text-red-300 font-semibold transition-colors"
            >
              Sufi Engineering
            </a>
          </p>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel — Parameters */}
        <ParameterPanel
          params={params}
          dims={dims}
          errors={errors}
          onChange={setParams}
          onExport={handleExport}
        />

        {/* Right Panel — SVG Preview */}
        <PreviewPanel svgContent={svgContent} />
      </div>

      {/* Download success modal */}
      {showDownloadModal && (
        <DownloadModal onClose={() => setShowDownloadModal(false)} />
      )}
    </div>
  );
}
