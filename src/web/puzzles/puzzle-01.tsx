/**
 * Puzzle 01 – Additive Color Mixing (RGB Light)
 *
 * Players toggle red, green, and blue light beams and align their overlap zone
 * to produce white light. Demonstrates that combining all three primary light
 * wavelengths additively creates white, teaching the fundamentals of RGB colour
 * mixing as used in screens and stage lighting.
 */
import React from "react";
import { createRoot } from "react-dom/client";
import { PuzzleRenderDeps, PuzzleRenderer } from "./types";

type Puzzle01State = {
  red: boolean;
  green: boolean;
  blue: boolean;
  overlap: boolean;
};

type BeamKey = keyof Puzzle01State;

type BeamDef = {
  key: BeamKey;
  label: string;
};

const beamDefs: BeamDef[] = [
  { key: "red", label: "Red Beam" },
  { key: "green", label: "Green Beam" },
  { key: "blue", label: "Blue Beam" },
  { key: "overlap", label: "Align Overlap" },
];

type Puzzle01ViewProps = {
  persistedState: Puzzle01State;
};

function Puzzle01View({ persistedState }: Puzzle01ViewProps): React.ReactElement {
  const [localState, setLocalState] = React.useState<Puzzle01State>({ ...persistedState });

  const toggleBeam = (key: BeamKey): void => {
    setLocalState((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      Object.assign(persistedState, next);
      return next;
    });
  };

  const r = localState.red && localState.overlap ? 255 : 0;
  const g = localState.green && localState.overlap ? 255 : 0;
  const b = localState.blue && localState.overlap ? 255 : 0;
  const parts = [localState.red ? "R" : "", localState.green ? "G" : "", localState.blue ? "B" : ""].filter(Boolean);

  const previewLabel = !localState.overlap
    ? parts.length > 0
      ? `${parts.join("+")} beams - align overlap to mix`
      : "No beams active"
    : parts.length === 3
      ? "White light! \u2713 All beams aligned"
      : parts.join("+") || "No beams";

  return (
    <>
      <div className="beam-btns">
        {beamDefs.map(({ key, label }) => (
          <button
            key={key}
            className={`beam-btn${localState[key] ? " --on" : ""}`}
            data-beam={key}
            onClick={() => toggleBeam(key)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="color-preview-row">
        <div
          className="color-preview-swatch"
          style={{ background: localState.overlap ? `rgb(${r}, ${g}, ${b})` : "#1a1a2e" }}
        />
        <div className="color-preview-label">{previewLabel}</div>
      </div>
    </>
  );
}

export const renderPuzzle01: PuzzleRenderer = (deps: PuzzleRenderDeps) => {
  const {
    zone,
    wrapper,
    puzzleId,
    ensureState,
    addCheckButton,
  } = deps;

  const state = ensureState<Puzzle01State>(puzzleId, {
    red: false,
    green: false,
    blue: false,
    overlap: false,
  });

  createRoot(zone).render(<Puzzle01View persistedState={state} />);

  addCheckButton(wrapper, puzzleId, () => ({
    redBeam: state.red,
    greenBeam: state.green,
    blueBeam: state.blue,
    overlap: state.overlap,
  }));
};
