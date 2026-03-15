import { PuzzleRenderDeps, PuzzleRenderer } from "./types";

export const renderPuzzle18: PuzzleRenderer = (deps: PuzzleRenderDeps) => {
  const {
    zone,
    wrapper,
    puzzleId,
    state,
    renderArtStationMiniGame,
    appendWrapper,
  } = deps;

    renderArtStationMiniGame(zone, wrapper, puzzleId, state);
    appendWrapper();
    return { appended: true };
};
