// ============================================================================
// PreviewPanel — Right panel with live SVG preview of the sprocket
// ============================================================================

import { useMemo } from "react";
import { useLang } from "../i18n/LangContext";

interface PreviewPanelProps {
  /** Raw SVG string from Maker.js exporter */
  svgContent: string;
}

export default function PreviewPanel({ svgContent }: PreviewPanelProps) {
  const { t } = useLang();
  // Memoize the HTML to avoid unnecessary re-renders
  const html = useMemo(() => ({ __html: svgContent }), [svgContent]);

  return (
    <div className="flex-1 h-full flex flex-col bg-[#0f0808] overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 sm:px-4 py-2 bg-[#1a0e0e] border-b border-red-900/30">
        <span className="text-xs sm:text-sm text-neutral-400">{t.livePreview}</span>
        <span className="text-[10px] sm:text-xs text-neutral-600 hidden sm:inline">
          {t.previewNote}
        </span>
      </div>

      {/* SVG Preview */}
      <div className="flex-1 flex items-center justify-center p-3 sm:p-6 overflow-auto preview-bg">
        {svgContent ? (
          <div
            className="preview-container w-full h-full flex items-center justify-center"
            dangerouslySetInnerHTML={html}
          />
        ) : (
          <div className="text-neutral-700 text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-3 sm:mb-4 rounded-full bg-red-900/20 border border-red-900/20 flex items-center justify-center">
              <span className="text-3xl sm:text-4xl">⚙️</span>
            </div>
            <p className="text-xs sm:text-sm text-neutral-500">{t.adjustToPreview}</p>
          </div>
        )}
      </div>
    </div>
  );
}
