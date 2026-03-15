import React from "react";
import { createRoot } from "react-dom/client";
import { PuzzleSlider } from "./muiPuzzleControls";
import { PuzzleRenderDeps, PuzzleRenderer } from "./types";

type Puzzle02State = {
  c: number;
  m: number;
  y: number;
};

type Puzzle02ViewProps = {
  persistedState: Puzzle02State;
};

function Puzzle02View({ persistedState }: Puzzle02ViewProps): React.ReactElement {
  const [localState, setLocalState] = React.useState<Puzzle02State>({ ...persistedState });

  const setChannel = (channel: keyof Puzzle02State, value: number): void => {
    setLocalState((prev) => {
      const next = { ...prev, [channel]: value };
      Object.assign(persistedState, next);
      return next;
    });
  };

  const r = Math.round(255 * (1 - localState.c));
  const g = Math.round(255 * (1 - localState.m));
  const b = Math.round(255 * (1 - localState.y));

  return (
    <>
      <PuzzleSlider label="Cyan" value={localState.c} min={0} max={1} step={0.01} onChange={(v) => setChannel("c", v)} />
      <PuzzleSlider label="Magenta" value={localState.m} min={0} max={1} step={0.01} onChange={(v) => setChannel("m", v)} />
      <PuzzleSlider label="Yellow" value={localState.y} min={0} max={1} step={0.01} onChange={(v) => setChannel("y", v)} />

      <div className="color-preview-row">
        <div className="color-preview-swatch" style={{ background: `rgb(${r}, ${g}, ${b})` }} />
        <div className="color-preview-swatch" style={{ background: "rgb(153, 127, 204)" }} title="Target color" />
        <div className="color-preview-label">Current to Target</div>
      </div>
    </>
  );
}

export const renderPuzzle02: PuzzleRenderer = (deps: PuzzleRenderDeps) => {
  const {
    zone,
    wrapper,
    puzzleId,
    ensureState,
    addCheckButton,
  } = deps;

  const state = ensureState<Puzzle02State>(puzzleId, { c: 0.1, m: 0.1, y: 0.1 });

  createRoot(zone).render(<Puzzle02View persistedState={state} />);

  addCheckButton(wrapper, puzzleId, () => ({
    cyan: state.c,
    magenta: state.m,
    yellow: state.y,
    target: { cyan: 0.4, magenta: 0.5, yellow: 0.2 },
  }));
};
