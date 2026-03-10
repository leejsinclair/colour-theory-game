import { Puzzle } from "../entities/Puzzle";
import { PuzzleState, PuzzleType } from "../types/gameTypes";

export type RGBPuzzleInput = {
  redBeam: boolean;
  greenBeam: boolean;
  blueBeam: boolean;
  overlap: boolean;
};

export class RGBPuzzle extends Puzzle<RGBPuzzleInput> {
  constructor(id: string, stationId: string, rewardPetId: string) {
    super(
      id,
      stationId,
      "Create White Light",
      "Combine RGB light beams so they overlap and produce white.",
      PuzzleType.RGB_LIGHT,
      rewardPetId,
      (input) => input.redBeam && input.greenBeam && input.blueBeam && input.overlap,
      PuzzleState.Available,
    );
  }
}
