import { Vec2 } from "../types/gameTypes";

export type SaveData = {
  completedPuzzles: string[];
  collectedPets: string[];
  unlockedStations: string[];
  playerPosition: Vec2;
};

export class SaveSystem {
  private snapshot: SaveData | null = null;

  saveGame(data: SaveData): void {
    // This can be replaced with file/localStorage persistence.
    this.snapshot = structuredClone(data);
  }

  loadGame(): SaveData | null {
    return this.snapshot ? structuredClone(this.snapshot) : null;
  }
}
