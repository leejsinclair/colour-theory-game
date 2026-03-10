import { Puzzle } from "../entities/Puzzle";
import { PuzzleState } from "../types/gameTypes";

export class PuzzleManager {
  private readonly puzzles = new Map<string, Puzzle<unknown>>();

  registerPuzzles(puzzles: Puzzle<unknown>[]): void {
    puzzles.forEach((puzzle) => this.puzzles.set(puzzle.id, puzzle));
  }

  unlockPuzzlesByStation(stationId: string): void {
    this.getPuzzlesByStation(stationId).forEach((puzzle, index) => {
      if (index === 0 && puzzle.state === PuzzleState.Locked) {
        puzzle.unlock();
      }
    });
  }

  startPuzzle(puzzleId: string): boolean {
    const puzzle = this.puzzles.get(puzzleId);
    if (!puzzle) {
      return false;
    }

    puzzle.startPuzzle();
    return puzzle.state === PuzzleState.InProgress;
  }

  submitSolution<TInput>(puzzleId: string, input: TInput): boolean {
    const puzzle = this.puzzles.get(puzzleId) as Puzzle<TInput> | undefined;
    if (!puzzle) {
      return false;
    }

    return puzzle.updatePuzzle(input);
  }

  getPuzzle(puzzleId: string): Puzzle<unknown> | undefined {
    return this.puzzles.get(puzzleId);
  }

  getPuzzlesByStation(stationId: string): Puzzle<unknown>[] {
    return [...this.puzzles.values()].filter((puzzle) => puzzle.stationId === stationId);
  }

  getSolvedCount(): number {
    return [...this.puzzles.values()].filter((puzzle) => puzzle.solved).length;
  }

  getTotalCount(): number {
    return this.puzzles.size;
  }
}
