import React from "react";
import { createRoot } from "react-dom/client";
import { PuzzleActionButton } from "./muiPuzzleControls";
import { PuzzleRenderDeps, PuzzleRenderer } from "./types";

type Puzzle05State = {
  tiles: number[];
  revealed: boolean;
};

type Puzzle05ViewProps = {
  persistedState: Puzzle05State;
};

function Puzzle05View({ persistedState }: Puzzle05ViewProps): React.ReactElement {
  const [localState, setLocalState] = React.useState<Puzzle05State>({
    tiles: [...persistedState.tiles],
    revealed: persistedState.revealed,
  });

  const updateState = (updater: (prev: Puzzle05State) => Puzzle05State): void => {
    setLocalState((prev) => {
      const next = updater(prev);
      persistedState.tiles = [...next.tiles];
      persistedState.revealed = next.revealed;
      return next;
    });
  };

  const ordered = localState.tiles.every((v, i, arr) => i === 0 || v >= arr[i - 1]);
  if (persistedState.revealed !== ordered) {
    persistedState.revealed = ordered;
  }

  const shift = (idx: number, direction: -1 | 1): void => {
    updateState((prev) => {
      const tiles = [...prev.tiles];
      const other = idx + direction;
      [tiles[other], tiles[idx]] = [tiles[idx], tiles[other]];
      const nowOrdered = tiles.every((v, i, arr) => i === 0 || v >= arr[i - 1]);
      return { tiles, revealed: nowOrdered };
    });
  };

  return (
    <>
      <div className="mini-label">Reorder tiles from darkest to lightest. Correct order reveals hidden icon.</div>

      <div className="ladder-wrap">
        {localState.tiles.map((value, idx) => {
          const tone = Math.round(value * 255);
          return (
            <div key={`${idx}-${value}`} className="ladder-tile" style={{ background: `rgb(${tone}, ${tone}, ${tone})` }}>
              <div className="ladder-controls">
                <PuzzleActionButton small disabled={idx === 0} onClick={() => shift(idx, -1)}>←</PuzzleActionButton>
                <PuzzleActionButton small disabled={idx === localState.tiles.length - 1} onClick={() => shift(idx, 1)}>→</PuzzleActionButton>
              </div>
            </div>
          );
        })}
      </div>

      <div className={`hidden-reveal${ordered ? " is-on" : ""}`}>
        {ordered ? "Hidden image revealed: ⟡" : "Hidden image is scrambled"}
      </div>
    </>
  );
}

export const renderPuzzle05: PuzzleRenderer = (deps: PuzzleRenderDeps) => {
  const {
    zone,
    wrapper,
    puzzleId,
    ensureState,
    addCheckButton,
    shuffleArray,
  } = deps;

  const state = ensureState<Puzzle05State>(puzzleId, {
    tiles: shuffleArray([0.05, 0.2, 0.4, 0.6, 0.8, 0.95]),
    revealed: false,
  });

  createRoot(zone).render(<Puzzle05View persistedState={state} />);

  addCheckButton(wrapper, puzzleId, () => ({
    orderedValues: state.tiles,
    hiddenImageRevealed: state.revealed,
  }));
};
