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

// puzzle-01: Create White Light (additive RGB beams)
function diagnosePuzzle01(_input: {
  redBeam?: boolean;
  greenBeam?: boolean;
  blueBeam?: boolean;
  overlap?: boolean;
}): FailureReasonCode[] {
  // All three beams must be active AND overlapping
  return ["incorrect_hue_selection"];
}

// puzzle-02: Printer Pigments (CMY ink sliders)
function diagnosePuzzle02(_input: {
  cyan: number;
  magenta: number;
  yellow: number;
  target: { cyan: number; magenta: number; yellow: number };
}): FailureReasonCode[] {
  // The component ratios don't match the target colour
  return ["unbalanced_mix"];
}

// puzzle-03: Chromatic Black (complementary pigment pairs)
function diagnosePuzzle03(input: {
  pigments?: unknown[];
  luminousShadow?: boolean;
}): FailureReasonCode[] {
  const pair = [input.pigments?.[0], input.pigments?.[1]]
    .map((p) => String(p).toLowerCase())
    .sort()
    .join("+");
  const validPairs = ["blue+orange", "green+red", "purple+yellow"];
  if (!validPairs.includes(pair)) {
    return ["incorrect_hue_selection"];
  }
  // Correct complementary pair but shadow isn't luminous yet
  return ["chroma_collapsed"];
}

// puzzle-04: Squint Test (value structure in greyscale)
function diagnosePuzzle04(input: {
  usesOnlyBlackAndWhite?: boolean;
  blurReadability?: number;
}): FailureReasonCode[] {
  if (!input.usesOnlyBlackAndWhite) {
    return ["incorrect_hue_selection"];
  }
  return ["low_value_contrast"];
}

// puzzle-05: Value Ladder (ordering tiles by value)
function diagnosePuzzle05(_input: unknown): FailureReasonCode[] {
  return ["incorrect_value_structure"];
}

// puzzle-06: Chroma Peaks (exploring hue variety)
function diagnosePuzzle06(input: {
  exploredHues?: unknown[];
  discoveredDifferentChromaPeaks?: boolean;
}): FailureReasonCode[] {
  const count = Array.isArray(input.exploredHues) ? input.exploredHues.length : 0;
  if (count < 3) {
    return ["insufficient_chroma"];
  }
  return ["incorrect_hue_selection"];
}

// puzzle-07: Complementary Pairs (pick the opposite hue)
function diagnosePuzzle07(_input: unknown): FailureReasonCode[] {
  return ["incorrect_hue_selection"];
}

// puzzle-08: Triadic Harmony (three hues ~120° apart)
function diagnosePuzzle08(_input: unknown): FailureReasonCode[] {
  return ["incorrect_hue_selection"];
}

// puzzle-09: Mood Palettes (match palette to mood)
function diagnosePuzzle09(_input: unknown): FailureReasonCode[] {
  return ["incorrect_hue_selection"];
}

// puzzle-10: Simultaneous Contrast – background adjustment
function diagnosePuzzle10(_input: unknown): FailureReasonCode[] {
  return ["weak_simultaneous_contrast"];
}

// puzzle-11: Simultaneous Contrast – grey-square illusion
function diagnosePuzzle11(_input: unknown): FailureReasonCode[] {
  return ["weak_simultaneous_contrast"];
}

// puzzle-12: Accent Isolation (neutrals + single accent)
function diagnosePuzzle12(input: {
  neutralCount?: number;
  accentContrast?: number;
}): FailureReasonCode[] {
  const reasons: FailureReasonCode[] = [];
  if ((input.neutralCount ?? 0) < 2) {
    reasons.push("competing_focal_points");
  }
  if ((input.accentContrast ?? 0) < 0.65) {
    reasons.push("weak_accent_isolation");
  }
  return reasons.length > 0 ? reasons : ["weak_accent_isolation"];
}

// puzzle-13: Depth Painting (aerial perspective cues)
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

// puzzle-14: Atmospheric Scattering (far objects shift blue)
function diagnosePuzzle14(input: {
  farObjectsShiftBlue?: boolean;
  scatteringStrength?: number;
}): FailureReasonCode[] {
  if (!input.farObjectsShiftBlue) {
    return ["incorrect_color_temperature"];
  }
  return ["insufficient_atmosphere"];
}

// puzzle-15: Golden Hour / Time of Day (chromatic mastery)
function diagnosePuzzle15(input: {
  palettesMatched?: boolean;
  sunHeight?: number;
  colorTemperature?: number;
  atmosphere?: number;
}): FailureReasonCode[] {
  const reasons: FailureReasonCode[] = [];
  if (!input.palettesMatched) {
    reasons.push("incorrect_hue_selection");
  }
  if ((input.colorTemperature ?? 0) <= 0.70 || (input.sunHeight ?? 1) >= 0.35) {
    reasons.push("incorrect_color_temperature");
  }
  const atm = input.atmosphere ?? 0.5;
  if (atm < 0.40) {
    reasons.push("insufficient_atmosphere");
  } else if (atm > 0.60) {
    reasons.push("excessive_atmosphere");
  }
  return reasons.length > 0 ? reasons : ["incorrect_color_temperature"];
}

