import { describe, expect, test } from "vitest";
import { getDemoSolution, moodPaletteSolution } from "../src/content/demoSolutions";
import { puzzleLearningContent } from "../src/content/puzzleLearningContent";
import { Game } from "../src/game/Game";
import { SceneType } from "../src/types/gameTypes";

function solveAllPuzzles(game: Game): ReturnType<typeof game.completePuzzle> {
  let finalEvent: ReturnType<typeof game.completePuzzle> = null;
  const total = game.getProgress().total;
  for (let i = 1; i <= total; i += 1) {
    const puzzleId = `puzzle-${String(i).padStart(2, "0")}`;
    finalEvent = game.completePuzzle(puzzleId, getDemoSolution(puzzleId));
  }
  return finalEvent;
}

describe("Game progression", () => {
  test("initially unlocks first station and first puzzle only", () => {
    const game = new Game();
    game.initialize();

    const station1 = game.stationManager.getStation("station-01");
    const station2 = game.stationManager.getStation("station-02");

    expect(station1?.unlocked).toBe(true);
    expect(station2?.unlocked).toBe(false);
    expect(station1?.puzzles[0].state).toBe("available");
    expect(station1?.puzzles[1].state).toBe("locked");
  });

  test("solving puzzle unlocks next puzzle in same station", () => {
    const game = new Game();
    game.initialize();

    const event = game.completePuzzle("puzzle-01", getDemoSolution("puzzle-01"));
    expect(event).not.toBeNull();

    const station1 = game.stationManager.getStation("station-01");
    expect(station1?.puzzles[1].state).toBe("available");
  });

  test("completing a station unlocks the next station", () => {
    const game = new Game();
    game.initialize();

    game.completePuzzle("puzzle-01", getDemoSolution("puzzle-01"));
    game.completePuzzle("puzzle-02", getDemoSolution("puzzle-02"));
    game.completePuzzle("puzzle-03", getDemoSolution("puzzle-03"));

    const station2 = game.stationManager.getStation("station-02");
    expect(station2?.unlocked).toBe(true);
    expect(station2?.puzzles[0].state).toBe("available");
  });

  test("collecting all pets unlocks final canvas scene", () => {
    const game = new Game();
    game.initialize();

    const total = game.getProgress().total;
    const finalEvent = solveAllPuzzles(game);
    expect(finalEvent).not.toBeNull();

    const progress = game.getProgress();
    expect(progress.petsCollected).toBe(total);
    expect(progress.finalCanvasUnlocked).toBe(true);
    expect(game.sceneManager.getCurrentScene()).toBe(SceneType.FinalCanvasScene);
  });

  test("save and load snapshots solved progress", () => {
    const game = new Game();
    game.initialize();

    game.completePuzzle("puzzle-01", getDemoSolution("puzzle-01"));
    game.save();

    const snapshot = game.load();
    expect(snapshot).not.toBeNull();
    expect(snapshot?.completedPuzzles).toContain("puzzle-01");
    expect(snapshot?.collectedPets.length).toBe(1);
  });
});

