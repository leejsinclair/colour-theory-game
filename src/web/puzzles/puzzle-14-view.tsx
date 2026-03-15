import React from "react";
import { createRoot } from "react-dom/client";
import { PuzzleActionButton, PuzzleSlider } from "./muiPuzzleControls";
import { PuzzleRenderDeps, PuzzleRenderer } from "./types";

type Puzzle14State = {
  scatter: number;
  haze: number;
};

type Puzzle14ViewProps = {
  persistedState: Puzzle14State;
};

function Puzzle14View({ persistedState }: Puzzle14ViewProps): React.ReactElement {
  const [localState, setLocalState] = React.useState<Puzzle14State>({ ...persistedState });

  const setValue = (key: keyof Puzzle14State, value: number): void => {
    setLocalState((prev) => {
      const next = { ...prev, [key]: value };
      Object.assign(persistedState, next);
      return next;
    });
  };

  const skyHue = Math.round(200 + localState.scatter * 24);
  const shiftBlue = localState.scatter >= 0.6;

  const slider = (label: string, key: keyof Puzzle14State): React.ReactElement => (
    <PuzzleSlider label={label} value={localState[key]} min={0} max={1} step={0.01} onChange={(v) => setValue(key, v)} />
  );

  return (
    <>
      <div className="scatter-board">
        <div
          className="scatter-sky"
          style={{
            background: `linear-gradient(180deg, hsl(${skyHue}, ${45 + localState.scatter * 30}%, 68%), hsl(${skyHue + 14}, ${30 + localState.scatter * 25}%, 52%))`,
          }}
        >
          <div
            className="scatter-ridge far"
            style={{
              background: `hsl(${198 + localState.scatter * 18}, ${28 + localState.haze * 25}%, ${54 + localState.haze * 18}%)`,
              opacity: `${0.55 + localState.haze * 0.4}`,
            }}
          />
          <div
            className="scatter-ridge near"
            style={{
              background: `hsl(125, ${48 - localState.haze * 18}%, ${34 + localState.haze * 8}%)`,
            }}
          />
        </div>
      </div>

      <div className="mini-label">
        {shiftBlue
          ? "Far ridge shifts blue with stronger scattering ✓"
          : "Increase scattering to push far forms toward blue."}
      </div>

      {slider("Scattering strength", "scatter")}
      {slider("Atmospheric haze", "haze")}

      <PuzzleActionButton
        onClick={() => {
          setLocalState((prev) => {
            const next = {
              scatter: Math.min(1, prev.scatter + 0.14),
              haze: Math.min(1, prev.haze + 0.12),
            };
            Object.assign(persistedState, next);
            return next;
          });
        }}
      >
        Add Blue Haze Burst
      </PuzzleActionButton>
    </>
  );
}

export const renderPuzzle14: PuzzleRenderer = (deps: PuzzleRenderDeps) => {
  const {
    zone,
    wrapper,
    puzzleId,
    ensureState,
    addCheckButton,
  } = deps;

  const state = ensureState<Puzzle14State>(puzzleId, { scatter: 0.2, haze: 0.2 });

  createRoot(zone).render(<Puzzle14View persistedState={state} />);

  addCheckButton(wrapper, puzzleId, () => ({
    farObjectsShiftBlue: state.scatter >= 0.6,
    scatteringStrength: state.scatter,
  }));
};
