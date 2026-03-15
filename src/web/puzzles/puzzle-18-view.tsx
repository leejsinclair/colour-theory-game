import React from "react";
import { createRoot } from "react-dom/client";
import { PuzzleRenderDeps, PuzzleRenderer } from "./types";

type Puzzle18ViewProps = {
  zone: HTMLDivElement;
  wrapper: HTMLDivElement;
  puzzleId: string;
  state: string;
  renderArtStationMiniGame: PuzzleRenderDeps["renderArtStationMiniGame"];
};

function Puzzle18View({ zone, wrapper, puzzleId, state, renderArtStationMiniGame }: Puzzle18ViewProps): null {
  React.useEffect(() => {
    renderArtStationMiniGame(zone, wrapper, puzzleId, state);
  }, [zone, wrapper, puzzleId, state, renderArtStationMiniGame]);

  return null;
}

export const renderPuzzle18: PuzzleRenderer = (deps: PuzzleRenderDeps) => {
  const {
    zone,
    wrapper,
    puzzleId,
    state,
    renderArtStationMiniGame,
    appendWrapper,
  } = deps;

  createRoot(zone).render(
    <Puzzle18View
      zone={zone}
      wrapper={wrapper}
      puzzleId={puzzleId}
      state={state}
      renderArtStationMiniGame={renderArtStationMiniGame}
    />,
  );
  appendWrapper();
  return { appended: true };
};
