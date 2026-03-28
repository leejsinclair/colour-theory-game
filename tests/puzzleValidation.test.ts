import { describe, expect, test } from "vitest";
import { circularHueDistance, isTriadValid, shuffleArray, validatePuzzleInput } from "../src/web/puzzleValidation";

// ─────────────────────────────────────────────────────────────────────────────
// circularHueDistance
// ─────────────────────────────────────────────────────────────────────────────
describe("circularHueDistance", () => {
  test("same hue returns 0", () => {
    expect(circularHueDistance(0, 0)).toBe(0);
    expect(circularHueDistance(180, 180)).toBe(0);
  });

  test("opposite hues return 180", () => {
    expect(circularHueDistance(0, 180)).toBe(180);
    expect(circularHueDistance(90, 270)).toBe(180);
  });

  test("wraps around 360", () => {
    expect(circularHueDistance(350, 10)).toBe(20);
    expect(circularHueDistance(10, 350)).toBe(20);
  });

  test("handles values > 360", () => {
    expect(circularHueDistance(0, 370)).toBe(10);
  });

  test("handles negative angles", () => {
    expect(circularHueDistance(0, -10)).toBe(10);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// isTriadValid
// ─────────────────────────────────────────────────────────────────────────────
describe("isTriadValid", () => {
  test("exact 120° triad passes", () => {
    expect(isTriadValid(0, 120, 240)).toBe(true);
  });

  test("rotated exact triad passes", () => {
    expect(isTriadValid(30, 150, 270)).toBe(true);
  });

  test("within ±15° tolerance passes", () => {
    expect(isTriadValid(0, 115, 235)).toBe(true);
    expect(isTriadValid(0, 135, 255)).toBe(true);
  });

  test("outside ±15° tolerance fails", () => {
    expect(isTriadValid(0, 100, 200)).toBe(false);
  });

  test("two hues close together fail", () => {
    expect(isTriadValid(0, 10, 240)).toBe(false);
  });

  test("wraps around 360 correctly", () => {
    expect(isTriadValid(350, 110, 230)).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// shuffleArray
// ─────────────────────────────────────────────────────────────────────────────
describe("shuffleArray", () => {
  test("returns the same elements in any order", () => {
    const input = [1, 2, 3, 4, 5];
    const result = shuffleArray(input);
    expect(result).toHaveLength(input.length);
    expect(result.sort()).toEqual([...input].sort());
  });

  test("does not mutate the original array", () => {
    const input = [1, 2, 3];
    const copy = [...input];
    shuffleArray(input);
    expect(input).toEqual(copy);
  });

  test("single-element array is unchanged", () => {
    expect(shuffleArray([42])).toEqual([42]);
  });

  test("empty array is returned unchanged", () => {
    expect(shuffleArray([])).toEqual([]);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// validatePuzzleInput – per-puzzle cases
// ─────────────────────────────────────────────────────────────────────────────
describe("validatePuzzleInput", () => {
  test("puzzle-01: all beams + overlap passes", () => {
    expect(
      validatePuzzleInput("puzzle-01", { redBeam: true, greenBeam: true, blueBeam: true, overlap: true }),
    ).toBe(true);
  });

  test("puzzle-01: missing overlap fails", () => {
    expect(
      validatePuzzleInput("puzzle-01", { redBeam: true, greenBeam: true, blueBeam: true, overlap: false }),
    ).toBe(false);
  });

  test("puzzle-02: exact target match passes", () => {
    const target = { cyan: 0.5, magenta: 0.3, yellow: 0.7 };
    expect(
      validatePuzzleInput("puzzle-02", { cyan: 0.5, magenta: 0.3, yellow: 0.7, target }),
    ).toBe(true);
  });

  test("puzzle-02: values outside tolerance fail", () => {
    const target = { cyan: 0.5, magenta: 0.3, yellow: 0.7 };
    expect(
      validatePuzzleInput("puzzle-02", { cyan: 0.7, magenta: 0.3, yellow: 0.7, target }),
    ).toBe(false);
  });

  test("puzzle-03: red+green complement pair passes", () => {
    expect(
      validatePuzzleInput("puzzle-03", { pigments: ["red", "green"], luminousShadow: true }),
    ).toBe(true);
  });

  test("puzzle-03: blue+orange complement pair passes", () => {
    expect(
      validatePuzzleInput("puzzle-03", { pigments: ["orange", "blue"], luminousShadow: true }),
    ).toBe(true);
  });

  test("puzzle-03: non-complement pair fails", () => {
    expect(
      validatePuzzleInput("puzzle-03", { pigments: ["red", "blue"], luminousShadow: true }),
    ).toBe(false);
  });

  test("puzzle-03: correct pair without luminousShadow fails", () => {
    expect(
      validatePuzzleInput("puzzle-03", { pigments: ["red", "green"], luminousShadow: false }),
    ).toBe(false);
  });

  test("puzzle-04: grayscale with readability ≥ 0.75 passes", () => {
    expect(
      validatePuzzleInput("puzzle-04", { usesOnlyBlackAndWhite: true, blurReadability: 0.8 }),
    ).toBe(true);
  });

  test("puzzle-04: low readability fails", () => {
    expect(
      validatePuzzleInput("puzzle-04", { usesOnlyBlackAndWhite: true, blurReadability: 0.5 }),
    ).toBe(false);
  });

  test("puzzle-05: sorted values + revealed image passes", () => {
    expect(
      validatePuzzleInput("puzzle-05", {
        orderedValues: [1, 2, 3, 4, 5],
        hiddenImageRevealed: true,
      }),
    ).toBe(true);
  });

  test("puzzle-05: unsorted values fail", () => {
    expect(
      validatePuzzleInput("puzzle-05", {
        orderedValues: [3, 1, 2, 4, 5],
        hiddenImageRevealed: true,
      }),
    ).toBe(false);
  });

  test("puzzle-06: 3+ explored hues + peak discovery passes", () => {
    expect(
      validatePuzzleInput("puzzle-06", {
        exploredHues: [0, 120, 240],
        discoveredDifferentChromaPeaks: true,
      }),
    ).toBe(true);
  });

  test("puzzle-07: red → green passes", () => {
    expect(validatePuzzleInput("puzzle-07", { selectedColorA: "red", selectedColorB: "green" })).toBe(true);
  });

  test("puzzle-07: red → blue fails", () => {
    expect(validatePuzzleInput("puzzle-07", { selectedColorA: "red", selectedColorB: "blue" })).toBe(false);
  });

  test("puzzle-08: valid triad passes", () => {
    expect(validatePuzzleInput("puzzle-08", { hueAngles: [0, 120, 240] })).toBe(true);
  });

  test("puzzle-08: invalid triad fails", () => {
    expect(validatePuzzleInput("puzzle-08", { hueAngles: [0, 60, 120] })).toBe(false);
  });

  test("puzzle-09: all correct selections pass", () => {
    expect(
      validatePuzzleInput("puzzle-09", {
        selections: {
          "joyful carnival": "C",
          "calm ocean": "A",
          "creepy dungeon": "B",
          "romantic sunset": "D",
          "focused studio": "A",
          "mystical and premium": "D",
        },
      }),
    ).toBe(true);
  });

  test("puzzle-09: one wrong selection fails", () => {
    expect(
      validatePuzzleInput("puzzle-09", {
        selections: {
          "joyful carnival": "A", // wrong
          "calm ocean": "A",
          "creepy dungeon": "B",
          "romantic sunset": "D",
          "focused studio": "A",
          "mystical and premium": "D",
        },
      }),
    ).toBe(false);
  });

  test("puzzle-10: adjusted backgrounds + small perceived difference passes", () => {
    expect(
      validatePuzzleInput("puzzle-10", { backgroundsAdjusted: true, perceivedDifference: 0.04 }),
    ).toBe(true);
  });

  test("puzzle-11: orange surroundings without grey change passes", () => {
    expect(
      validatePuzzleInput("puzzle-11", { usedOrangeSurroundings: true, greySquareChanged: false }),
    ).toBe(true);
  });

  test("puzzle-12: neutralCount ≥ 2 and contrast ≥ 0.65 passes", () => {
    expect(
      validatePuzzleInput("puzzle-12", { neutralCount: 3, accentContrast: 0.8 }),
    ).toBe(true);
  });

  test("puzzle-12: low contrast fails", () => {
    expect(
      validatePuzzleInput("puzzle-12", { neutralCount: 3, accentContrast: 0.5 }),
    ).toBe(false);
  });

  test("puzzle-13: all depth cues active passes", () => {
    expect(
      validatePuzzleInput("puzzle-13", {
        edgeSharpnessDropsWithDistance: true,
        saturationDropsWithDistance: true,
        hueShiftsCoolerWithDistance: true,
      }),
    ).toBe(true);
  });

  test("puzzle-14: blue shift + strong scattering passes", () => {
    expect(
      validatePuzzleInput("puzzle-14", { farObjectsShiftBlue: true, scatteringStrength: 0.8 }),
    ).toBe(true);
  });

  test("puzzle-14: weak scattering fails", () => {
    expect(
      validatePuzzleInput("puzzle-14", { farObjectsShiftBlue: true, scatteringStrength: 0.5 }),
    ).toBe(false);
  });

  test("puzzle-15: golden hour conditions pass", () => {
    expect(
      validatePuzzleInput("puzzle-15", {
        palettesMatched: true,
        sunHeight: 0.2,
        colorTemperature: 0.85,
        atmosphere: 0.5,
      }),
    ).toBe(true);
  });

  test("puzzle-15: high sun fails", () => {
    expect(
      validatePuzzleInput("puzzle-15", {
        palettesMatched: true,
        sunHeight: 0.6,
        colorTemperature: 0.85,
        atmosphere: 0.5,
      }),
    ).toBe(false);
  });

  test("puzzle-16: valid yellow+blue pair with low mud passes", () => {
    expect(
      validatePuzzleInput("puzzle-16", {
        pigments: ["hansa yellow", "phthalo blue"],
        mudLevel: 0.1,
      }),
    ).toBe(true);
  });

  test("puzzle-16: too much mud fails", () => {
    expect(
      validatePuzzleInput("puzzle-16", {
        pigments: ["hansa yellow", "phthalo blue"],
        mudLevel: 0.3,
      }),
    ).toBe(false);
  });

  test("puzzle-16: two yellows (no blue) fails", () => {
    expect(
      validatePuzzleInput("puzzle-16", {
        pigments: ["hansa yellow", "cadmium lemon"],
        mudLevel: 0.1,
      }),
    ).toBe(false);
  });

  test("puzzle-17: mudLevel < 0.58 passes", () => {
    expect(validatePuzzleInput("puzzle-17", { mudLevel: 0.4 })).toBe(true);
  });

  test("puzzle-17: mudLevel ≥ 0.58 fails", () => {
    expect(validatePuzzleInput("puzzle-17", { mudLevel: 0.6 })).toBe(false);
  });

  test("puzzle-17: missing mudLevel defaults to fail", () => {
    expect(validatePuzzleInput("puzzle-17", {})).toBe(false);
  });

  test("puzzle-18: pure dots with coverage and 3+ colors passes", () => {
    expect(
      validatePuzzleInput("puzzle-18", { usedPureDots: true, mixedOnPalette: false, opticalBlendVisible: true }),
    ).toBe(true);
  });

  test("puzzle-18: mixed on palette fails", () => {
    expect(
      validatePuzzleInput("puzzle-18", { usedPureDots: true, mixedOnPalette: true, opticalBlendVisible: true }),
    ).toBe(false);
  });

  test("puzzle-19: exact 60/30/10 passes", () => {
    expect(
      validatePuzzleInput("puzzle-19", { primaryPct: 60, secondaryPct: 30, accentPct: 10 }),
    ).toBe(true);
  });

  test("puzzle-19: within tolerance passes", () => {
    expect(
      validatePuzzleInput("puzzle-19", { primaryPct: 62, secondaryPct: 28, accentPct: 10 }),
    ).toBe(true);
  });

  test("puzzle-19: outside tolerance fails", () => {
    expect(
      validatePuzzleInput("puzzle-19", { primaryPct: 50, secondaryPct: 40, accentPct: 10 }),
    ).toBe(false);
  });

  test("puzzle-20: correct colour-emotion mapping passes", () => {
    expect(
      validatePuzzleInput("puzzle-20", {
        mappings: { red: "excitement", blue: "trust", yellow: "optimism", green: "growth" },
      }),
    ).toBe(true);
  });

  test("puzzle-20: wrong mapping fails", () => {
    expect(
      validatePuzzleInput("puzzle-20", {
        mappings: { red: "trust", blue: "excitement", yellow: "optimism", green: "growth" },
      }),
    ).toBe(false);
  });

  test("puzzle-21: near-complementary hues with balanced value passes", () => {
    expect(validatePuzzleInput("puzzle-21", { hueA: 0, hueB: 180, valueBalanced: true })).toBe(true);
  });

  test("puzzle-21: within ±20° tolerance passes", () => {
    expect(validatePuzzleInput("puzzle-21", { hueA: 0, hueB: 165, valueBalanced: true })).toBe(true);
  });

  test("puzzle-21: hues not complementary fails", () => {
    expect(validatePuzzleInput("puzzle-21", { hueA: 0, hueB: 90, valueBalanced: true })).toBe(false);
  });

  test("puzzle-21: complementary but value not balanced fails", () => {
    expect(validatePuzzleInput("puzzle-21", { hueA: 0, hueB: 180, valueBalanced: false })).toBe(false);
  });

  test("puzzle-23: all three correct surface choices pass", () => {
    expect(validatePuzzleInput("puzzle-23", { selectedIndices: [1, 3, 0] })).toBe(true);
  });

  test("puzzle-23: lighting-biased selections fail", () => {
    expect(validatePuzzleInput("puzzle-23", { selectedIndices: [0, 1, 2] })).toBe(false);
  });

  test("puzzle-23: incomplete round answers fail", () => {
    expect(validatePuzzleInput("puzzle-23", { selectedIndices: [1, 3] })).toBe(false);
  });

  test("unknown puzzle-id returns false", () => {
    expect(validatePuzzleInput("puzzle-99", {})).toBe(false);
  });
});
