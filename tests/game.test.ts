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
