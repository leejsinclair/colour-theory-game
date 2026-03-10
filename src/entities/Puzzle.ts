import { PuzzleState, PuzzleType } from "../types/gameTypes";

export type PuzzleValidator<TInput = unknown> = (input: TInput) => boolean;

export class Puzzle<TInput = unknown> {
  public state: PuzzleState;
  public solved: boolean;

  constructor(
    public readonly id: string,
    public readonly stationId: string,
    public readonly title: string,
    public readonly description: string,
    public readonly puzzleType: PuzzleType,
    public readonly rewardPetId: string,
    private readonly validator: PuzzleValidator<TInput>,
    initialState: PuzzleState = PuzzleState.Locked,
  ) {
    this.state = initialState;
    this.solved = initialState === PuzzleState.Solved;
  }

  startPuzzle(): void {
    if (this.state === PuzzleState.Available) {
      this.state = PuzzleState.InProgress;
    }
  }

  updatePuzzle(input: TInput): boolean {
    if (this.state !== PuzzleState.InProgress) {
      return false;
    }

    if (this.checkSolution(input)) {
      this.completePuzzle();
      return true;
    }

    return false;
  }

  checkSolution(input: TInput): boolean {
    return this.validator(input);
  }

  completePuzzle(): void {
    this.state = PuzzleState.Solved;
    this.solved = true;
  }

  unlock(): void {
    if (this.state === PuzzleState.Locked) {
      this.state = PuzzleState.Available;
    }
  }
}
