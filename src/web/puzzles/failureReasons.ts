/**
 * Canonical failure reason codes and player-facing explanations.
 *
 * All codes come directly from canonical-failure-reasons.md.
 * Explanations must guide the player toward their next attempt.
 */

export type FailureReasonCode =
  // VALUE
  | "low_value_contrast"
  | "incorrect_value_structure"
  // CHROMA
  | "chroma_collapsed"
  | "insufficient_chroma"
  | "excessive_chroma"
  // HUE RELATIONSHIPS
  | "complement_conflict"
  | "incorrect_hue_selection"
  | "incorrect_hue_bias"
  // MIXING & PIGMENT LOGIC
  | "overmixing"
  | "unbalanced_mix"
  // LIGHT & ENVIRONMENT
  | "insufficient_atmosphere"
  | "excessive_atmosphere"
  | "incorrect_color_temperature"
  // PERCEPTION & RELATIVITY
  | "weak_simultaneous_contrast"
  | "competing_focal_points"
  | "weak_accent_isolation";

export const FAILURE_EXPLANATIONS: Record<FailureReasonCode, string> = {
  low_value_contrast:
    "Light and dark areas are too similar — increase the difference between your lightest and darkest regions so forms stay readable.",
  incorrect_value_structure:
    "The light/dark arrangement doesn't match the intended order — check which areas should be lightest and which darkest, then re-sort.",
  chroma_collapsed:
    "The colour has become muddy — opposing pigments are cancelling each other out. Use fewer components or choose cleaner, less-biased ones.",
  insufficient_chroma:
    "The result lacks vibrancy — increase saturation, reduce neutralising elements, and avoid mixing too many pigments at once.",
  excessive_chroma:
    "Too many saturated colours are competing — reduce saturation on supporting elements and let the intended colour dominate.",
  complement_conflict:
    "Opposing hues are neutralising each other — limit complement clashes so at most one complementary pair is present.",
  incorrect_hue_selection:
    "The chosen colour or combination doesn't match the required relationship — check the colour wheel and adjust to the correct hue.",
  incorrect_hue_bias:
    "A hidden warm or cool bias in your pigment is pulling the colour off-target — try a cleaner, less-biased alternative from the same family.",
  overmixing:
    "Too many components combined have muddied the result — simplify and use fewer, purer ingredients.",
  unbalanced_mix:
    "The ratio of components is off — adjust the proportions until the resulting colour clearly matches the target.",
  insufficient_atmosphere:
    "Distant objects are still too sharp or saturated — raise edge softening, lower saturation, and shift far layers toward a cooler hue.",
  excessive_atmosphere:
    "The scene is overly faded — reduce the atmospheric effect to restore contrast and structural clarity.",
  incorrect_color_temperature:
    "The warmth/coolness doesn't match the target — check whether the condition calls for warmer or cooler tones and adjust accordingly.",
  weak_simultaneous_contrast:
    "The surrounding context isn't strong enough to shift perception — use more contrasting colours in the surrounding area.",
  competing_focal_points:
    "Too many elements are demanding attention at once — reduce variety so one clear focal point stands out.",
  weak_accent_isolation:
    "The accent colour doesn't stand out — increase the contrast between the accent and the neutral areas around it.",
};
