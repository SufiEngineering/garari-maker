// ============================================================================
// PreviewPanel — Right panel with live SVG preview of the sprocket
// ============================================================================

import { useMemo } from "react";

interface PreviewPanelProps {
  /** Raw SVG string from Maker.js exporter */
  svgContent: string;
}

export default function PreviewPanel({ svgContent }: PreviewPanelProps) {
  // Memoize the HTML to avoid unnecessary re-renders
  const html = useMemo(() => ({ __html: svgContent }), [svgContent]);

  return (
    <div className="flex-1 h-full flex flex-col bg-[#0f0808] overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#1a0e0e] border-b border-red-900/30">
        <span className="text-sm text-neutral-400">🔍 Live Preview</span>
        <span className="text-xs text-neutral-600">
          SVG preview — download DXF for CNC use
        </span>
      </div>

      {/* SVG Preview */}
      <div className="flex-1 flex items-center justify-center p-6 overflow-auto preview-bg">
        {svgContent ? (
          <div
            className="preview-container w-full h-full flex items-center justify-center"
            dangerouslySetInnerHTML={html}
          />
        ) : (
          <div className="text-neutral-700 text-center">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-red-900/20 border border-red-900/20 flex items-center justify-center">
              <span className="text-4xl">⚙️</span>
            </div>
            <p className="text-sm text-neutral-500">Adjust parameters to see preview</p>
          </div>
        )}
      </div>
    </div>
  );
}
