import { describe, expect, test } from "vitest";
import {
  ART_PAD_BLANK,
  artStationResult,
  distinctDots,
  getArtCoverage,
  opticalPreview,
} from "../src/web/puzzles/artStationCoverage";

/**
 * T064 (US3) — pure coverage / optical-mixing math for the Art Station pad,
 * replacing the DOM-bound `tests/artStationMiniGame.test.ts`.
 */

const blank = (n: number): string[] => new Array(n).fill(ART_PAD_BLANK);

describe("getArtCoverage", () => {
  test("is 0 for a blank pad", () => {
    expect(getArtCoverage(blank(4))).toBe(0);
  });

  test("is the painted fraction", () => {
    expect(getArtCoverage(["#ffffff", "#ff0000", "#00ff00", "#ffffff"])).toBe(0.5);
  });

  test("is 0 for an empty pad", () => {
    expect(getArtCoverage([])).toBe(0);
  });
});

describe("distinctDots", () => {
  test("counts distinct non-blank colours", () => {
    expect(distinctDots(["#ffffff", "#ff0000", "#ff0000", "#00ff00", "#0000ff"])).toBe(3);
  });
});

describe("artStationResult", () => {
  test("a sparse single-colour pad has not met the bar", () => {
    const pixels = blank(100);
    pixels[0] = "#ff0000";
    const result = artStationResult(pixels);
    expect(result).toEqual({ usedPureDots: false, mixedOnPalette: false, opticalBlendVisible: false });
  });

  test("enough coverage across three colours passes every flag", () => {
    const pixels = blank(100);
    for (let i = 0; i < 15; i += 1) {
      pixels[i] = ["#ff0000", "#00ff00", "#0000ff"][i % 3];
    }
    expect(artStationResult(pixels)).toEqual({
      usedPureDots: true,
      mixedOnPalette: false,
      opticalBlendVisible: true,
    });
  });
});

describe("opticalPreview", () => {
  test("downsamples to previewCols × previewRows cells", () => {
    const cells = opticalPreview(blank(24), 6, 4, 3, 2);
    expect(cells).toHaveLength(6);
    expect(cells.every((cell) => cell === "rgb(255, 255, 255)")).toBe(true);
  });

  test("averages a painted block toward its colour", () => {
    const cols = 4;
    const rows = 2;
    const pixels = blank(cols * rows);
    pixels[0] = "#000000";
    pixels[1] = "#000000";
    // Top-left preview cell covers x0..1,y0 → all black.
    const cells = opticalPreview(pixels, cols, rows, 2, 2);
    expect(cells[0]).toBe("rgb(0, 0, 0)");
  });
});
