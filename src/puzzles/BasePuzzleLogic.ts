export interface PuzzleLogic<TInput> {
  startPuzzle(): void;
  updatePuzzle(input: TInput): boolean;
  checkSolution(input: TInput): boolean;
  completePuzzle(): void;
}
