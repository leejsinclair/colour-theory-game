import { Puzzle } from "./Puzzle";
import { StationType, Vec2 } from "../types/gameTypes";

export class Station {
  public unlocked: boolean;
  public completed: boolean;

  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly type: StationType,
    public readonly location: Vec2,
    public readonly puzzles: Puzzle[],
    unlocked = false,
  ) {
    this.unlocked = unlocked;
    this.completed = false;
  }

  unlock(): void {
    this.unlocked = true;
  }

  refreshCompletionState(): void {
    this.completed = this.puzzles.every((puzzle) => puzzle.solved);
  }
}
