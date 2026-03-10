import { Puzzle } from "../entities/Puzzle";
import { PuzzleState, PuzzleType } from "../types/gameTypes";

export type ComplementPuzzleInput = {
  selectedColorA: string;
  selectedColorB: string;
};

const complements: Record<string, string> = {
  red: "green",
  green: "red",
  blue: "orange",
  orange: "blue",
  yellow: "purple",
  purple: "yellow",
};

export class ComplementPuzzle extends Puzzle<ComplementPuzzleInput> {
  constructor(id: string, stationId: string, rewardPetId: string) {
    super(
      id,
      stationId,
      "Complementary Colors",
      "Match opposite colors on the wheel.",
      PuzzleType.COLOR_COMPLEMENT,
      rewardPetId,
      (input) => {
        const a = input.selectedColorA.toLowerCase();
        const b = input.selectedColorB.toLowerCase();
        return complements[a] === b;
      },
      PuzzleState.Locked,
    );
  }
}
