/**
 * Pure coverage / optical-mixing math for the Art Station pad (puzzle-18).
 * Extracted from the retired `src/web/legacy/artStationMiniGame.ts` so it can be
 * unit-tested without a DOM (research.md R4). `<ArtStationPad>` is the only UI
 * consumer.
 */

export const ART_PAD_BLANK = "#ffffff";

/** Fraction of pad cells that carry a non-blank dot. */
export function getArtCoverage(pixels: string[]): number {
  if (pixels.length === 0) {
    return 0;
  }
  const painted = pixels.filter((pixel) => pixel !== ART_PAD_BLANK).length;
  return painted / pixels.length;
}

/** Distinct pure colours the player has actually put down. */
export function distinctDots(pixels: string[]): number {
  return new Set(pixels.filter((pixel) => pixel !== ART_PAD_BLANK)).size;
}

/**
 * The Check payload for puzzle-18: enough coverage of pure dots, never mixed on
 * a palette, and at least three colours in play so an optical blend is visible.
 */
export function artStationResult(pixels: string[]): {
  usedPureDots: boolean;
  mixedOnPalette: false;
  opticalBlendVisible: boolean;
} {
  return {
    usedPureDots: getArtCoverage(pixels) >= 0.12,
    mixedOnPalette: false,
    opticalBlendVisible: distinctDots(pixels) >= 3,
  };
}

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  if (h.length !== 6) {
    return [255, 255, 255];
  }
  return [
    Number.parseInt(h.slice(0, 2), 16),
    Number.parseInt(h.slice(2, 4), 16),
    Number.parseInt(h.slice(4, 6), 16),
  ];
}

/**
 * Average a `cols × rows` pad down to a `previewCols × previewRows` grid of CSS
 * `rgb(...)` strings — the "step back and the dots blend" preview.
 */
export function opticalPreview(
  pixels: string[],
  cols: number,
  rows: number,
  previewCols: number,
  previewRows: number,
): string[] {
  const sampleW = cols / previewCols;
  const sampleH = rows / previewRows;
  const out: string[] = [];

  for (let py = 0; py < previewRows; py += 1) {
    for (let px = 0; px < previewCols; px += 1) {
      const startX = Math.floor(px * sampleW);
      const endX = Math.min(cols, Math.floor((px + 1) * sampleW));
      const startY = Math.floor(py * sampleH);
      const endY = Math.min(rows, Math.floor((py + 1) * sampleH));

      let r = 0;
      let g = 0;
      let b = 0;
      let count = 0;
      for (let y = startY; y < endY; y += 1) {
        for (let x = startX; x < endX; x += 1) {
          const [pr, pg, pb] = hexToRgb(pixels[y * cols + x] ?? ART_PAD_BLANK);
          r += pr;
          g += pg;
          b += pb;
          count += 1;
        }
      }
      const div = Math.max(1, count);
      out.push(`rgb(${Math.round(r / div)}, ${Math.round(g / div)}, ${Math.round(b / div)})`);
    }
  }
  return out;
}
