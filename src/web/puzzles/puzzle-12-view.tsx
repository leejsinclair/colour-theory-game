/**
 * Puzzle 12 – Neutral Support & Accent Pop
 *
 * Players adjust the number of neutral colour fields, their lightness, and the
 * accent colour's hue and saturation. A small accent chip sits on the neutral
 * fields; the contrast metric rises with accent saturation. Teaches how
 * desaturated supporting colours make a focal accent "pop" and demonstrates
 * the supporting role of neutrals in colour composition.
 */
import React from "react";
import { createRoot } from "react-dom/client";
import { PuzzleSlider } from "./muiPuzzleControls";
import { PuzzleRenderDeps, PuzzleRenderer } from "./types";

type Puzzle12State = {
  neutralCount: number;
  contrast: number;
  accentHue: number;
  accentSat: number;
  neutralLight: number;
};

type Puzzle12ViewProps = {
  persistedState: Puzzle12State;
};

function Puzzle12View({ persistedState }: Puzzle12ViewProps): React.ReactElement {
  const [localState, setLocalState] = React.useState<Puzzle12State>({ ...persistedState });

  const updateState = (updater: (prev: Puzzle12State) => Puzzle12State): void => {
    setLocalState((prev) => {
      const next = updater(prev);
      Object.assign(persistedState, next);
      return next;
    });
  };

  const slider = (label: string, key: keyof Puzzle12State, min: number, max: number, step: number): React.ReactElement => (
    <PuzzleSlider
      label={label}
      value={localState[key] as number}
      min={min}
      max={max}
      step={step}
      onChange={(value) => {
        updateState((prev) => {
          const next = { ...prev, [key]: value };
          if (key === "accentSat") {
            next.contrast = Math.min(1, 0.25 + (value / 100) * 0.75);
          }
          return next;
        });
      }}
    />
  );

  return (
    <>
      <div className="neutral-hero-board">
        <div className="neutral-field" style={{ background: `hsl(30, 12%, ${localState.neutralLight}%)` }}>
          <div className="accent-chip" style={{ background: `hsl(${localState.accentHue}, ${localState.accentSat}%, 50%)` }} />
        </div>
      </div>

      <div className="mini-label">Neutral fields: {localState.neutralCount} | Accent pop: {(localState.contrast * 100).toFixed(0)}%</div>

      {slider("Neutral mixes count", "neutralCount", 0, 5, 1)}
      {slider("Neutral lightness", "neutralLight", 20, 80, 1)}
      {slider("Accent hue", "accentHue", 0, 360, 1)}
      {slider("Accent saturation", "accentSat", 0, 100, 1)}
      {slider("Accent contrast", "contrast", 0, 1, 0.01)}
    </>
  );
}

export const renderPuzzle12: PuzzleRenderer = (deps: PuzzleRenderDeps) => {
  const {
    zone,
    wrapper,
    puzzleId,
    ensureState,
    addCheckButton,
  } = deps;

  const state = ensureState<Puzzle12State>(puzzleId, {
    neutralCount: 1,
    contrast: 0.4,
    accentHue: 8,
    accentSat: 80,
    neutralLight: 55,
  });

  createRoot(zone).render(<Puzzle12View persistedState={state} />);

  addCheckButton(wrapper, puzzleId, () => ({ neutralCount: state.neutralCount, accentContrast: state.contrast }));
};
