import React from "react";
import { createRoot } from "react-dom/client";
import { PuzzleSlider } from "./muiPuzzleControls";
import { PuzzleRenderDeps, PuzzleRenderer } from "./types";

type Puzzle11State = {
  surroundHue: number;
  surroundSat: number;
  surroundLight: number;
};

type Puzzle11ViewProps = {
  persistedState: Puzzle11State;
  circularHueDistance: (a: number, b: number) => number;
};

function Puzzle11View({ persistedState, circularHueDistance }: Puzzle11ViewProps): React.ReactElement {
  const [localState, setLocalState] = React.useState<Puzzle11State>({ ...persistedState });

  const setValue = (key: keyof Puzzle11State, value: number): void => {
    setLocalState((prev) => {
      const next = { ...prev, [key]: value };
      Object.assign(persistedState, next);
      return next;
    });
  };

  const orangeDistance = circularHueDistance(localState.surroundHue, 30);
  const orangeStrength = Math.max(0, 1 - orangeDistance / 45) * (localState.surroundSat / 100);

  const slider = (label: string, key: keyof Puzzle11State, min: number, max: number, step: number): React.ReactElement => (
    <PuzzleSlider label={label} value={localState[key]} min={min} max={max} step={step} onChange={(v) => setValue(key, v)} />
  );

  return (
    <>
      <div className="illusion-board single">
        <div className="illusion-panel" style={{ background: `hsl(${localState.surroundHue}, ${localState.surroundSat}%, ${localState.surroundLight}%)` }}>
          <div className="illusion-square" style={{ background: "#9d9d9d" }} />
        </div>
      </div>

      <div className="mini-label">
        {orangeStrength >= 0.6
          ? "Grey appears cooler/blue from warm orange context ✓"
          : "Push toward a stronger orange surround to induce blue shift"}
      </div>

      {slider("Surround hue", "surroundHue", 0, 360, 1)}
      {slider("Surround saturation", "surroundSat", 0, 100, 1)}
      {slider("Surround lightness", "surroundLight", 20, 80, 1)}
    </>
  );
}

export const renderPuzzle11: PuzzleRenderer = (deps: PuzzleRenderDeps) => {
  const {
    zone,
    wrapper,
    puzzleId,
    ensureState,
    addCheckButton,
    circularHueDistance,
  } = deps;

  const state = ensureState<Puzzle11State>(puzzleId, { surroundHue: 30, surroundSat: 70, surroundLight: 50 });

  createRoot(zone).render(<Puzzle11View persistedState={state} circularHueDistance={circularHueDistance} />);

  addCheckButton(wrapper, puzzleId, () => ({
    usedOrangeSurroundings: circularHueDistance(state.surroundHue, 30) <= 20 && state.surroundSat >= 55,
    greySquareChanged: false,
  }));
};
