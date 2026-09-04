import { lazy, type LazyExoticComponent } from "react";
import type { PuzzleComponent } from "./types";
import { shuffleArray } from "../puzzleValidation";

/**
 * Every playable puzzle as a code-split `PuzzleComponent` (research.md R13).
 * `<PuzzlePlayer>` looks a puzzle up here, seeds its answer with
 * `initialInputFor`, and hosts it behind a `<Suspense>` boundary.
 *
 * The registry is intentionally loose on `TInput` (each view has its own answer
 * shape); `<PuzzlePlayer>` carries the value as `unknown` and the domain
 * validator reads only the keys it needs.
 */

type AnyPuzzleView = PuzzleComponent<any>;

const lazyView = (
  loader: () => Promise<{ default: AnyPuzzleView }>,
): LazyExoticComponent<AnyPuzzleView> => lazy(loader);

export const puzzleComponents: Record<string, LazyExoticComponent<AnyPuzzleView>> = {
  "puzzle-01": lazyView(() => import("./puzzle-01-view")),
  "puzzle-02": lazyView(() => import("./puzzle-02-view")),
  "puzzle-03": lazyView(() => import("./puzzle-03-view")),
  "puzzle-04": lazyView(() => import("./puzzle-04-view")),
  "puzzle-05": lazyView(() => import("./puzzle-05-view")),
  "puzzle-06": lazyView(() => import("./puzzle-06-view")),
  "puzzle-07": lazyView(() => import("./puzzle-07-view")),
  "puzzle-08": lazyView(() => import("./puzzle-08-view")),
  "puzzle-09": lazyView(() => import("./puzzle-09-view")),
  "puzzle-10": lazyView(() => import("./puzzle-10-view")),
  "puzzle-11": lazyView(() => import("./puzzle-11-view")),
  "puzzle-12": lazyView(() => import("./puzzle-12-view")),
  "puzzle-13": lazyView(() => import("./puzzle-13-view")),
  "puzzle-14": lazyView(() => import("./puzzle-14-view")),
  "puzzle-15": lazyView(() => import("./puzzle-15-view")),
  "puzzle-16": lazyView(() => import("./puzzle-16-view")),
  "puzzle-17": lazyView(() => import("./puzzle-17-view")),
  "puzzle-18": lazyView(() => import("./ArtStationPad")),
  "puzzle-19": lazyView(() => import("./puzzle-19-view")),
  "puzzle-20": lazyView(() => import("./puzzle-20-view")),
  "puzzle-21": lazyView(() => import("./puzzle-21-view")),
  "puzzle-23": lazyView(() => import("./puzzle-23-view")),
};

export function hasPuzzleComponent(puzzleId: string): boolean {
  return puzzleId in puzzleComponents;
}

/** Per-puzzle starting answer — matches the shape `validatePuzzleInput` expects. */
export function initialInputFor(puzzleId: string): unknown {
  switch (puzzleId) {
    case "puzzle-01":
      return { redBeam: false, greenBeam: false, blueBeam: false, overlap: false };
    case "puzzle-02":
      return { cyan: 0.1, magenta: 0.1, yellow: 0.1, target: { cyan: 0.4, magenta: 0.5, yellow: 0.2 } };
    case "puzzle-03":
      return { pigments: ["blue", "orange"], luminousShadow: false };
    case "puzzle-04":
      return { usesOnlyBlackAndWhite: true, blurReadability: (220 - 30) / 255 };
    case "puzzle-05":
      return { orderedValues: shuffleArray([0.05, 0.2, 0.4, 0.6, 0.8, 0.95]), hiddenImageRevealed: false };
    case "puzzle-06":
      return { exploredHues: [], discoveredDifferentChromaPeaks: false };
    case "puzzle-07":
      return { selectedColorA: "red", selectedColorB: "green" };
    case "puzzle-08":
      return { hueAngles: [0, 120, 240] };
    case "puzzle-09":
      return { selections: {} };
    case "puzzle-10":
      return { perceivedDifference: 0, backgroundsAdjusted: false };
    case "puzzle-11":
      return { usedOrangeSurroundings: true, greySquareChanged: false };
    case "puzzle-12":
      return { neutralCount: 1, accentContrast: 0.4 };
    case "puzzle-13":
      return {
        edgeSharpnessDropsWithDistance: false,
        saturationDropsWithDistance: false,
        hueShiftsCoolerWithDistance: false,
      };
    case "puzzle-14":
      return { farObjectsShiftBlue: false, scatteringStrength: 0.2 };
    case "puzzle-15":
      return { palettesMatched: false, sunHeight: 0.5, colorTemperature: 0.5, atmosphere: 0.5 };
    case "puzzle-16":
      return { pigments: [], mudLevel: 1 };
    case "puzzle-17":
      return { complementTouchesAdded: 0, mudLevel: 0.15, muddyResult: false };
    case "puzzle-18":
      return { usedPureDots: false, mixedOnPalette: false, opticalBlendVisible: false };
    case "puzzle-19":
      return { primaryPct: 40, secondaryPct: 40, accentPct: 20 };
    case "puzzle-20":
      return { mappings: {} };
    case "puzzle-21":
      return { hueA: 30, hueB: 60, valueBalanced: false };
    case "puzzle-23":
      return { selectedIndices: [null, null, null] };
    default:
      return {};
  }
}
