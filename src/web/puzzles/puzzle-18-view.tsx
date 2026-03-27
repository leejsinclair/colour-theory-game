/**
 * Puzzle 18 – Art Station Mini-Game
 *
 * A thin React wrapper that mounts an external imperative mini-game via
 * renderArtStationMiniGame. The mini-game is a colour-mixing drawing
 * experience rendered outside the React tree. This component manages the
 * lifecycle (mount/unmount) and passes puzzle state callbacks through to
 * the external renderer.
 */
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