describe("Gamification scoring", () => {
  test("first-time solve awards +100 plus pet bonus", () => {
    const game = new Game();
    game.initialize();

    const event = game.completePuzzle("puzzle-01", getDemoSolution("puzzle-01"));
    expect(event).not.toBeNull();
    // +100 first solve + +25 pet = 125 minimum
    expect(event!.delta).toBeGreaterThanOrEqual(125);
    expect(event!.reason).toContain("+100");
    expect(game.getProgress().score).toBe(event!.delta);
  });

  test("solving already-solved puzzle returns null (idempotent)", () => {
    const game = new Game();
    game.initialize();

    game.completePuzzle("puzzle-01", getDemoSolution("puzzle-01"));
    const second = game.completePuzzle("puzzle-01", getDemoSolution("puzzle-01"));
    expect(second).toBeNull();

    // Score must not have been double-counted
    const progress = game.getProgress();
    // Only first-solve points: at most 125 (could be up to 175 if station completed)
    expect(progress.score).toBeLessThanOrEqual(175);
  });

  test("station completion bonus +50 awarded when all station puzzles solved", () => {
    const game = new Game();
    game.initialize();

    game.completePuzzle("puzzle-01", getDemoSolution("puzzle-01"));
    game.completePuzzle("puzzle-02", getDemoSolution("puzzle-02"));
    const event = game.completePuzzle("puzzle-03", getDemoSolution("puzzle-03"));

    expect(event!.reason).toContain("+50");
    expect(game.getProgress().score).toBeGreaterThanOrEqual(125 * 3 + 50);
  });

  test("final canvas unlock awards +200 bonus", () => {
    const game = new Game();
    game.initialize();

    const finalEvent = solveAllPuzzles(game);

    expect(finalEvent!.reason).toContain("+200");
    expect(game.getProgress().score).toBeGreaterThan(0);
  });

  test("practice completes award +10 up to cap of 30 per puzzle", () => {
    const game = new Game();
    game.initialize();

    game.completePuzzle("puzzle-01", getDemoSolution("puzzle-01"));
    const scoreAfterFirstSolve = game.getProgress().score;

    const e1 = game.practiceComplete("puzzle-01", true);
    const e2 = game.practiceComplete("puzzle-01", true);
    const e3 = game.practiceComplete("puzzle-01", true);
    // Cap hit: 4th practice earns 0
    const e4 = game.practiceComplete("puzzle-01", true);

    expect(e1!.delta).toBe(10);
    expect(e2!.delta).toBe(10);
    expect(e3!.delta).toBe(10);
    expect(e4!.delta).toBe(0);

    expect(game.getProgress().score).toBe(scoreAfterFirstSolve + 30);
  });

  test("invalid practice resets streak and returns null", () => {
    const game = new Game();
    game.initialize();

    game.completePuzzle("puzzle-01", getDemoSolution("puzzle-01"));
    const result = game.practiceComplete("puzzle-01", false);
    expect(result).toBeNull();
    expect(game.getProgress().currentStreak).toBe(0);
  });
});

describe("Pet milestones", () => {
  function solveN(game: Game, n: number): void {
    for (let i = 1; i <= n; i += 1) {
      const puzzleId = `puzzle-${String(i).padStart(2, "0")}`;
      game.completePuzzle(puzzleId, getDemoSolution(puzzleId));
    }
  }

  test("no milestones at 5 pets", () => {
    const game = new Game();
    game.initialize();
    solveN(game, 5);
    expect(game.getProgress().petMilestonesUnlocked).toHaveLength(0);
  });

  test("Color Apprentice unlocked at 6 pets", () => {
    const game = new Game();
    game.initialize();
    solveN(game, 6);
    expect(game.getProgress().petMilestonesUnlocked).toContain("Color Apprentice");
  });

  test("Palette Keeper unlocked at 12 pets", () => {
    const game = new Game();
    game.initialize();
    solveN(game, 12);
    expect(game.getProgress().petMilestonesUnlocked).toContain("Palette Keeper");
  });

  test("Chromatic Master unlocked when all pets are collected", () => {
    const game = new Game();
    game.initialize();
    solveN(game, game.getProgress().total);
    expect(game.getProgress().petMilestonesUnlocked).toContain("Chromatic Master");
  });

  test("milestones are idempotent on repeated checks", () => {
    const game = new Game();
    game.initialize();
    solveN(game, 6);
    // Trigger milestone check multiple times via additional solves (idempotency)
    solveN(game, 6); // already solved — completePuzzle returns null, no duplicate added
    const milestones = game.getProgress().petMilestonesUnlocked;
    const apprenticeCount = milestones.filter((m) => m === "Color Apprentice").length;
    expect(apprenticeCount).toBe(1);
  });
});

describe("Save/load with gamification fields", () => {
  test("saved gamification data survives a round-trip", () => {
    const game = new Game();
    game.initialize();

    game.completePuzzle("puzzle-01", getDemoSolution("puzzle-01"));
    game.completePuzzle("puzzle-02", getDemoSolution("puzzle-02"));
    game.completePuzzle("puzzle-03", getDemoSolution("puzzle-03"));
    game.practiceComplete("puzzle-01", true);
    game.save();

    const snapshot = game.load();
    expect(snapshot).not.toBeNull();
    expect(snapshot!.score).toBeGreaterThan(0);
    expect(snapshot!.practiceScoreByPuzzle["puzzle-01"]).toBe(10);
    expect(snapshot!.bestStreak).toBeGreaterThan(0);
  });

  test("loading older save without gamification fields defaults safely", () => {
    const game = new Game();
    game.initialize();

    // Manually inject a save that is missing the new fields (simulates old save)
    const oldSave = {
      completedPuzzles: ["puzzle-01"],
      collectedPets: ["pet-01"],
      unlockedStations: ["station-01"],
      playerPosition: { x: 0, y: 0 },
    };
    (game.saveSystem as any).snapshot = oldSave;

    const loaded = game.load();
    expect(loaded).not.toBeNull();
    expect(loaded!.score).toBe(0);
    expect(loaded!.practiceScoreByPuzzle).toEqual({});
    expect(loaded!.petMilestonesUnlocked).toEqual([]);
    expect(loaded!.currentStreak).toBe(0);
    expect(loaded!.bestStreak).toBe(0);
  });
});

