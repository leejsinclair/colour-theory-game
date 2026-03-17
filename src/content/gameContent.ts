import { DefaultPetBehavior, Pet } from "../entities/Pet";
import { Puzzle } from "../entities/Puzzle";
import { Station } from "../entities/Station";
import { AtmospherePuzzle } from "../puzzles/AtmospherePuzzle";
import { CMYPuzzle } from "../puzzles/CMYPuzzle";
import { ComplementPuzzle } from "../puzzles/ComplementPuzzle";
import { RGBPuzzle } from "../puzzles/RGBPuzzle";
import { PetType, PuzzleState, PuzzleType, StationType } from "../types/gameTypes";

export const caretakerIntroDialogue = [
  "Long ago this studio was filled with living color.",
  "But the principles of color were forgotten.",
  "The Chromatic Pets are trapped inside puzzles.",
  "Restore them and the studio will live again.",
];

export const finalCanvasRequirements = [
  "value structure",
  "color harmony",
  "atmospheric perspective",
  "chromatic black",
  "color relativity",
];

const petDefinitions: Array<{ id: string; name: string; type: PetType }> = [
  { id: "pet-01", name: "Glow Sprite", type: PetType.GlowSprite },
  { id: "pet-02", name: "Ink Octopus", type: PetType.InkOctopus },
  { id: "pet-03", name: "Shadow Cat", type: PetType.ShadowCat },
  { id: "pet-04", name: "Shadow Mouse", type: PetType.ShadowMouse },
  { id: "pet-05", name: "Gradient Hedgehog", type: PetType.GradientHedgehog },
  { id: "pet-06", name: "Chroma Gecko", type: PetType.ChromaGecko },
  { id: "pet-07", name: "Prism Fox", type: PetType.PrismFox },
  { id: "pet-08", name: "Palette Parrot", type: PetType.PaletteParrot },
  { id: "pet-09", name: "Mood Bat", type: PetType.MoodBat },
  { id: "pet-10", name: "Chameleon Lizard", type: PetType.ChameleonLizard },
  { id: "pet-11", name: "Contrast Frog", type: PetType.ContrastFrog },
  { id: "pet-12", name: "Neutral Turtle", type: PetType.NeutralTurtle },
  { id: "pet-13", name: "Sky Jelly", type: PetType.SkyJelly },
  { id: "pet-14", name: "Air Sprite", type: PetType.AirSprite },
  { id: "pet-15", name: "Sun Finch", type: PetType.SunFinch },
  { id: "pet-16", name: "Paint Slime", type: PetType.PaintSlime },
  { id: "pet-17", name: "Mud Blob", type: PetType.MudBlob },
  { id: "pet-18", name: "Dot Bee", type: PetType.DotBee },
  { id: "pet-19", name: "Harmony Dove", type: PetType.HarmonyDove },
  { id: "pet-20", name: "Empathy Moth", type: PetType.EmpathyMoth },
  { id: "pet-21", name: "Vibration Hummingbird", type: PetType.VibrationHummingbird },
];

export function createPets(): Pet[] {
  return petDefinitions.map(
    (pet) => new Pet(pet.id, pet.name, pet.type, `assets/sprites/pets/${pet.id}.png`, new DefaultPetBehavior(pet.name)),
  );
}

function createPuzzle<TInput>(
  id: string,
  stationId: string,
  title: string,
  description: string,
  puzzleType: PuzzleType,
  rewardPetId: string,
  validator: (input: TInput) => boolean,
): Puzzle<unknown> {
  return new Puzzle<TInput>(
    id,
    stationId,
    title,
    description,
    puzzleType,
    rewardPetId,
    validator,
    PuzzleState.Locked,
  ) as unknown as Puzzle<unknown>;
}

function isComplementPair(a: string, b: string): boolean {
  const pair = [a.toLowerCase().trim(), b.toLowerCase().trim()].sort().join("+");
  return pair === "blue+orange" || pair === "green+red" || pair === "purple+yellow";
}

function isAscending(values: number[]): boolean {
  for (let i = 1; i < values.length; i += 1) {
    if (values[i] < values[i - 1]) {
      return false;
    }
  }
  return true;
}

function normalizeTags(tags: string[]): string[] {
  return tags.map((tag) => tag.toLowerCase().trim());
}

function triadIsValid(hueAngles: number[]): boolean {
  if (hueAngles.length !== 3) {
    return false;
  }

  const sorted = [...hueAngles].map((h) => ((h % 360) + 360) % 360).sort((a, b) => a - b);
  const a = (sorted[1] - sorted[0] + 360) % 360;
  const b = (sorted[2] - sorted[1] + 360) % 360;
  const c = (sorted[0] + 360 - sorted[2]) % 360;
  const tolerance = 15;

  return Math.abs(a - 120) <= tolerance && Math.abs(b - 120) <= tolerance && Math.abs(c - 120) <= tolerance;
}

