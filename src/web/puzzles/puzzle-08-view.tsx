import React from "react";
import { createRoot } from "react-dom/client";
import { PuzzleSlider } from "./muiPuzzleControls";
import { PuzzleRenderDeps, PuzzleRenderer } from "./types";

type Puzzle08State = {
  h1: number;
  h2: number;
  h3: number;
};

type Puzzle08ViewProps = {
  persistedState: Puzzle08State;
};

function normalizeHue(h: number): number {
  return ((h % 360) + 360) % 360;
}

function triadInfo(state: Puzzle08State): { gaps: number[]; good: boolean } {
  const values = [state.h1, state.h2, state.h3].map(normalizeHue).sort((a, b) => a - b);
  const gaps = [
    (values[1] - values[0] + 360) % 360,
    (values[2] - values[1] + 360) % 360,
    (values[0] + 360 - values[2]) % 360,
  ];
  const tolerance = 15;
  const good = gaps.every((gap) => Math.abs(gap - 120) <= tolerance);
  return { gaps, good };
}

function Puzzle08View({ persistedState }: Puzzle08ViewProps): React.ReactElement {
  const [localState, setLocalState] = React.useState<Puzzle08State>({ ...persistedState });

  const setHue = (key: keyof Puzzle08State, value: number): void => {
    setLocalState((prev) => {
      const next = { ...prev, [key]: value };
      Object.assign(persistedState, next);
      return next;
    });
  };

  const { gaps, good } = triadInfo(localState);

  const renderHueRow = (label: string, key: keyof Puzzle08State): React.ReactElement => (
    <div className="mini-row">
      <div className="hue-row">
        <span>{label}: {Math.round(localState[key])}deg</span>
        <span className="hue-swatch" style={{ background: `hsl(${localState[key]}, 85%, 55%)` }} />
      </div>
      <PuzzleSlider label={label} value={localState[key]} min={0} max={360} step={1} showLabel={false} onChange={(v) => setHue(key, v)} />
    </div>
  );

  return (
    <>
      <div className="mini-label">Aim for roughly equal 120deg spacing between all three hue markers.</div>
      {renderHueRow("Hue 1", "h1")}
      {renderHueRow("Hue 2", "h2")}
      {renderHueRow("Hue 3", "h3")}

      <div className="triad-strip">
        {[localState.h1, localState.h2, localState.h3].map((hue, index) => (
          <div
            key={index}
            className="triad-mark"
            style={{
              left: `${(normalizeHue(hue) / 360) * 100}%`,
              background: `hsl(${hue}, 85%, 55%)`,
            }}
          />
        ))}
      </div>

      <div className="mini-label">
        Gaps: {Math.round(gaps[0])}deg / {Math.round(gaps[1])}deg / {Math.round(gaps[2])}deg{good ? "  triad aligned" : ""}
      </div>
    </>
  );
}

export const renderPuzzle08: PuzzleRenderer = (deps: PuzzleRenderDeps) => {
  const {
    zone,
    wrapper,
    puzzleId,
    ensureState,
    addCheckButton,
  } = deps;

  const state = ensureState<Puzzle08State>(puzzleId, { h1: 0, h2: 120, h3: 240 });

  createRoot(zone).render(<Puzzle08View persistedState={state} />);

  addCheckButton(wrapper, puzzleId, () => ({ hueAngles: [state.h1, state.h2, state.h3] }));
};