describe("Mood Palette puzzle solutions", () => {
  function solveUpToPuzzle09(game: Game): void {
    for (let i = 1; i <= 8; i += 1) {
      const puzzleId = `puzzle-${String(i).padStart(2, "0")}`;
      game.completePuzzle(puzzleId, getDemoSolution(puzzleId));
    }
  }

  test("all correct palette selections are accepted", () => {
    const game = new Game();
    game.initialize();
    solveUpToPuzzle09(game);
    const event = game.completePuzzle("puzzle-09", moodPaletteSolution);
    expect(event).not.toBeNull();
  });

  test("wrong palette for one mood is rejected", () => {
    const game = new Game();
    game.initialize();
    solveUpToPuzzle09(game);
    // joyful carnival mapped to ocean palette instead of the warm one
    const event = game.completePuzzle("puzzle-09", {
      selections: { "joyful carnival": "A", "calm ocean": "A", "creepy dungeon": "B" },
    });
    expect(event).toBeNull();
  });

  test("incomplete selections are rejected", () => {
    const game = new Game();
    game.initialize();
    solveUpToPuzzle09(game);
    const event = game.completePuzzle("puzzle-09", {
      selections: { "calm ocean": "A" },
    });
    expect(event).toBeNull();
  });

  test("null selections are rejected", () => {
    const game = new Game();
    game.initialize();
    solveUpToPuzzle09(game);
    const event = game.completePuzzle("puzzle-09", { selections: null });
    expect(event).toBeNull();
  });
});

describe("Learning content metadata", () => {
  test("includes learning entries for all 21 puzzles", () => {
    const puzzleIds = Array.from({ length: 21 }, (_, i) => `puzzle-${String(i + 1).padStart(2, "0")}`);
    for (const puzzleId of puzzleIds) {
      expect(puzzleLearningContent[puzzleId]).toBeDefined();
    }
    expect(Object.keys(puzzleLearningContent)).toHaveLength(21);
  });

  test("every puzzle has two intro paragraphs and quiz questions with valid answers", () => {
    for (const [puzzleId, content] of Object.entries(puzzleLearningContent)) {
      expect(content.title.length).toBeGreaterThan(0);
      expect(content.intro).toHaveLength(2);
      content.intro.forEach((paragraph) => {
        expect(paragraph.trim().length).toBeGreaterThan(20);
      });

      expect(content.illustrationSvg).toContain("<svg");
      expect(content.quiz.length).toBeGreaterThanOrEqual(2);

      content.quiz.forEach((question, index) => {
        expect(question.prompt.trim().length).toBeGreaterThan(8);
        expect(question.options.length).toBeGreaterThanOrEqual(2);
        expect(question.correctIndex).toBeGreaterThanOrEqual(0);
        expect(question.correctIndex).toBeLessThan(question.options.length);
        expect(question.explanation.trim().length).toBeGreaterThan(8);

        const correctText = question.options[question.correctIndex]?.trim() ?? "";
        expect(correctText.length, `${puzzleId} question ${index + 1} has empty correct option`).toBeGreaterThan(0);
      });
    }
  });
});

// ---------------------------------------------------------------------------
// Diagnostic Feedback System
// ---------------------------------------------------------------------------

import { diagnoseFailure } from "../src/web/puzzles/diagnose";
import { FAILURE_EXPLANATIONS, type FailureReasonCode } from "../src/web/puzzles/failureReasons";

