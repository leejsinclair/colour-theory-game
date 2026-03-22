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
    "The light/dark arrangement doesn't match the intended form — check which areas should be lightest and which darkest.",
  chroma_collapsed:
    "Your colour has become muddy. Opposing pigments cancelled each other out — use fewer pigments or choose cleaner, less-biased ones.",
  insufficient_chroma:
    "The colour lacks vibrancy. Choose pigments with stronger green affinity and avoid those with warm or purple bias.",
  excessive_chroma:
    "Too many saturated colours are competing — reduce saturation elsewhere or let one colour dominate.",
  complement_conflict:
    "Opposing colours are neutralising each other. Limit complement clashes to at most one to keep colour alive.",
  incorrect_hue_selection:
    "Wrong colour family — you need one yellow-family pigment and one blue-family pigment to produce green.",
  incorrect_hue_bias:
    "A hidden bias in one of your pigments is pulling the mix away from clean green. Try a pigment from the left-hand (cleaner) end of its row.",
  overmixing:
    "Too many pigments combined have muddied the result. Reset the bowl and start with clean, controlled strokes.",
  unbalanced_mix:
    "The ratio of components is off — adjust proportions so the intended colour clearly dominates.",
  insufficient_atmosphere:
    "Distant objects are still too sharp or saturated. Raise edge softening, lower saturation, and add a cooler hue shift for far layers.",
  excessive_atmosphere:
    "The scene is overly faded — reduce the atmospheric effect to restore contrast and structural clarity.",
  incorrect_color_temperature:
    "The warmth/coolness doesn't match the target condition — check whether you need a warmer or cooler hue shift for distant layers.",
  weak_simultaneous_contrast:
    "The surrounding colours aren't strong enough to shift perception — use more contrasting surroundings.",
  competing_focal_points:
    "Too many elements are demanding attention at once — simplify so one focal point dominates.",
  weak_accent_isolation:
    "The accent colour doesn't stand out — increase contrast between the accent and the neutral areas around it.",
};