// puzzle-16: Vibrant Green (yellow + blue pigment selection)
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

// puzzle-17: Mud Monster (complement clash limit)
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

// puzzle-18: Optical Mixing (pointillist dots)
function diagnosePuzzle18(input: {
  usedPureDots?: boolean;
  mixedOnPalette?: boolean;
  opticalBlendVisible?: boolean;
}): FailureReasonCode[] {
  const reasons: FailureReasonCode[] = [];
  if (input.mixedOnPalette) {
    reasons.push("overmixing");
  }
  if (!input.usedPureDots || !input.opticalBlendVisible) {
    reasons.push("insufficient_chroma");
  }
  return reasons.length > 0 ? reasons : ["insufficient_chroma"];
}

// puzzle-19: Color Balance 60/30/10 (proportion rule)
function diagnosePuzzle19(_input: unknown): FailureReasonCode[] {
  return ["unbalanced_mix"];
}

// puzzle-20: Color Psychology (hue-emotion mapping)
function diagnosePuzzle20(_input: unknown): FailureReasonCode[] {
  return ["incorrect_hue_selection"];
}

// puzzle-21: Color Vibration (complementary hues + value balance)
function diagnosePuzzle21(input: {
  hueA?: number;
  hueB?: number;
  valueBalanced?: boolean;
}): FailureReasonCode[] {
  const reasons: FailureReasonCode[] = [];
  if (input.hueA !== undefined && input.hueB !== undefined) {
    const delta = (((input.hueB - input.hueA) % 360) + 360) % 360;
    if (Math.abs(delta - 180) > 20) {
      reasons.push("incorrect_hue_selection");
    }
  }
  if (!input.valueBalanced) {
    reasons.push("low_value_contrast");
  }
  return reasons.length > 0 ? reasons : ["incorrect_hue_selection"];
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Diagnose why a puzzle input failed and return an ordered list of
 * FailureReasonCodes (most critical first).
 *
 * Every puzzle has a specific diagnosis so the Result Analysis panel
 * always shows meaningful feedback after a failure.
 */
export function diagnoseFailure(
  puzzleId: string,
  input: unknown,
): FailureReasonCode[] {
  const inp = input as Record<string, unknown>;

  switch (puzzleId) {
    case "puzzle-01": return diagnosePuzzle01(inp as Parameters<typeof diagnosePuzzle01>[0]);
    case "puzzle-02": return diagnosePuzzle02(inp as Parameters<typeof diagnosePuzzle02>[0]);
    case "puzzle-03": return diagnosePuzzle03(inp as Parameters<typeof diagnosePuzzle03>[0]);
    case "puzzle-04": return diagnosePuzzle04(inp as Parameters<typeof diagnosePuzzle04>[0]);
    case "puzzle-05": return diagnosePuzzle05(inp);
    case "puzzle-06": return diagnosePuzzle06(inp as Parameters<typeof diagnosePuzzle06>[0]);
    case "puzzle-07": return diagnosePuzzle07(inp);
    case "puzzle-08": return diagnosePuzzle08(inp);
    case "puzzle-09": return diagnosePuzzle09(inp);
    case "puzzle-10": return diagnosePuzzle10(inp);
    case "puzzle-11": return diagnosePuzzle11(inp);
    case "puzzle-12": return diagnosePuzzle12(inp as Parameters<typeof diagnosePuzzle12>[0]);
    case "puzzle-13": return diagnosePuzzle13(inp as Parameters<typeof diagnosePuzzle13>[0]);
    case "puzzle-14": return diagnosePuzzle14(inp as Parameters<typeof diagnosePuzzle14>[0]);
    case "puzzle-15": return diagnosePuzzle15(inp as Parameters<typeof diagnosePuzzle15>[0]);
    case "puzzle-16": return diagnosePuzzle16(inp as Parameters<typeof diagnosePuzzle16>[0]);
    case "puzzle-17": return diagnosePuzzle17(inp as Parameters<typeof diagnosePuzzle17>[0]);
    case "puzzle-18": return diagnosePuzzle18(inp as Parameters<typeof diagnosePuzzle18>[0]);
    case "puzzle-19": return diagnosePuzzle19(inp);
    case "puzzle-20": return diagnosePuzzle20(inp);
    case "puzzle-21": return diagnosePuzzle21(inp as Parameters<typeof diagnosePuzzle21>[0]);
    default:          return [];
  }
}
