/**
 * Puzzle 10 – Simultaneous Contrast Illusion
 *
 * Two panels each display a central gray square on a differently-coloured
 * surround. Players adjust the hue, saturation, and lightness of each surround
 * to minimise the perceived difference between the two grays (target ≤5%).
 * Demonstrates how a surround colour shifts the apparent tone and hue of a
 * neutral, illustrating the simultaneous contrast effect.
 */
import React from "react";
import { createRoot } from "react-dom/client";
import { PuzzleActionButton, PuzzleSlider } from "./muiPuzzleControls";
import { PuzzleRenderDeps, PuzzleRenderer } from "./types";

type Puzzle10State = {
  leftHue: number;
  rightHue: number;
  leftSat: number;
  rightSat: number;
  leftLight: number;
  rightLight: number;
  adjusted: boolean;
};

type Puzzle10ViewProps = {
  persistedState: Puzzle10State;
  circularHueDistance: (a: number, b: number) => number;
};

function estimatePerceivedDifference(state: Puzzle10State, circularHueDistance: (a: number, b: number) => number): number {
  const hueDist = circularHueDistance(state.leftHue, state.rightHue) / 180;
  const satAvg = (state.leftSat + state.rightSat) / 200;
  const lightDist = Math.abs(state.leftLight - state.rightLight) / 100;
  const satDist = Math.abs(state.leftSat - state.rightSat) / 100;
  return hueDist * satAvg * 0.55 + lightDist * 0.3 + satDist * 0.15;
}

function Puzzle10View({ persistedState, circularHueDistance }: Puzzle10ViewProps): React.ReactElement {
  const [localState, setLocalState] = React.useState<Puzzle10State>({ ...persistedState });

  const updateState = (updater: (prev: Puzzle10State) => Puzzle10State): void => {
    setLocalState((prev) => {
      const next = updater(prev);
      Object.assign(persistedState, next);
      return next;
    });
  };

  const diff = estimatePerceivedDifference(localState, circularHueDistance);

  const slider = (
    label: string,
    key: keyof Puzzle10State,
    min: number,
    max: number,
    step: number,
  ): React.ReactElement => (
    <PuzzleSlider
      label={label}
      value={localState[key] as number}
      min={min}
      max={max}
      step={step}
      onChange={(value) => updateState((prev) => ({ ...prev, [key]: value, adjusted: true }))}
    />
  );

  return (
    <>
      <div className="illusion-board">
        <div className="illusion-panel" style={{ background: `hsl(${localState.leftHue}, ${localState.leftSat}%, ${localState.leftLight}%)` }}>
          <div className="illusion-square" style={{ background: "#a6a6a6" }} />
        </div>
        <div className="illusion-panel" style={{ background: `hsl(${localState.rightHue}, ${localState.rightSat}%, ${localState.rightLight}%)` }}>
          <div className="illusion-square" style={{ background: "#a6a6a6" }} />
        </div>
      </div>

      <div className="mini-label">Estimated perception gap: {(diff * 100).toFixed(1)}% (lower is better, target {'<='} 5%)</div>

      {slider("Left surround hue", "leftHue", 0, 360, 1)}
      {slider("Right surround hue", "rightHue", 0, 360, 1)}
      {slider("Left saturation", "leftSat", 0, 100, 1)}
      {slider("Right saturation", "rightSat", 0, 100, 1)}
      {slider("Left lightness", "leftLight", 20, 80, 1)}
      {slider("Right lightness", "rightLight", 20, 80, 1)}

      <PuzzleActionButton
        onClick={() => {
          updateState((prev) => ({
            ...prev,
            rightLight: prev.leftLight,
            rightSat: prev.leftSat,
            adjusted: true,
          }));
        }}
      >
        Normalize Values
      </PuzzleActionButton>
    </>
  );
}

export const renderPuzzle10: PuzzleRenderer = (deps: PuzzleRenderDeps) => {
  const {
    zone,
    wrapper,
    puzzleId,
    ensureState,
    addCheckButton,
    circularHueDistance,
  } = deps;

  const state = ensureState<Puzzle10State>(puzzleId, {
    leftHue: 40,
    rightHue: 230,
    leftSat: 65,
    rightSat: 65,
    leftLight: 52,
    rightLight: 52,
    adjusted: false,
  });

  createRoot(zone).render(<Puzzle10View persistedState={state} circularHueDistance={circularHueDistance} />);

  addCheckButton(wrapper, puzzleId, () => ({
    perceivedDifference: estimatePerceivedDifference(state, circularHueDistance),
    backgroundsAdjusted: state.adjusted,
  }));
};
