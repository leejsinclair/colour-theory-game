import React from "react";
import { createRoot } from "react-dom/client";
import { PuzzleRenderDeps, PuzzleRenderer } from "./types";

type ColorName = "red" | "orange" | "yellow" | "green" | "blue" | "purple";

type Puzzle07State = {
  a: ColorName;
  b: ColorName;
  rounds: number;
  streak: number;
};

type Puzzle07ViewProps = {
  persistedState: Puzzle07State;
};

const defs: Array<{ name: ColorName; hue: number }> = [
  { name: "red", hue: 8 },
  { name: "orange", hue: 28 },
  { name: "yellow", hue: 52 },
  { name: "green", hue: 130 },
  { name: "blue", hue: 220 },
  { name: "purple", hue: 282 },
];

const comp: Record<ColorName, ColorName> = {
  red: "green",
  green: "red",
  blue: "orange",
  orange: "blue",
  yellow: "purple",
  purple: "yellow",
};

function Puzzle07View({ persistedState }: Puzzle07ViewProps): React.ReactElement {
  const [localState, setLocalState] = React.useState<Puzzle07State>({ ...persistedState });
  const [resultText, setResultText] = React.useState("Build intuition: switch targets and test quick matches.");

  const updateState = (updater: (prev: Puzzle07State) => Puzzle07State): void => {
    setLocalState((prev) => {
      const next = updater(prev);
      Object.assign(persistedState, next);
      return next;
    });
  };

  return (
    <>
      <div className="chip-row">
        {defs.map((def) => (
          <button
            key={`target-${def.name}`}
            className="chip-btn"
            style={{ background: `hsl(${def.hue}, 78%, 54%)` }}
            onClick={() => updateState((prev) => ({ ...prev, a: def.name }))}
          >
            Target {def.name}
          </button>
        ))}
      </div>

      <div className="mini-label">Target: pick the complement for {localState.a.toUpperCase()}</div>

      <div className="chip-row">
        {defs.map((def) => (
          <button
            key={`pick-${def.name}`}
            className="chip-btn"
            style={{ background: `hsl(${def.hue}, 78%, 54%)` }}
            onClick={() => {
              updateState((prev) => {
                const rounds = prev.rounds + 1;
                const correct = comp[prev.a] === def.name;
                const streak = correct ? prev.streak + 1 : 0;
                return { ...prev, b: def.name, rounds, streak };
              });
              const correct = comp[localState.a] === def.name;
              setResultText(
                correct
                  ? `Correct complement! Streak ${correct ? localState.streak + 1 : 0}`
                  : `Not opposite on the wheel. ${localState.a} pairs with ${comp[localState.a]}.`,
              );
            }}
          >
            {def.name}
          </button>
        ))}
      </div>

      <div className="mini-label">{resultText}</div>
    </>
  );
}

export const renderPuzzle07: PuzzleRenderer = (deps: PuzzleRenderDeps) => {
  const {
    zone,
    wrapper,
    puzzleId,
    ensureState,
    addCheckButton,
  } = deps;

  const state = ensureState<Puzzle07State>(puzzleId, { a: "red", b: "green", rounds: 0, streak: 0 });

  createRoot(zone).render(<Puzzle07View persistedState={state} />);

  addCheckButton(wrapper, puzzleId, () => ({ selectedColorA: state.a, selectedColorB: state.b }));
};
