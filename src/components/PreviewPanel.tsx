// ============================================================================
// PreviewPanel — Right panel with live 2D (SVG) or 3D (Three.js) preview
// ============================================================================

import { useMemo, useState, lazy, Suspense } from "react";
import { useLang } from "../i18n/LangContext";
import type { SprocketParams, CalculatedDimensions } from "../types/sprocket";
import { exportDimensionedSVG, DIM_COLORS } from "../engine/sprocketGeometry";
import { svgToPng } from "../utils/exporters";

const Preview3D = lazy(() => import("./Preview3D"));

interface PreviewPanelProps {
  /** Raw SVG string from Maker.js exporter */
  svgContent: string;
  params: SprocketParams;
  dims: CalculatedDimensions | null;
}

export default function PreviewPanel({ svgContent, params, dims }: PreviewPanelProps) {
  const { t } = useLang();
  const [mode, setMode] = useState<"2d" | "3d">("2d");
  const [showDims, setShowDims] = useState(false);

  // When dimensions are toggled on, render an SVG with reference circles.
  const activeSvg = useMemo(() => {
    if (mode !== "2d" || !svgContent) return svgContent;
    return showDims ? exportDimensionedSVG(params) : svgContent;
  }, [mode, showDims, params, svgContent]);

  const html = useMemo(() => ({ __html: activeSvg }), [activeSvg]);

  const legend: { c: string; label: string }[] = dims
    ? [
        { c: DIM_COLORS.od, label: `OD ${dims.outsideDiameter.toFixed(1)}` },
        { c: DIM_COLORS.pd, label: `PD ${dims.pitchDiameter.toFixed(1)}` },
        { c: DIM_COLORS.rd, label: `RD ${dims.rootDiameter.toFixed(1)}` },
        ...(params.mountingHolesEnabled
          ? [{ c: DIM_COLORS.bcd, label: `BCD ${params.boltCircleDiameter.toFixed(1)}` }]
          : []),
      ]
    : [];

  return (
    <div className="flex-1 h-full flex flex-col bg-[var(--c-bg)] overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-2 px-3 sm:px-4 py-2 bg-[var(--c-surface-2)] border-b border-[var(--c-border)]">
        <span className="text-xs sm:text-sm text-[var(--c-text-3)] hidden sm:inline">{t.livePreview}</span>

        <div className="flex items-center gap-2">
          {/* 2D / 3D toggle */}
          <div className="flex items-center gap-1 bg-[var(--c-bg)] rounded-lg p-0.5 border border-[var(--c-border)]">
            <button
              onClick={() => setMode("2d")}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                mode === "2d" ? "bg-red-600 text-white shadow" : "text-[var(--c-text-3)] hover:text-[var(--c-text)]"
              }`}
            >
              {t.view2d}
            </button>
            <button
              onClick={() => setMode("3d")}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                mode === "3d" ? "bg-red-600 text-white shadow" : "text-[var(--c-text-3)] hover:text-[var(--c-text)]"
              }`}
            >
              {t.view3d}
            </button>
          </div>

          {mode === "2d" && (
            <>
              <button
                onClick={() => setShowDims((s) => !s)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md border transition-colors cursor-pointer ${
                  showDims
                    ? "bg-red-600 text-white border-red-600"
                    : "text-[var(--c-text-3)] border-[var(--c-border)] hover:text-[var(--c-text)]"
                }`}
              >
                📐 {t.showDimensions}
              </button>
              <button
                onClick={() => activeSvg && svgToPng(activeSvg, "garari-preview.png")}
                disabled={!activeSvg}
                className="px-2.5 py-1 text-xs font-semibold rounded-md border border-[var(--c-border)] text-[var(--c-text-3)] hover:text-[var(--c-text)] disabled:opacity-40 cursor-pointer"
              >
                {t.downloadPng}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Preview area */}
      <div className="flex-1 flex items-center justify-center overflow-hidden preview-bg relative">
        {mode === "2d" ? (
          <div className="w-full h-full flex items-center justify-center p-3 sm:p-6 overflow-auto">
            {activeSvg ? (
              <div className="preview-container w-full h-full flex items-center justify-center" dangerouslySetInnerHTML={html} />
            ) : (
              <EmptyState text={t.adjustToPreview} />
            )}
          </div>
        ) : (
          <Suspense fallback={<div className="text-[var(--c-text-muted)] text-sm animate-pulse">Loading 3D…</div>}>
            {dims ? <Preview3D params={params} dims={dims} /> : <EmptyState text={t.adjustToPreview} />}
          </Suspense>
        )}

        {/* Dimension legend */}
        {mode === "2d" && showDims && legend.length > 0 && (
          <div className="absolute bottom-3 left-3 bg-[var(--c-surface-2)]/90 backdrop-blur border border-[var(--c-border)] rounded-lg p-2 text-[10px] space-y-1">
            {legend.map((l) => (
              <div key={l.label} className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 inline-block" style={{ background: l.c }} />
                <span className="text-[var(--c-text-2)] font-mono">{l.label} mm</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/** Placeholder shown when there's nothing to render */
function EmptyState({ text }: { text: string }) {
  return (
    <div className="text-[var(--c-text-faint)] text-center">
      <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-3 sm:mb-4 rounded-full bg-red-900/20 border border-red-900/20 flex items-center justify-center">
        <span className="text-3xl sm:text-4xl">⚙️</span>
      </div>
      <p className="text-xs sm:text-sm text-[var(--c-text-muted)]">{text}</p>
    </div>
  );
}
