import { Player } from "../entities/Player";
import { SceneType } from "../types/gameTypes";
import { createPets, createStationsAndPuzzles, finalCanvasRequirements } from "../content/gameContent";
import { PlayerController } from "./PlayerController";
import { SceneManager } from "./SceneManager";
import { PetManager } from "../systems/PetManager";
import { PuzzleManager } from "../systems/PuzzleManager";
import { SaveData, SaveSystem } from "../systems/SaveSystem";
import { StationManager } from "../systems/StationManager";

export class Game {
  readonly sceneManager = new SceneManager();
  readonly stationManager = new StationManager();
  readonly puzzleManager = new PuzzleManager();
  readonly petManager = new PetManager();
  readonly saveSystem = new SaveSystem();
  readonly player = new Player({ x: 0, y: 0 }, 2.5);
  readonly playerController = new PlayerController(this.player);

  private finalCanvasUnlocked = false;

  initialize(): void {
    const stations = createStationsAndPuzzles();
    const puzzles = stations.flatMap((station) => station.puzzles);

    this.stationManager.registerStations(stations);
    this.puzzleManager.registerPuzzles(puzzles);
    this.petManager.registerPets(createPets());

    this.puzzleManager.unlockPuzzlesByStation("station-01");
    this.sceneManager.loadScene(SceneType.StudioScene);
  }

  completePuzzle<TInput>(puzzleId: string, input: TInput): boolean {
    const puzzle = this.puzzleManager.getPuzzle(puzzleId);
    if (!puzzle || puzzle.solved) {
      return false;
    }

    this.puzzleManager.startPuzzle(puzzleId);
    const solved = this.puzzleManager.submitSolution(puzzleId, input);

    if (!solved) {
      return false;
    }

    this.petManager.unlockPet(puzzle.rewardPetId);
    this.playerController.collectPet(puzzle.rewardPetId);

    const station = this.stationManager.getStation(puzzle.stationId);
    if (!station) {
      return false;
    }

    const stationPuzzles = this.puzzleManager.getPuzzlesByStation(station.id);
    const solvedInStation = stationPuzzles.filter((p) => p.solved).length;

    if (solvedInStation < stationPuzzles.length) {
      const nextPuzzle = stationPuzzles[solvedInStation];
      nextPuzzle.unlock();
    }

    this.stationManager.refreshCompletion(station.id);
    this.unlockNextStationIfNeeded();
    this.checkFinalCanvasUnlock();
    return true;
  }

  getProgress(): { solved: number; total: number; petsCollected: number; finalCanvasUnlocked: boolean } {
    return {
      solved: this.puzzleManager.getSolvedCount(),
      total: this.puzzleManager.getTotalCount(),
      petsCollected: this.petManager.getUnlockedPets().length,
      finalCanvasUnlocked: this.finalCanvasUnlocked,
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
    };

    this.saveSystem.saveGame(saveData);
  }

  load(): SaveData | null {
    return this.saveSystem.loadGame();
  }

  getFinalCanvasPrompt(): string {
    return `Grand Canvas unlocked. Apply: ${finalCanvasRequirements.join(", ")}.`;
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

    if (this.petManager.getUnlockedPets().length >= 18) {
      this.finalCanvasUnlocked = true;
      this.sceneManager.transitionScene(SceneType.FinalCanvasScene);
    }
  }
}
