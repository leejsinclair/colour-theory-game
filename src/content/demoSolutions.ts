export const demoSolutions: Record<string, unknown> = {
  "puzzle-01": { redBeam: true, greenBeam: true, blueBeam: true, overlap: true },
  "puzzle-02": {
    cyan: 0.4,
    magenta: 0.5,
    yellow: 0.2,
    target: { cyan: 0.4, magenta: 0.5, yellow: 0.2 },
  },
  "puzzle-03": { pigments: ["blue", "orange"], luminousShadow: true },
  "puzzle-04": { usesOnlyBlackAndWhite: true, blurReadability: 0.82 },
  "puzzle-05": { orderedValues: [0.05, 0.2, 0.4, 0.6, 0.8, 0.95], hiddenImageRevealed: true },
  "puzzle-06": { exploredHues: ["red", "green", "blue"], discoveredDifferentChromaPeaks: true },
  "puzzle-07": { selectedColorA: "red", selectedColorB: "green" },
  "puzzle-08": { hueAngles: [0, 120, 240] },
  "puzzle-09": { selections: { "joyful carnival": "C", "calm ocean": "A", "creepy dungeon": "B" } },
  "puzzle-10": { perceivedDifference: 0.03, backgroundsAdjusted: true },
  "puzzle-11": { usedOrangeSurroundings: true, greySquareChanged: false },
  "puzzle-12": { neutralCount: 3, accentContrast: 0.75 },
  "puzzle-13": {
    edgeSharpnessDropsWithDistance: true,
    saturationDropsWithDistance: true,
    hueShiftsCoolerWithDistance: true,
  },
  "puzzle-14": { farObjectsShiftBlue: true, scatteringStrength: 0.8 },
  "puzzle-15": { palettesMatched: true, sunHeight: 0.25, colorTemperature: 0.80, atmosphere: 0.50 },
  "puzzle-16": { pigments: ["phthalo blue", "hansa yellow"], mudLevel: 0.2 },
  "puzzle-17": { complementPairsAdded: 1, muddyResult: false },
  "puzzle-18": { usedPureDots: true, mixedOnPalette: false, opticalBlendVisible: true },
  "puzzle-19": { primaryPct: 60, secondaryPct: 30, accentPct: 10 },
  "puzzle-20": { mappings: { red: "excitement", blue: "trust", yellow: "optimism", green: "growth" } },
  "puzzle-21": { hueA: 0, hueB: 180, valueBalanced: true },
};

export const moodPaletteSolution = {
  selections: { "joyful carnival": "C", "calm ocean": "A", "creepy dungeon": "B" },
};

export function getDemoSolution(puzzleId: string): unknown {
  return demoSolutions[puzzleId] ?? true;
}
