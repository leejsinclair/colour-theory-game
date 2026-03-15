import React from "react";
import { createRoot } from "react-dom/client";
import { PuzzleSlider } from "./muiPuzzleControls";
import { PuzzleRenderDeps, PuzzleRenderer } from "./types";

type Pigment = "red" | "orange" | "yellow" | "green" | "blue" | "purple";

type Puzzle03State = {
  a: Pigment;
  b: Pigment;
  luminousShadow: boolean;
  gloss: number;
};

type Puzzle03ViewProps = {
  persistedState: Puzzle03State;
};

const chipHue: Record<Pigment, number> = {
  red: 8,
  orange: 28,
  yellow: 52,
  green: 132,
  blue: 220,
  purple: 282,
};

const colors: Pigment[] = ["red", "orange", "yellow", "green", "blue", "purple"];

function isComplement(a: Pigment, b: Pigment): boolean {
  const pair = [a, b].sort().join("+");
  return ["blue+orange", "green+red", "purple+yellow"].includes(pair);
}

function Puzzle03View({ persistedState }: Puzzle03ViewProps): React.ReactElement {
  const [localState, setLocalState] = React.useState<Puzzle03State>({ ...persistedState });

  const updateState = (updater: (prev: Puzzle03State) => Puzzle03State): void => {
    setLocalState((prev) => {
      const next = updater(prev);
      Object.assign(persistedState, next);
      return next;
    });
  };

  const h1 = chipHue[localState.a] ?? 0;
  const h2 = chipHue[localState.b] ?? 0;
  const hue = Math.round((h1 + h2) / 2);
  const complement = isComplement(localState.a, localState.b);
  const sat = complement ? Math.max(8, Math.round(20 + localState.gloss * 20)) : Math.round(38 + localState.gloss * 15);
  const light = complement ? Math.round(18 + localState.gloss * 12) : Math.round(24 + localState.gloss * 8);
  const luminousShadow = complement && localState.gloss >= 0.55;

  if (persistedState.luminousShadow !== luminousShadow) {
    persistedState.luminousShadow = luminousShadow;
  }

  const feedback = luminousShadow
    ? "Luminous chromatic black achieved ✓"
    : complement
      ? "Add a touch of gloss to lift the shadow from flat to luminous"
      : "These pigments neutralize poorly. Try a true complement pair.";

  return (
    <>
      <div className="mix-bowl">
        <div
          className="mix-bowl-swatch"
          style={{
            background: `radial-gradient(circle at 35% 30%, rgba(255,255,255,${0.16 + localState.gloss * 0.4}), transparent 42%), hsl(${hue}, ${sat}%, ${light}%)`,
          }}
        />
      </div>

      <div className="chip-grid">
        <div className="mini-label">Pigment A: {localState.a}</div>
        <div className="chip-row">
          {colors.map((name) => (
            <button
              key={`a-${name}`}
              className="chip-btn"
              style={{ background: `hsl(${chipHue[name]}, 80%, 52%)` }}
              onClick={() => updateState((prev) => ({ ...prev, a: name }))}
            >
              A: {name}
            </button>
          ))}
        </div>

        <div className="mini-label">Pigment B: {localState.b}</div>
        <div className="chip-row">
          {colors.map((name) => (
            <button
              key={`b-${name}`}
              className="chip-btn"
              style={{ background: `hsl(${chipHue[name]}, 80%, 52%)` }}
              onClick={() => updateState((prev) => ({ ...prev, b: name }))}
            >
              B: {name}
            </button>
          ))}
        </div>
      </div>

      <PuzzleSlider
        label="Shadow gloss"
        value={localState.gloss}
        min={0}
        max={1}
        step={0.01}
        onChange={(value) => {
          updateState((prev) => ({
            ...prev,
            gloss: value,
            luminousShadow: isComplement(prev.a, prev.b) && value >= 0.55,
          }));
        }}
      />

      <div className="mini-label">{feedback}</div>
    </>
  );
}

export const renderPuzzle03: PuzzleRenderer = (deps: PuzzleRenderDeps) => {
  const {
    zone,
    wrapper,
    puzzleId,
    ensureState,
    addCheckButton,
  } = deps;

  const state = ensureState<Puzzle03State>(puzzleId, {
    a: "blue",
    b: "orange",
    luminousShadow: false,
    gloss: 0.3,
  });

  createRoot(zone).render(<Puzzle03View persistedState={state} />);

  addCheckButton(wrapper, puzzleId, () => ({
    pigments: [state.a, state.b],
    luminousShadow: state.luminousShadow,
  }));
};
