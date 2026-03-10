import { Vec2 } from "../types/gameTypes";

export type SaveData = {
  completedPuzzles: string[];
  collectedPets: string[];
  unlockedStations: string[];
  playerPosition: Vec2;
  score: number;
  practiceScoreByPuzzle: Record<string, number>;
  petMilestonesUnlocked: string[];
  currentStreak: number;
  bestStreak: number;
};

export class SaveSystem {
  private snapshot: SaveData | null = null;

  saveGame(data: SaveData): void {
    // This can be replaced with file/localStorage persistence.
    this.snapshot = structuredClone(data);
  }

  loadGame(): SaveData | null {
    if (!this.snapshot) {
      return null;
    }
    const data = structuredClone(this.snapshot);
    // Backward compatibility: default missing gamification fields
    data.score ??= 0;
    data.practiceScoreByPuzzle ??= {};
    data.petMilestonesUnlocked ??= [];
    data.currentStreak ??= 0;
    data.bestStreak ??= 0;
    return data;
  }
}