export function createStationsAndPuzzles(): Station[] {
  const station1Puzzles: Puzzle<unknown>[] = [
    new RGBPuzzle("puzzle-01", "station-01", "pet-01") as unknown as Puzzle<unknown>,
    new CMYPuzzle("puzzle-02", "station-01", "pet-02") as unknown as Puzzle<unknown>,
    createPuzzle<{ pigments: string[]; luminousShadow: boolean }>(
      "puzzle-03",
      "station-01",
      "Chromatic Black",
      "Create rich black with complementary pigments.",
      PuzzleType.CHROMATIC_BLACK,
      "pet-03",
      (input) =>
        input.pigments.length === 2 &&
        isComplementPair(input.pigments[0] ?? "", input.pigments[1] ?? "") &&
        input.luminousShadow,
    ),
  ];

  const station2Puzzles: Puzzle<unknown>[] = [
    createPuzzle<{ usesOnlyBlackAndWhite: boolean; blurReadability: number }>(
      "puzzle-04",
      "station-02",
      "Squint Test",
      "Paint a statue in grayscale that reads when blurred.",
      PuzzleType.VALUE_PAINT,
      "pet-04",
      (input) => input.usesOnlyBlackAndWhite && input.blurReadability >= 0.75,
    ),
    createPuzzle<{ orderedValues: number[]; hiddenImageRevealed: boolean }>(
      "puzzle-05",
      "station-02",
      "Value Ladder",
      "Sort value tiles from dark to light.",
      PuzzleType.VALUE_SORT,
      "pet-05",
      (input) => input.orderedValues.length >= 5 && isAscending(input.orderedValues) && input.hiddenImageRevealed,
    ),
    createPuzzle<{ exploredHues: string[]; discoveredDifferentChromaPeaks: boolean }>(
      "puzzle-06",
      "station-02",
      "Chroma Tree",
      "Find max chroma points across hues and values.",
      PuzzleType.CHROMA_TREE,
      "pet-06",
      (input) => input.exploredHues.length >= 3 && input.discoveredDifferentChromaPeaks,
    ),
  ];

  const station3Puzzles: Puzzle<unknown>[] = [
    new ComplementPuzzle("puzzle-07", "station-03", "pet-07") as unknown as Puzzle<unknown>,
    createPuzzle<{ hueAngles: number[] }>(
      "puzzle-08",
      "station-03",
      "Triadic Harmony",
      "Build a balanced triadic palette.",
      PuzzleType.COLOR_TRIAD,
      "pet-08",
      (input) => triadIsValid(input.hueAngles),
    ),
    createPuzzle<{ selections: Record<string, string> }>(
      "puzzle-09",
      "station-03",
      "Mood Palette",
      "Match each mood to its correct colour palette.",
      PuzzleType.MOOD_PALETTE,
      "pet-09",
      (input) => {
        const correct: Record<string, string> = {
          "joyful carnival": "C",
          "calm ocean": "A",
          "creepy dungeon": "B",
        };
        const sel = input.selections;
        return sel != null && Object.entries(correct).every(([mood, id]) => sel[mood] === id);
      },
    ),
  ];

  const station4Puzzles: Puzzle<unknown>[] = [
    createPuzzle<{ perceivedDifference: number; backgroundsAdjusted: boolean }>(
      "puzzle-10",
      "station-04",
      "Same Square Illusion",
      "Adjust backgrounds until identical squares look identical.",
      PuzzleType.SQUARE_ILLUSION,
      "pet-10",
      (input) => input.backgroundsAdjusted && input.perceivedDifference <= 0.05,
    ),
    createPuzzle<{ usedOrangeSurroundings: boolean; greySquareChanged: boolean }>(
      "puzzle-11",
      "station-04",
      "Make Grey Look Blue",
      "Use context colors to push neutral perception toward blue.",
      PuzzleType.GREY_SHIFT,
      "pet-11",
      (input) => input.usedOrangeSurroundings && !input.greySquareChanged,
    ),
    createPuzzle<{ neutralCount: number; accentContrast: number }>(
      "puzzle-12",
      "station-04",
      "Neutral Hero",
      "Use neutrals so a bright accent color pops.",
      PuzzleType.NEUTRAL_POP,
      "pet-12",
      (input) => input.neutralCount >= 2 && input.accentContrast >= 0.65,
    ),
  ];

  const station5Puzzles: Puzzle<unknown>[] = [
    new AtmospherePuzzle("puzzle-13", "station-05", "pet-13") as unknown as Puzzle<unknown>,
    createPuzzle<{ farObjectsShiftBlue: boolean; scatteringStrength: number }>(
      "puzzle-14",
      "station-05",
      "Rayleigh Scattering",
      "Shift distant objects toward blue with atmospheric scattering.",
      PuzzleType.RAYLEIGH_SCATTER,
      "pet-14",
      (input) => input.farObjectsShiftBlue && input.scatteringStrength >= 0.7,
    ),
    createPuzzle<{ palettesMatched: boolean; sunHeight: number; colorTemperature: number; atmosphere: number }>(
      "puzzle-15",
      "station-05",
      "Chromatic Mastery",
      "Match time-of-day palettes, then recreate golden hour light.",
      PuzzleType.TIME_OF_DAY,
      "pet-15",
      (input) =>
        input.palettesMatched &&
        input.sunHeight < 0.35 &&
        input.colorTemperature > 0.70 &&
        input.atmosphere >= 0.40 &&
        input.atmosphere <= 0.60,
    ),
  ];

  const station6Puzzles: Puzzle<unknown>[] = [
    createPuzzle<{ pigments: string[]; mudLevel: number }>(
      "puzzle-16",
      "station-06",
      "Vibrant Green",
      "Mix phthalo blue and hansa yellow to produce clean greens.",
      PuzzleType.PIGMENT_MIX,
      "pet-16",
      (input) => {
        const pigments = normalizeTags(input.pigments);
        return pigments.includes("phthalo blue") && pigments.includes("hansa yellow") && input.mudLevel <= 0.3;
      },
    ),
    createPuzzle<{ complementPairsAdded: number; muddyResult: boolean }>(
      "puzzle-17",
      "station-06",
      "Mud Monster",
      "Avoid over-mixing complements into muddy brown.",
      PuzzleType.MUD_PREVENTION,
      "pet-17",
      (input) => input.complementPairsAdded <= 1 && !input.muddyResult,
    ),
    createPuzzle<{ usedPureDots: boolean; mixedOnPalette: boolean; opticalBlendVisible: boolean }>(
      "puzzle-18",
      "station-06",
      "Optical Mixing",
      "Use dots of pure color that blend in the eye.",
      PuzzleType.POINTILLISM,
      "pet-18",
      (input) => input.usedPureDots && !input.mixedOnPalette && input.opticalBlendVisible,
    ),
  ];

  const station7Puzzles: Puzzle<unknown>[] = [
    createPuzzle<{ primaryPct: number; secondaryPct: number; accentPct: number }>(
      "puzzle-19",
      "station-07",
      "Color Balance 60/30/10",
      "Allocate 60% primary, 30% secondary, and 10% accent to achieve a balanced composition.",
      PuzzleType.COLOR_BALANCE,
      "pet-19",
      (input) =>
        Math.abs(input.primaryPct - 60) <= 5 &&
        Math.abs(input.secondaryPct - 30) <= 5 &&
        Math.abs(input.accentPct - 10) <= 3 &&
        Math.abs(input.primaryPct + input.secondaryPct + input.accentPct - 100) <= 2,
    ),
    createPuzzle<{ mappings: Record<string, string> }>(
      "puzzle-20",
      "station-07",
      "Emotional Colour Mapping",
      "Match each colour to its primary psychological association.",
      PuzzleType.COLOR_PSYCHOLOGY,
      "pet-20",
      (input) => {
        const correct: Record<string, string> = {
          red: "excitement",
          blue: "trust",
          yellow: "optimism",
          green: "growth",
        };
        const m = input.mappings;
        return m != null && Object.entries(correct).every(([color, emotion]) => m[color] === emotion);
      },
    ),
    createPuzzle<{ hueA: number; hueB: number; valueBalanced: boolean }>(
      "puzzle-21",
      "station-07",
      "Chromatic Vibration",
      "Place complementary colours of equal value side by side to create optical vibration.",
      PuzzleType.COLOR_VIBRATION,
      "pet-21",
      (input) => {
        const diff = Math.abs(((input.hueB - input.hueA + 540) % 360) - 180);
        return diff <= 20 && input.valueBalanced;
      },
    ),
  ];

  station1Puzzles.forEach((puzzle, index) => {
    if (index > 0) {
      puzzle.state = PuzzleState.Locked;
    }
  });

  return [
    new Station("station-01", "Light Laboratory", StationType.LightLaboratory, { x: 4, y: 2 }, station1Puzzles, true),
    new Station("station-02", "Value Sketchboard", StationType.ValueSketchboard, { x: 1, y: 6 }, station2Puzzles),
    new Station("station-03", "Color Wheel Table", StationType.ColorWheelTable, { x: 6, y: 6 }, station3Puzzles),
    new Station("station-04", "Optical Illusion Wall", StationType.OpticalIllusionWall, { x: 9, y: 5 }, station4Puzzles),
    new Station("station-05", "Window Landscape", StationType.WindowLandscape, { x: 11, y: 2 }, station5Puzzles),
    new Station("station-06", "Paint Workbench", StationType.PaintWorkbench, { x: 7, y: 1 }, station6Puzzles),
    new Station("station-07", "Design Studio", StationType.DesignStudio, { x: 3, y: 4 }, station7Puzzles),
  ];
}