describe("diagnoseFailure – Puzzle 16 (Vibrant Green)", () => {
  test("returns incorrect_hue_selection when fewer than 2 pigments are selected", () => {
    const reasons = diagnoseFailure("puzzle-16", { pigments: ["hansa yellow"], mudLevel: 0 });
    expect(reasons).toContain("incorrect_hue_selection");
  });

  test("returns incorrect_hue_selection when both pigments are from same family", () => {
    const reasons = diagnoseFailure("puzzle-16", {
      pigments: ["hansa yellow", "cadmium lemon"],
      mudLevel: 0.5,
    });
    expect(reasons).toContain("incorrect_hue_selection");
  });

  test("returns incorrect_hue_selection when no blue pigment is selected", () => {
    const reasons = diagnoseFailure("puzzle-16", {
      pigments: ["hansa yellow", "raw sienna"],
      mudLevel: 0.5,
    });
    expect(reasons).toContain("incorrect_hue_selection");
  });

  test("returns hue bias and chroma reasons when yellow+blue but mud too high due to biased pigment", () => {
    const reasons = diagnoseFailure("puzzle-16", {
      pigments: ["raw sienna", "french ultramarine"],
      mudLevel: 0.5,
    });
    expect(reasons[0]).toBe("incorrect_hue_bias");
    expect(reasons).toContain("complement_conflict");
    expect(reasons).toContain("insufficient_chroma");
  });

  test("returns complement_conflict and insufficient_chroma when yellow+blue but clean pigments still muddy", () => {
    // hansa yellow + phthalo blue are low-bias; mudLevel > 0.16 still triggers failure
    const reasons = diagnoseFailure("puzzle-16", {
      pigments: ["hansa yellow", "phthalo blue"],
      mudLevel: 0.2,
    });
    expect(reasons).toContain("complement_conflict");
    expect(reasons).toContain("insufficient_chroma");
  });
});

describe("diagnoseFailure – Puzzle 17 (Mud Monster)", () => {
  test("returns complement_conflict when too many complement pairs are added", () => {
    const reasons = diagnoseFailure("puzzle-17", { complementPairsAdded: 2, muddyResult: true });
    expect(reasons[0]).toBe("complement_conflict");
  });

  test("returns chroma_collapsed when result is muddy", () => {
    const reasons = diagnoseFailure("puzzle-17", { complementPairsAdded: 1, muddyResult: true });
    expect(reasons).toContain("chroma_collapsed");
  });

  test("returns chroma_collapsed as fallback", () => {
    const reasons = diagnoseFailure("puzzle-17", { complementPairsAdded: 0, muddyResult: false });
    expect(reasons).toContain("chroma_collapsed");
  });
});

describe("diagnoseFailure – Puzzle 13 (Depth Painting)", () => {
  test("returns insufficient_atmosphere when edge softening and saturation are too low", () => {
    const reasons = diagnoseFailure("puzzle-13", {
      edgeSharpnessDropsWithDistance: false,
      saturationDropsWithDistance: false,
      hueShiftsCoolerWithDistance: true,
    });
    expect(reasons).toContain("insufficient_atmosphere");
  });

  test("returns incorrect_color_temperature when hue shift is missing", () => {
    const reasons = diagnoseFailure("puzzle-13", {
      edgeSharpnessDropsWithDistance: true,
      saturationDropsWithDistance: true,
      hueShiftsCoolerWithDistance: false,
    });
    expect(reasons).toContain("incorrect_color_temperature");
  });

  test("returns both atmosphere and temperature reasons when all cues are missing", () => {
    const reasons = diagnoseFailure("puzzle-13", {
      edgeSharpnessDropsWithDistance: false,
      saturationDropsWithDistance: false,
      hueShiftsCoolerWithDistance: false,
    });
    expect(reasons).toContain("insufficient_atmosphere");
    expect(reasons).toContain("incorrect_color_temperature");
  });
});

describe("diagnoseFailure – unknown puzzle", () => {
  test("returns empty array for puzzles without specific diagnosis", () => {
    const reasons = diagnoseFailure("nonexistent", {});
    expect(reasons).toHaveLength(0);
  });
});

