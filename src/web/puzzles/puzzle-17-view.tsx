import React from "react";
import { createRoot } from "react-dom/client";
import { PuzzleActionButton } from "./muiPuzzleControls";
import { PuzzleRenderDeps, PuzzleRenderer } from "./types";

type Puzzle17State = {
  complementPairs: number;
  mud: number;
  recipe: string[];
};

type Puzzle17ViewProps = {
  persistedState: Puzzle17State;
};

function isMuddy(state: Puzzle17State): boolean {
  return state.mud >= 0.58 || state.complementPairs > 1;
}

function Puzzle17View({ persistedState }: Puzzle17ViewProps): React.ReactElement {
  const [localState, setLocalState] = React.useState<Puzzle17State>({
    complementPairs: persistedState.complementPairs,
    mud: persistedState.mud,
    recipe: [...persistedState.recipe],
  });

  const updateState = (updater: (prev: Puzzle17State) => Puzzle17State): void => {
    setLocalState((prev) => {
      const next = updater(prev);
      persistedState.complementPairs = next.complementPairs;
      persistedState.mud = next.mud;
      persistedState.recipe = [...next.recipe];
      return next;
    });
  };

  const mud = Math.max(0, Math.min(1, localState.mud));
  const muddy = isMuddy(localState);
  const hue = Math.round(118 - mud * 72);
  const sat = Math.round(58 - mud * 34);
  const light = Math.round(46 - mud * 20);

  const appendRecipe = (recipe: string[], item: string): string[] => {
    const next = [...recipe, item];
    if (next.length > 6) {
      next.shift();
    }
    return next;
  };

  return (
    <>
      <div className="mud-monster-board">
        <div
          className="mud-monster"
          style={{
            background: `radial-gradient(circle at 35% 28%, rgba(255,255,255,0.35), transparent 40%), hsl(${hue}, ${sat}%, ${light}%)`,
          }}
        >
          {muddy ? "(x_x)" : mud > 0.35 ? "(o_o)" : "(^_^)"}
        </div>

        <div className="coverage-wrap">
          <div className="coverage-bar-track">
            <div className={`coverage-bar-fill${mud >= 0.4 ? " --danger" : ""}`} style={{ width: `${Math.round(mud * 100)}%` }} />
          </div>
          <div className="coverage-bar-label">Mud level: {Math.round(mud * 100)}%</div>
        </div>

        <div className="mini-label">
          {muddy
            ? `Too many complement clashes (${localState.complementPairs}). Keep clashes to 1 or less.`
            : `Stable mix. Complement clashes: ${localState.complementPairs}/1 allowed.`}
        </div>

        <div className="mud-log">
          {localState.recipe.length > 0
            ? `Recipe: ${localState.recipe.join(" -> ")}`
            : "Recipe: start with clean green strokes."}
        </div>
      </div>

      <div className="mud-controls">
        <PuzzleActionButton
          onClick={() => {
            updateState((prev) => ({
              ...prev,
              mud: Math.max(0, prev.mud - 0.12),
              recipe: appendRecipe(prev.recipe, "clean"),
            }));
          }}
        >
          Add clean green stroke
        </PuzzleActionButton>

        <PuzzleActionButton
          onClick={() => {
            updateState((prev) => ({
              ...prev,
              complementPairs: prev.complementPairs + 1,
              mud: Math.min(1, prev.mud + 0.22),
              recipe: appendRecipe(prev.recipe, "neutralizer"),
            }));
          }}
        >
          Add tiny complement neutralizer
        </PuzzleActionButton>

        <PuzzleActionButton
          onClick={() => {
            updateState((prev) => ({
              ...prev,
              complementPairs: prev.complementPairs + 1,
              mud: Math.min(1, prev.mud + 0.42),
              recipe: appendRecipe(prev.recipe, "overmix"),
            }));
          }}
        >
          Dump strong complement pair
        </PuzzleActionButton>

        <PuzzleActionButton
          onClick={() => {
            updateState(() => ({
              complementPairs: 0,
              mud: 0.15,
              recipe: [],
            }));
          }}
        >
          Reset Bowl
        </PuzzleActionButton>
      </div>
    </>
  );
}

export const renderPuzzle17: PuzzleRenderer = (deps: PuzzleRenderDeps) => {
  const {
    zone,
    wrapper,
    puzzleId,
    ensureState,
    addCheckButton,
  } = deps;

  const state = ensureState<Puzzle17State>(puzzleId, {
    complementPairs: 0,
    mud: 0.15,
    recipe: [],
  });

  createRoot(zone).render(<Puzzle17View persistedState={state} />);

  addCheckButton(wrapper, puzzleId, () => ({
    complementPairsAdded: state.complementPairs,
    muddyResult: isMuddy(state),
  }));
};
