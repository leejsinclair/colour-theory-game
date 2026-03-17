import { Player } from "../entities/Player";
import { SceneType } from "../types/gameTypes";
import { createPets, createStationsAndPuzzles, finalCanvasRequirements } from "../content/gameContent";
import { PlayerController } from "./PlayerController";
import { SceneManager } from "./SceneManager";
import { PetManager } from "../systems/PetManager";
import { PuzzleManager } from "../systems/PuzzleManager";
import { SaveData, SaveSystem } from "../systems/SaveSystem";
import { StationManager } from "../systems/StationManager";

const BASE_PET_MILESTONES: Array<{ threshold: number; badge: string }> = [
  { threshold: 6, badge: "Color Apprentice" },
  { threshold: 12, badge: "Palette Keeper" },
];

/** Maximum practice points that can accumulate per puzzle per session. */
const PRACTICE_CAP_PER_PUZZLE = 30;

export type ScoreEvent = {
  delta: number;
  reason: string;
};

export class Game {
  readonly sceneManager = new SceneManager();
  readonly stationManager = new StationManager();
  readonly puzzleManager = new PuzzleManager();
  readonly petManager = new PetManager();
  readonly saveSystem = new SaveSystem();
  readonly player = new Player({ x: 0, y: 0 }, 2.5);
  readonly playerController = new PlayerController(this.player);

  private finalCanvasUnlocked = false;

  score = 0;
  practiceScoreByPuzzle: Record<string, number> = {};
  petMilestonesUnlocked: string[] = [];
  currentStreak = 0;
  bestStreak = 0;

  initialize(): void {
    const stations = createStationsAndPuzzles();
    const puzzles = stations.flatMap((station) => station.puzzles);

    this.stationManager.registerStations(stations);
    this.puzzleManager.registerPuzzles(puzzles);
    this.petManager.registerPets(createPets());

    this.puzzleManager.unlockPuzzlesByStation("station-01");
    this.sceneManager.loadScene(SceneType.StudioScene);

    this.score = 0;
    this.practiceScoreByPuzzle = {};
    this.petMilestonesUnlocked = [];
    this.currentStreak = 0;
    this.bestStreak = 0;
  }

  /**
   * Attempt to solve a puzzle for the first time.
   * Returns a ScoreEvent describing the points awarded, or null when the
   * puzzle is already solved (use practiceComplete for that case).
   */
  completePuzzle<TInput>(puzzleId: string, input: TInput): ScoreEvent | null {
    const puzzle = this.puzzleManager.getPuzzle(puzzleId);
    if (!puzzle || puzzle.solved) {
      return null;
    }

    this.puzzleManager.startPuzzle(puzzleId);
    const solved = this.puzzleManager.submitSolution(puzzleId, input);

    if (!solved) {
      this.currentStreak = 0;
      return null;
    }

    this.currentStreak += 1;
    if (this.currentStreak > this.bestStreak) {
      this.bestStreak = this.currentStreak;
    }

    // +100 first-time puzzle solve
    let delta = 100;
    let reason = `+100 First Solve: ${puzzle.title}`;

    // +25 new pet rescue
    const petCountBefore = this.petManager.getUnlockedPets().length;
    this.petManager.unlockPet(puzzle.rewardPetId);
    this.playerController.collectPet(puzzle.rewardPetId);
    if (this.petManager.getUnlockedPets().length > petCountBefore) {
      delta += 25;
      reason += " +25 Pet Rescued";
    }

    const station = this.stationManager.getStation(puzzle.stationId);
    if (!station) {
      this.score += delta;
      return { delta, reason };
    }

    const stationPuzzles = this.puzzleManager.getPuzzlesByStation(station.id);
    const solvedInStation = stationPuzzles.filter((p) => p.solved).length;

    if (solvedInStation < stationPuzzles.length) {
      const nextPuzzle = stationPuzzles[solvedInStation];
      nextPuzzle.unlock();
    }

    this.stationManager.refreshCompletion(station.id);

    // +50 station completion bonus
    if (station.completed) {
      delta += 50;
      reason += " +50 Station Complete";
    }

    this.unlockNextStationIfNeeded();

    const wasLocked = !this.finalCanvasUnlocked;
    this.checkFinalCanvasUnlock();

    // +200 final canvas unlock bonus (once)
    if (wasLocked && this.finalCanvasUnlocked) {
      delta += 200;
      reason += " +200 Final Canvas!";
    }

    this.score += delta;
    this.checkPetMilestones();

    return { delta, reason };
  }

