// ============================================================================
// Export utilities — PNG raster, text/blob download helpers
// ============================================================================

import { saveAs } from "file-saver";

/** Save a string as a downloadable file. */
export function downloadText(text: string, filename: string, mime: string) {
  saveAs(new Blob([text], { type: `${mime};charset=utf-8` }), filename);
}

/**
 * Rasterize an SVG string to a PNG and trigger a download.
 * Renders on a transparent canvas at the requested pixel width.
 */
export async function svgToPng(
  svg: string,
  filename: string,
  pxWidth = 1200
): Promise<void> {
  const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  try {
    const img = await loadImage(url);
    const ratio = img.height && img.width ? img.height / img.width : 1;
    const canvas = document.createElement("canvas");
    canvas.width = pxWidth;
    canvas.height = Math.round(pxWidth * ratio) || pxWidth;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("no 2d context");
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    await new Promise<void>((resolve) =>
      canvas.toBlob((b) => {
        if (b) saveAs(b, filename);
        resolve();
      }, "image/png")
    );
  } finally {
    URL.revokeObjectURL(url);
  }
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}
