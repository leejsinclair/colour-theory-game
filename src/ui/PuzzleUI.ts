import { Puzzle } from "../entities/Puzzle";

export class PuzzleUI {
  renderPuzzleHeader(puzzle: Puzzle<unknown>): string {
    return `${puzzle.title} [${puzzle.state}]`;
  }

  renderObjective(description: string): string {
    return `Objective: ${description}`;
  }
}