describe("diagnoseFailure – new puzzles (01, 02, 03, 04, 05, 06, 12, 14, 18, 21)", () => {
  test("puzzle-01: always returns incorrect_hue_selection", () => {
    expect(diagnoseFailure("puzzle-01", { redBeam: false, greenBeam: false, blueBeam: false }))
      .toContain("incorrect_hue_selection");
    expect(diagnoseFailure("puzzle-01", { redBeam: true, greenBeam: true, blueBeam: false }))
      .toContain("incorrect_hue_selection");
  });

  test("puzzle-02: always returns unbalanced_mix", () => {
    const reasons = diagnoseFailure("puzzle-02", {
      cyan: 0.1, magenta: 0.1, yellow: 0.1,
      target: { cyan: 0.4, magenta: 0.5, yellow: 0.2 },
    });
    expect(reasons).toContain("unbalanced_mix");
  });

  test("puzzle-03: wrong complementary pair → incorrect_hue_selection", () => {
    const reasons = diagnoseFailure("puzzle-03", { pigments: ["red", "yellow"], luminousShadow: false });
    expect(reasons).toContain("incorrect_hue_selection");
  });

  test("puzzle-03: correct pair but not luminous → chroma_collapsed", () => {
    const reasons = diagnoseFailure("puzzle-03", { pigments: ["blue", "orange"], luminousShadow: false });
    expect(reasons).toContain("chroma_collapsed");
  });

  test("puzzle-04: not black and white → incorrect_hue_selection", () => {
    const reasons = diagnoseFailure("puzzle-04", { usesOnlyBlackAndWhite: false, blurReadability: 0.8 });
    expect(reasons).toContain("incorrect_hue_selection");
  });

  test("puzzle-04: black and white but unreadable → low_value_contrast", () => {
    const reasons = diagnoseFailure("puzzle-04", { usesOnlyBlackAndWhite: true, blurReadability: 0.4 });
    expect(reasons).toContain("low_value_contrast");
  });

  test("puzzle-05: always returns incorrect_value_structure", () => {
    expect(diagnoseFailure("puzzle-05", { orderedValues: [5, 3, 8] }))
      .toContain("incorrect_value_structure");
  });

  test("puzzle-06: too few hues → insufficient_chroma", () => {
    expect(diagnoseFailure("puzzle-06", { exploredHues: ["red", "blue"], discoveredDifferentChromaPeaks: false }))
      .toContain("insufficient_chroma");
  });

  test("puzzle-06: enough hues but missed peaks → incorrect_hue_selection", () => {
    expect(diagnoseFailure("puzzle-06", { exploredHues: ["red", "blue", "green"], discoveredDifferentChromaPeaks: false }))
      .toContain("incorrect_hue_selection");
  });

  test("puzzle-12: too few neutrals → competing_focal_points", () => {
    const reasons = diagnoseFailure("puzzle-12", { neutralCount: 1, accentContrast: 0.8 });
    expect(reasons).toContain("competing_focal_points");
  });

  test("puzzle-12: low contrast → weak_accent_isolation", () => {
    const reasons = diagnoseFailure("puzzle-12", { neutralCount: 3, accentContrast: 0.3 });
    expect(reasons).toContain("weak_accent_isolation");
  });

  test("puzzle-14: far objects not blue → incorrect_color_temperature", () => {
    const reasons = diagnoseFailure("puzzle-14", { farObjectsShiftBlue: false, scatteringStrength: 0.8 });
    expect(reasons).toContain("incorrect_color_temperature");
  });

  test("puzzle-14: blue shift ok but scatter too low → insufficient_atmosphere", () => {
    const reasons = diagnoseFailure("puzzle-14", { farObjectsShiftBlue: true, scatteringStrength: 0.4 });
    expect(reasons).toContain("insufficient_atmosphere");
  });

  test("puzzle-18: mixed on palette → overmixing", () => {
    const reasons = diagnoseFailure("puzzle-18", { usedPureDots: true, mixedOnPalette: true, opticalBlendVisible: true });
    expect(reasons).toContain("overmixing");
  });

  test("puzzle-18: not enough dots → insufficient_chroma", () => {
    const reasons = diagnoseFailure("puzzle-18", { usedPureDots: false, mixedOnPalette: false, opticalBlendVisible: false });
    expect(reasons).toContain("insufficient_chroma");
  });

  test("puzzle-21: non-complementary hues → incorrect_hue_selection", () => {
    const reasons = diagnoseFailure("puzzle-21", { hueA: 0, hueB: 90, valueBalanced: true });
    expect(reasons).toContain("incorrect_hue_selection");
  });

  test("puzzle-21: complementary but unbalanced → low_value_contrast", () => {
    const reasons = diagnoseFailure("puzzle-21", { hueA: 0, hueB: 180, valueBalanced: false });
    expect(reasons).toContain("low_value_contrast");
  });
});

describe("FAILURE_EXPLANATIONS completeness", () => {
  const allCodes: FailureReasonCode[] = [
    "low_value_contrast", "incorrect_value_structure",
    "chroma_collapsed", "insufficient_chroma", "excessive_chroma",
    "complement_conflict", "incorrect_hue_selection", "incorrect_hue_bias",
    "overmixing", "unbalanced_mix",
    "insufficient_atmosphere", "excessive_atmosphere", "incorrect_color_temperature",
    "weak_simultaneous_contrast", "competing_focal_points", "weak_accent_isolation",
  ];

  test("every canonical reason code has a non-empty explanation", () => {
    for (const code of allCodes) {
      const explanation = FAILURE_EXPLANATIONS[code];
      expect(explanation, `Missing explanation for ${code}`).toBeTruthy();
      expect(explanation.length, `Explanation too short for ${code}`).toBeGreaterThan(20);
    }
  });
});
