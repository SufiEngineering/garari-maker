// ============================================================================
// PreviewPanel — Right panel with live 2D (SVG) or 3D (Three.js) preview
// ============================================================================

import { useMemo, useState, lazy, Suspense } from "react";
import { useLang } from "../i18n/LangContext";
import type { SprocketParams, CalculatedDimensions } from "../types/sprocket";

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

  // Memoize the HTML to avoid unnecessary re-renders
  const html = useMemo(() => ({ __html: svgContent }), [svgContent]);

  return (
    <div className="flex-1 h-full flex flex-col bg-[#0f0808] overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 sm:px-4 py-2 bg-[#1a0e0e] border-b border-red-900/30">
        <span className="text-xs sm:text-sm text-neutral-400">{t.livePreview}</span>

        {/* 2D / 3D toggle */}
        <div className="flex items-center gap-1 bg-[#0f0808] rounded-lg p-0.5 border border-red-900/30">
          <button
            onClick={() => setMode("2d")}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              mode === "2d"
                ? "bg-red-600 text-white shadow"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            {t.view2d}
          </button>
          <button
            onClick={() => setMode("3d")}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              mode === "3d"
                ? "bg-red-600 text-white shadow"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            {t.view3d}
          </button>
        </div>

        <span className="text-[10px] sm:text-xs text-neutral-600 hidden sm:inline">
          {mode === "2d" ? t.previewNote : t.previewNote3d}
        </span>
      </div>

      {/* Preview area */}
      <div className="flex-1 flex items-center justify-center overflow-hidden preview-bg relative">
        {mode === "2d" ? (
          /* ---- 2D SVG ---- */
          <div className="w-full h-full flex items-center justify-center p-3 sm:p-6 overflow-auto">
            {svgContent ? (
              <div
                className="preview-container w-full h-full flex items-center justify-center"
                dangerouslySetInnerHTML={html}
              />
            ) : (
              <EmptyState text={t.adjustToPreview} />
            )}
          </div>
        ) : (
          /* ---- 3D Three.js ---- */
          <Suspense
            fallback={
              <div className="text-neutral-500 text-sm animate-pulse">
                Loading 3D…
              </div>
            }
          >
            {dims ? (
              <Preview3D params={params} dims={dims} />
            ) : (
              <EmptyState text={t.adjustToPreview} />
            )}
          </Suspense>
        )}
      </div>
    </div>
  );
}

/** Placeholder shown when there's nothing to render */
function EmptyState({ text }: { text: string }) {
  return (
    <div className="text-neutral-700 text-center">
      <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-3 sm:mb-4 rounded-full bg-red-900/20 border border-red-900/20 flex items-center justify-center">
        <span className="text-3xl sm:text-4xl">⚙️</span>
      </div>
      <p className="text-xs sm:text-sm text-neutral-500">{text}</p>
    </div>
  );
}