  /**
   * Award practice points for a puzzle that is already solved.
   * Points are +10 per valid practice completion, capped at +30 per puzzle per session.
   * Streak increments on every valid practice (including when the cap is already reached).
   */
  practiceComplete(puzzleId: string, valid: boolean): ScoreEvent | null {
    if (!valid) {
      this.currentStreak = 0;
      return null;
    }

    const existing = this.practiceScoreByPuzzle[puzzleId] ?? 0;
    if (existing >= PRACTICE_CAP_PER_PUZZLE) {
      this.currentStreak += 1;
      if (this.currentStreak > this.bestStreak) {
        this.bestStreak = this.currentStreak;
      }
      return { delta: 0, reason: "Practice cap reached for this puzzle" };
    }

    const base = 10;
    const gained = Math.min(base, PRACTICE_CAP_PER_PUZZLE - existing);
    this.practiceScoreByPuzzle[puzzleId] = existing + gained;
    this.score += gained;

    this.currentStreak += 1;
    if (this.currentStreak > this.bestStreak) {
      this.bestStreak = this.currentStreak;
    }

    return { delta: gained, reason: `+${gained} Practice: ${puzzleId}` };
  }

  getProgress(): {
    solved: number;
    total: number;
    petsCollected: number;
    finalCanvasUnlocked: boolean;
    score: number;
    currentStreak: number;
    bestStreak: number;
    petMilestonesUnlocked: string[];
  } {
    return {
      solved: this.puzzleManager.getSolvedCount(),
      total: this.puzzleManager.getTotalCount(),
      petsCollected: this.petManager.getUnlockedPets().length,
      finalCanvasUnlocked: this.finalCanvasUnlocked,
      score: this.score,
      currentStreak: this.currentStreak,
      bestStreak: this.bestStreak,
      petMilestonesUnlocked: [...this.petMilestonesUnlocked],
    };
  }

  save(): void {
    const saveData: SaveData = {
      completedPuzzles: this.stationManager
        .getAllStations()
        .flatMap((station) => station.puzzles)
        .filter((puzzle) => puzzle.solved)
        .map((puzzle) => puzzle.id),
      collectedPets: this.player.collectedPets,
      unlockedStations: this.stationManager.getUnlockedStations().map((station) => station.id),
      playerPosition: this.player.position,
      score: this.score,
      practiceScoreByPuzzle: { ...this.practiceScoreByPuzzle },
      petMilestonesUnlocked: [...this.petMilestonesUnlocked],
      currentStreak: this.currentStreak,
      bestStreak: this.bestStreak,
    };

    this.saveSystem.saveGame(saveData);
  }

  load(): SaveData | null {
    return this.saveSystem.loadGame();
  }

  getFinalCanvasPrompt(): string {
    return `Grand Canvas unlocked. Apply: ${finalCanvasRequirements.join(", ")}.`;
  }

  private checkPetMilestones(): void {
    const count = this.petManager.getUnlockedPets().length;
    const milestones = [
      ...BASE_PET_MILESTONES,
      { threshold: this.puzzleManager.getTotalCount(), badge: "Chromatic Master" },
    ];

    for (const { threshold, badge } of milestones) {
      if (count >= threshold && !this.petMilestonesUnlocked.includes(badge)) {
        this.petMilestonesUnlocked.push(badge);
      }
    }
  }

  private unlockNextStationIfNeeded(): void {
    const stations = this.stationManager.getAllStations();
    const nextLocked = stations.find((station) => !station.unlocked);
    const unlockedCompleted = stations.filter((station) => station.unlocked && station.completed).length;

    if (nextLocked && unlockedCompleted >= this.stationManager.getUnlockedStations().length) {
      this.stationManager.unlockStation(nextLocked.id);
      this.puzzleManager.unlockPuzzlesByStation(nextLocked.id);
    }
  }

  private checkFinalCanvasUnlock(): void {
    if (this.finalCanvasUnlocked) {
      return;
    }

    if (this.petManager.getUnlockedPets().length >= this.puzzleManager.getTotalCount()) {
      this.finalCanvasUnlocked = true;
      this.sceneManager.transitionScene(SceneType.FinalCanvasScene);
    }
  }
}
