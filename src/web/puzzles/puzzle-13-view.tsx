/**
 * Puzzle 13 – Atmospheric / Aerial Perspective
 *
 * Three mountain silhouette layers simulate depth. Players adjust edge
 * softening (blur), saturation reduction, and cool hue shift to push distant
 * mountains further back in space. All three depth cues must reach their
 * target thresholds (≥0.45 each) to solve the puzzle. Teaches that soft edges,
 * muted colour, and cooler temperature signal distance in landscape painting.
 */
import React from "react";
import { createRoot } from "react-dom/client";
import { PuzzleSlider } from "./muiPuzzleControls";
import { PuzzleRenderDeps, PuzzleRenderer } from "./types";

type Puzzle13State = {
  edgeDrop: number;
  satDrop: number;
  coolShift: number;
};

type Puzzle13ViewProps = {
  persistedState: Puzzle13State;
};

function Puzzle13View({ persistedState }: Puzzle13ViewProps): React.ReactElement {
  const [localState, setLocalState] = React.useState<Puzzle13State>({ ...persistedState });

  const setValue = (key: keyof Puzzle13State, value: number): void => {
    setLocalState((prev) => {
      const next = { ...prev, [key]: value };
      Object.assign(persistedState, next);
      return next;
    });
  };

  const nearHue = 120;
  const midHue = Math.round(nearHue + localState.coolShift * 30);
  const farHue = Math.round(nearHue + localState.coolShift * 65);
  const edgesOk = localState.edgeDrop >= 0.45;
  const satOk = localState.satDrop >= 0.45;
  const coolOk = localState.coolShift >= 0.45;

  const slider = (label: string, key: keyof Puzzle13State): React.ReactElement => (
    <PuzzleSlider label={label} value={localState[key]} min={0} max={1} step={0.01} onChange={(v) => setValue(key, v)} />
  );

  return (
    <>
      <div className="depth-scene">
        <div
          className="mountain far"
          style={{
            background: `hsl(${farHue}, ${Math.round(54 - localState.satDrop * 55)}%, 56%)`,
            filter: `blur(${(localState.edgeDrop * 8).toFixed(1)}px)`,
          }}
        />
        <div
          className="mountain mid"
          style={{
            background: `hsl(${midHue}, ${Math.round(62 - localState.satDrop * 40)}%, 43%)`,
            filter: `blur(${(localState.edgeDrop * 4).toFixed(1)}px)`,
          }}
        />
        <div
          className="mountain near"
          style={{
            background: `hsl(${nearHue}, ${Math.round(70 - localState.satDrop * 20)}%, 36%)`,
            filter: "none",
          }}
        />
      </div>

      <div className="mini-label">
        Depth cues: edges {edgesOk ? "✓" : "..."} | saturation {satOk ? "✓" : "..."} | cooler distance {coolOk ? "✓" : "..."}
      </div>

      {slider("Edge softening", "edgeDrop")}
      {slider("Saturation drop", "satDrop")}
      {slider("Cool shift", "coolShift")}
    </>
  );
}

export const renderPuzzle13: PuzzleRenderer = (deps: PuzzleRenderDeps) => {
  const {
    zone,
    wrapper,
    puzzleId,
    ensureState,
    addCheckButton,
  } = deps;

  const state = ensureState<Puzzle13State>(puzzleId, { edgeDrop: 0.15, satDrop: 0.2, coolShift: 0.15 });

  createRoot(zone).render(<Puzzle13View persistedState={state} />);

  addCheckButton(wrapper, puzzleId, () => ({
    edgeSharpnessDropsWithDistance: state.edgeDrop >= 0.45,
    saturationDropsWithDistance: state.satDrop >= 0.45,
    hueShiftsCoolerWithDistance: state.coolShift >= 0.45,
  }));
};
