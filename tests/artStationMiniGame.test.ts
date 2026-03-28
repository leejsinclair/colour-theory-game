import { describe, expect, test } from "vitest";
import { getArtCoverage, type ArtPadState } from "../src/web/legacy/artStationMiniGame";

describe("getArtCoverage", () => {
  test("returns 0 when all pixels are white", () => {
    const artPad: ArtPadState = {
      cols: 2,
      rows: 2,
      pixels: ["#ffffff", "#ffffff", "#ffffff", "#ffffff"],
    };

    expect(getArtCoverage(artPad)).toBe(0);
  });

  test("returns colored pixel ratio", () => {
    const artPad: ArtPadState = {
      cols: 2,
      rows: 2,
      pixels: ["#ffffff", "#ff0000", "#00ff00", "#ffffff"],
    };

    expect(getArtCoverage(artPad)).toBe(0.5);
  });
});
