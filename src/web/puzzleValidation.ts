export function circularHueDistance(a: number, b: number): number {
  const d = Math.abs((((a - b) % 360) + 360) % 360);
  return Math.min(d, 360 - d);
}

export function shuffleArray<T>(items: T[]): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function isTriadValid(h1: number, h2: number, h3: number): boolean {
  const values = [h1, h2, h3].map((h) => ((h % 360) + 360) % 360).sort((a, b) => a - b);
  const gaps = [
    (values[1] - values[0] + 360) % 360,
    (values[2] - values[1] + 360) % 360,
    (values[0] + 360 - values[2]) % 360,
  ];
  return gaps.every((gap) => Math.abs(gap - 120) <= 15);
}

export function validatePuzzleInput(puzzleId: string, input: unknown): boolean {
  const inp = input as Record<string, unknown>;

  switch (puzzleId) {
    case "puzzle-01":
      return Boolean(inp.redBeam && inp.greenBeam && inp.blueBeam && inp.overlap);
    case "puzzle-02": {
      const tol = 0.08;
      const target = inp.target as Record<string, number>;
      return (
        Math.abs((inp.cyan as number) - target.cyan) <= tol &&
        Math.abs((inp.magenta as number) - target.magenta) <= tol &&
        Math.abs((inp.yellow as number) - target.yellow) <= tol
      );
    }
    case "puzzle-03": {
      const pair = [(inp.pigments as string[])?.[0], (inp.pigments as string[])?.[1]]
        .map((p: string) => String(p).toLowerCase())
        .sort()
        .join("+");
      return ["blue+orange", "green+red", "purple+yellow"].includes(pair) && Boolean(inp.luminousShadow);
    }
    case "puzzle-04":
      return Boolean(inp.usesOnlyBlackAndWhite && (inp.blurReadability as number) >= 0.75);
    case "puzzle-05":
      return (
        Array.isArray(inp.orderedValues) &&
        (inp.orderedValues as number[]).length >= 5 &&
        (inp.orderedValues as number[]).every((v: number, i: number, arr: number[]) => i === 0 || v >= arr[i - 1]) &&
        Boolean(inp.hiddenImageRevealed)
      );
    case "puzzle-06":
      return (
        Array.isArray(inp.exploredHues) &&
        (inp.exploredHues as unknown[]).length >= 3 &&
        Boolean(inp.discoveredDifferentChromaPeaks)
      );
    case "puzzle-07": {
      const map: Record<string, string> = {
        red: "green",
        green: "red",
        blue: "orange",
        orange: "blue",
        yellow: "purple",
        purple: "yellow",
      };
      return map[String(inp.selectedColorA).toLowerCase()] === String(inp.selectedColorB).toLowerCase();
    }
    case "puzzle-08": {
      const angles = inp.hueAngles as number[];
      return isTriadValid(angles[0], angles[1], angles[2]);
    }
    case "puzzle-09": {
      const correct: Record<string, string> = {
        "joyful carnival": "C",
        "calm ocean": "A",
        "creepy dungeon": "B",
        "romantic sunset": "D",
        "focused studio": "A",
        "mystical and premium": "D",
      };
      const sel = (input as { selections?: Record<string, string> }).selections;
      return sel != null && Object.entries(correct).every(([mood, id]) => sel[mood] === id);
    }
    case "puzzle-10":
      return Boolean(inp.backgroundsAdjusted && (inp.perceivedDifference as number) <= 0.05);
    case "puzzle-11":
      return Boolean(inp.usedOrangeSurroundings && !inp.greySquareChanged);
    case "puzzle-12":
      return Boolean((inp.neutralCount as number) >= 2 && (inp.accentContrast as number) >= 0.65);
    case "puzzle-13":
      return Boolean(
        inp.edgeSharpnessDropsWithDistance &&
        inp.saturationDropsWithDistance &&
        inp.hueShiftsCoolerWithDistance,
      );
    case "puzzle-14":
      return Boolean(inp.farObjectsShiftBlue && (inp.scatteringStrength as number) >= 0.7);
    case "puzzle-15":
      return Boolean(
        inp.palettesMatched &&
        (inp.sunHeight as number) < 0.35 &&
        (inp.colorTemperature as number) > 0.70 &&
        (inp.atmosphere as number) >= 0.40 &&
        (inp.atmosphere as number) <= 0.60,
      );
    case "puzzle-16": {
      const pigments = (inp.pigments as string[]).map((p) => p.toLowerCase().trim());
      if (pigments.length !== 2) {
        return false;
      }

      const yellowFamily = new Set([
        "hansa yellow", "cadmium lemon", "nickel azo yellow", "bismuth vanadate yellow",
        "indian yellow", "aureolin", "cadmium yellow medium", "naples yellow",
        "raw sienna", "yellow ochre",
      ]);
      const blueFamily = new Set([
        "phthalo blue", "cerulean blue", "cobalt teal", "manganese blue",
        "cobalt blue", "ultramarine", "prussian blue", "indanthrone blue",
        "phthalo blue red shade", "french ultramarine",
      ]);
      const hasYellow = pigments.some((pigment) => yellowFamily.has(pigment));
      const hasBlue = pigments.some((pigment) => blueFamily.has(pigment));
      return hasYellow && hasBlue && (inp.mudLevel as number) <= 0.16;
    }
    case "puzzle-17":
      return Boolean(((inp.mudLevel as number) ?? 1) < 0.58);
    case "puzzle-18":
      return Boolean(inp.usedPureDots && !inp.mixedOnPalette && inp.opticalBlendVisible);
    case "puzzle-19":
      return (
        Math.abs((inp.primaryPct as number) - 60) <= 5 &&
        Math.abs((inp.secondaryPct as number) - 30) <= 5 &&
        Math.abs((inp.accentPct as number) - 10) <= 3 &&
        Math.abs((inp.primaryPct as number) + (inp.secondaryPct as number) + (inp.accentPct as number) - 100) <= 2
      );
    case "puzzle-20": {
      const correct: Record<string, string> = {
        red: "excitement",
        blue: "trust",
        yellow: "optimism",
        green: "growth",
      };
      const mappings = inp.mappings as Record<string, string> | undefined;
      return mappings != null && Object.entries(correct).every(([color, emotion]) => mappings[color] === emotion);
    }
    case "puzzle-21": {
      const normalizedDelta = (((inp.hueB as number) - (inp.hueA as number)) % 360 + 360) % 360;
      const diff = Math.abs(normalizedDelta - 180);
      return diff <= 20 && Boolean(inp.valueBalanced);
    }
    case "puzzle-23": {
      const selectedIndices = inp.selectedIndices as number[] | undefined;
      return Array.isArray(selectedIndices) && selectedIndices.length === 3 && [1, 3, 0].every((expected, index) => selectedIndices[index] === expected);
    }
    default:
      return false;
  }
}
