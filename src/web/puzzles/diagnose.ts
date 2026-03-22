/**
 * Per-puzzle failure diagnosis.
 *
 * diagnoseFailure returns an ordered array of FailureReasonCodes explaining
 * WHY the player's input failed.  The most critical reason comes first.
 *
 * Rules:
 *  - Only codes from failureReasons.ts may be used.
 *  - Prefer 1–3 reasons; never pad with vague extras.
 *  - Reason order must match importance (most critical first).
 */

import { type FailureReasonCode } from "./failureReasons";

// ---------------------------------------------------------------------------
// Yellow-family pigments (same data as puzzle-16-view.tsx — kept in sync)
// ---------------------------------------------------------------------------
const YELLOW_FAMILY = new Set([
  "hansa yellow",
  "cadmium lemon",
  "nickel azo yellow",
  "bismuth vanadate yellow",
  "indian yellow",
  "aureolin",
  "cadmium yellow medium",
  "naples yellow",
  "raw sienna",
  "yellow ochre",
]);

// Blue-family pigments
const BLUE_FAMILY = new Set([
  "phthalo blue",
  "cerulean blue",
  "cobalt teal",
  "manganese blue",
  "cobalt blue",
  "ultramarine",
  "prussian blue",
  "indanthrone blue",
  "phthalo blue red shade",
  "french ultramarine",
]);

// Pigments whose inherent bias makes them poor choices for vibrant green
// (biasMagnitude >= 0.28 in the view data)
const HIGH_BIAS_PIGMENTS = new Set([
  "cadmium yellow medium",
  "naples yellow",
  "raw sienna",
  "yellow ochre",
  "indian yellow",
  "aureolin",
  "ultramarine",
  "prussian blue",
  "indanthrone blue",
  "phthalo blue red shade",
  "french ultramarine",
]);

// ---------------------------------------------------------------------------
// Puzzle-specific diagnosis helpers
// ---------------------------------------------------------------------------

function diagnosePuzzle16(input: {
  pigments: string[];
  mudLevel: number;
}): FailureReasonCode[] {
  const pigments = (input.pigments ?? []).map((p: string) =>
    String(p).toLowerCase().trim(),
  );

  if (pigments.length !== 2) {
    return ["incorrect_hue_selection"];
  }

  const hasYellow = pigments.some((p) => YELLOW_FAMILY.has(p));
  const hasBlue = pigments.some((p) => BLUE_FAMILY.has(p));

  if (!hasYellow || !hasBlue) {
    return ["incorrect_hue_selection"];
  }

  // Correct family pair but mud is too high — determine why
  const hasBiasedPigment = pigments.some((p) => HIGH_BIAS_PIGMENTS.has(p));

  const reasons: FailureReasonCode[] = [];

  if (hasBiasedPigment) {
    reasons.push("incorrect_hue_bias");
  }

  reasons.push("complement_conflict");
  reasons.push("insufficient_chroma");

  return reasons;
}

function diagnosePuzzle17(input: {
  complementPairsAdded: number;
  muddyResult: boolean;
}): FailureReasonCode[] {
  const reasons: FailureReasonCode[] = [];

  if (input.complementPairsAdded > 1) {
    reasons.push("complement_conflict");
  }

  if (input.muddyResult) {
    reasons.push("chroma_collapsed");
    // overmixing is the secondary cause only when complement_conflict is not already
    // the root cause — adding both for the same failure would be redundant.
    if (!reasons.includes("complement_conflict")) {
      reasons.push("overmixing");
    }
  }

  return reasons.length > 0 ? reasons : ["chroma_collapsed"];
}

function diagnosePuzzle13(input: {
  edgeSharpnessDropsWithDistance: boolean;
  saturationDropsWithDistance: boolean;
  hueShiftsCoolerWithDistance: boolean;
}): FailureReasonCode[] {
  const reasons: FailureReasonCode[] = [];

  // Both edge and saturation issues map to insufficient_atmosphere
  if (
    !input.edgeSharpnessDropsWithDistance ||
    !input.saturationDropsWithDistance
  ) {
    reasons.push("insufficient_atmosphere");
  }

  if (!input.hueShiftsCoolerWithDistance) {
    reasons.push("incorrect_color_temperature");
  }

  return reasons.length > 0 ? reasons : ["insufficient_atmosphere"];
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Diagnose why a puzzle input failed and return an ordered list of
 * FailureReasonCodes (most critical first).
 *
 * Returns an empty array when no specific diagnosis is available
 * (the caller should fall back to the generic shake-only feedback).
 */
export function diagnoseFailure(
  puzzleId: string,
  input: unknown,
): FailureReasonCode[] {
  const inp = input as Record<string, unknown>;

  switch (puzzleId) {
    case "puzzle-16":
      return diagnosePuzzle16(
        inp as Parameters<typeof diagnosePuzzle16>[0],
      );
    case "puzzle-17":
      return diagnosePuzzle17(
        inp as Parameters<typeof diagnosePuzzle17>[0],
      );
    case "puzzle-13":
      return diagnosePuzzle13(
        inp as Parameters<typeof diagnosePuzzle13>[0],
      );
    default:
      return [];
  }
}
