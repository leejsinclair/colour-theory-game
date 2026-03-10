import { describe, expect, test } from "vitest";
import { getDemoSolution } from "../src/content/demoSolutions";
import { Game } from "../src/game/Game";
import { SceneType } from "../src/types/gameTypes";

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

    const solved = game.completePuzzle("puzzle-01", getDemoSolution("puzzle-01"));
    expect(solved).toBe(true);

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

    for (let i = 1; i <= 18; i += 1) {
      const puzzleId = `puzzle-${String(i).padStart(2, "0")}`;
      const solved = game.completePuzzle(puzzleId, getDemoSolution(puzzleId));
      expect(solved).toBe(true);
    }

    const progress = game.getProgress();
    expect(progress.petsCollected).toBe(18);
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
