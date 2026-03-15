import React from "react";
import { createRoot } from "react-dom/client";
import { PuzzleCheckbox, PuzzleSlider } from "./muiPuzzleControls";
import { PuzzleRenderDeps, PuzzleRenderer } from "./types";

type Puzzle16State = {
  phthalo: boolean;
  hansa: boolean;
  redContam: number;
  purpleContam: number;
};

type Puzzle16ViewProps = {
  persistedState: Puzzle16State;
};

function computeMudLevel(state: Puzzle16State): number {
  return Math.min(1, (state.redContam + state.purpleContam) / 2);
}

function Puzzle16View({ persistedState }: Puzzle16ViewProps): React.ReactElement {
  const [localState, setLocalState] = React.useState<Puzzle16State>({ ...persistedState });

  const updateState = (updater: (prev: Puzzle16State) => Puzzle16State): void => {
    setLocalState((prev) => {
      const next = updater(prev);
      Object.assign(persistedState, next);
      return next;
    });
  };

  const mud = computeMudLevel(localState);

  let swatch = "#f0ede8";
  let label = "No pigments selected";
  if (localState.phthalo && localState.hansa && mud <= 0.25) {
    const sat = Math.round(70 - mud * 100);
    swatch = `hsl(115, ${sat}%, 38%)`;
    label = "Vibrant green! ✓";
  } else if (localState.phthalo && localState.hansa) {
    const sat = Math.max(5, 30 - Math.round((mud - 0.25) * 60));
    swatch = `hsl(80, ${sat}%, 32%)`;
    label = "Muddy green - reduce contaminant colors";
  } else if (localState.phthalo) {
    swatch = "#0077a3";
    label = "Phthalo Blue only";
  } else if (localState.hansa) {
    swatch = "#e8c820";
    label = "Hansa Yellow only";
  }

  return (
    <>
      <PuzzleCheckbox label="Add Phthalo Blue" checked={localState.phthalo} onChange={(checked) => updateState((prev) => ({ ...prev, phthalo: checked }))} />

      <PuzzleCheckbox label="Add Hansa Yellow" checked={localState.hansa} onChange={(checked) => updateState((prev) => ({ ...prev, hansa: checked }))} />

      <PuzzleSlider
        label="Red contaminant"
        value={localState.redContam}
        min={0}
        max={1}
        step={0.01}
        onChange={(value) => updateState((prev) => ({ ...prev, redContam: value }))}
      />

      <PuzzleSlider
        label="Purple contaminant"
        value={localState.purpleContam}
        min={0}
        max={1}
        step={0.01}
        onChange={(value) => updateState((prev) => ({ ...prev, purpleContam: value }))}
      />

      <div className="color-preview-row">
        <div className="color-preview-swatch" style={{ background: swatch }} />
        <div className="color-preview-label">{label}</div>
      </div>

      <div className="mini-label">Derived mud: {(mud * 100).toFixed(0)}%</div>
    </>
  );
}

export const renderPuzzle16: PuzzleRenderer = (deps: PuzzleRenderDeps) => {
  const {
    zone,
    wrapper,
    puzzleId,
    ensureState,
    addCheckButton,
  } = deps;

  const state = ensureState<Puzzle16State>(puzzleId, {
    phthalo: false,
    hansa: false,
    redContam: 0.0,
    purpleContam: 0.0,
  });

  createRoot(zone).render(<Puzzle16View persistedState={state} />);

  addCheckButton(wrapper, puzzleId, () => ({
    pigments: [state.phthalo ? "phthalo blue" : "", state.hansa ? "hansa yellow" : ""].filter(Boolean),
    mudLevel: computeMudLevel(state),
  }));
};
