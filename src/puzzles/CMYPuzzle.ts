import { Puzzle } from "../entities/Puzzle";
import { PuzzleState, PuzzleType } from "../types/gameTypes";

export type CMYPuzzleInput = {
  cyan: number;
  magenta: number;
  yellow: number;
  target: { cyan: number; magenta: number; yellow: number };
  tolerance?: number;
};

export class CMYPuzzle extends Puzzle<CMYPuzzleInput> {
  constructor(id: string, stationId: string, rewardPetId: string) {
    super(
      id,
      stationId,
      "Printer Pigments",
      "Match the target color using CMY sliders.",
      PuzzleType.CMY_PRINT,
      rewardPetId,
      (input) => {
        const tolerance = input.tolerance ?? 0.08;
        const c = Math.abs(input.cyan - input.target.cyan) <= tolerance;
        const m = Math.abs(input.magenta - input.target.magenta) <= tolerance;
        const y = Math.abs(input.yellow - input.target.yellow) <= tolerance;
        return c && m && y;
      },
      PuzzleState.Locked,
    );
  }
}
