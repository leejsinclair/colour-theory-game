import { Puzzle } from "../entities/Puzzle";
import { PuzzleState, PuzzleType } from "../types/gameTypes";

export type AtmospherePuzzleInput = {
  edgeSharpnessDropsWithDistance: boolean;
  saturationDropsWithDistance: boolean;
  hueShiftsCoolerWithDistance: boolean;
};

export class AtmospherePuzzle extends Puzzle<AtmospherePuzzleInput> {
  constructor(id: string, stationId: string, rewardPetId: string) {
    super(
      id,
      stationId,
      "Depth Painting",
      "Apply atmospheric perspective for distant forms.",
      PuzzleType.LANDSCAPE_DEPTH,
      rewardPetId,
      (input) =>
        input.edgeSharpnessDropsWithDistance &&
        input.saturationDropsWithDistance &&
        input.hueShiftsCoolerWithDistance,
      PuzzleState.Locked,
    );
  }
}
