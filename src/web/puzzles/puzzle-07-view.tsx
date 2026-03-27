/**
 * Puzzle 07 – Complementary Colour Matching Game
 *
 * Players select a colour and then pick its complement from a set of options.
 * Correct complementary pairs are red↔green, blue↔orange, and yellow↔purple.
 * Incorrect guesses show immediate feedback. Builds intuitive knowledge of
 * colour-wheel opposites through gamified interaction.
 */
import React from "react";
import { createRoot } from "react-dom/client";
import { PuzzleRenderDeps, PuzzleRenderer } from "./types";

type ColorName = "red" | "orange" | "yellow" | "green" | "blue" | "purple";

type Puzzle07State = {
  a: ColorName;
  b: ColorName;
  rounds: number;
  streak: number;
  matchedPairs: Set<ColorName>;
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
  const [localState, setLocalState] = React.useState<Puzzle07State>({
    ...persistedState,
    matchedPairs: new Set(persistedState.matchedPairs instanceof Set ? persistedState.matchedPairs : []),
  });
  const [resultText, setResultText] = React.useState("Build intuition: select a color, then pick its complement.");

  const updateState = (updater: (prev: Puzzle07State) => Puzzle07State): void => {
    setLocalState((prev) => {
      const next = updater(prev);
      // Serialize matchedPairs to/from Set for persistence
      Object.assign(persistedState, {
        ...next,
        matchedPairs: Array.from(next.matchedPairs),
      });
      return next;
    });
  };

  const isMatched = (color: ColorName): boolean => localState.matchedPairs.has(color);
  const isTargetSelected = (color: ColorName): boolean => color === localState.a;
  const complementOf = (color: ColorName): ColorName => comp[color];

  const handleTargetClick = (color: ColorName): void => {
    if (!isMatched(color)) {
      updateState((prev) => ({ ...prev, a: color }));
      setResultText(`Selected ${color}. Now pick its complement!`);
    }
  };

  const handleComplementClick = (color: ColorName): void => {
    if (isMatched(color) || !localState.a) return;

    const correct = complementOf(localState.a) === color;
    updateState((prev) => {
      const rounds = prev.rounds + 1;
      const streak = correct ? prev.streak + 1 : 0;
      const newMatched = new Set(prev.matchedPairs);
      
      if (correct) {
        newMatched.add(prev.a);
        newMatched.add(color);
      }
      
      return { ...prev, b: color, rounds, streak, matchedPairs: newMatched };
    });

    if (correct) {
      setResultText(`✓ Perfect! ${localState.a} + ${color}. Streak: ${localState.streak + 1}`);
    } else {
      setResultText(`✗ Not paired. ${localState.a} pairs with ${complementOf(localState.a)}.`);
    }
  };

  return (
    <>
      <div className="chip-row">
        {defs.map((def) => (
          <button
            key={`target-${def.name}`}
            className="chip-btn"
            style={{
              background: `hsl(${def.hue}, 78%, 54%)`,
              opacity: isMatched(def.name) ? 0.3 : 1,
              border: isTargetSelected(def.name) ? "3px solid #fff" : "none",
              cursor: isMatched(def.name) ? "not-allowed" : "pointer",
              transform: isTargetSelected(def.name) ? "scale(1.08)" : "scale(1)",
              transition: "all 0.2s ease",
            }}
            onClick={() => handleTargetClick(def.name)}
            disabled={isMatched(def.name)}
          >
            {def.name}
          </button>
        ))}
      </div>

      <div className="mini-label">
        {localState.a ? `Selected: ${localState.a.toUpperCase()}` : "Pick a starting color"}
      </div>

      <div className="chip-row">
        {defs.map((def) => (
          <button
            key={`pick-${def.name}`}
            className="chip-btn"
            style={{
              background: `hsl(${def.hue}, 78%, 54%)`,
              opacity: isMatched(def.name) ? 0.3 : 1,
              cursor: isMatched(def.name) ? "not-allowed" : "pointer",
              transition: "all 0.2s ease",
            }}
            onClick={() => handleComplementClick(def.name)}
            disabled={isMatched(def.name)}
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

  const state = ensureState<Puzzle07State>(puzzleId, {
    a: "red",
    b: "green",
    rounds: 0,
    streak: 0,
    matchedPairs: new Set(),
  });

  createRoot(zone).render(<Puzzle07View persistedState={state} />);

  addCheckButton(wrapper, puzzleId, () => {
    const matchedPairs = state.matchedPairs instanceof Set 
      ? state.matchedPairs 
      : new Set(state.matchedPairs as unknown as ColorName[]);
    return {
      selectedColorA: state.a,
      selectedColorB: state.b,
      matchedCount: matchedPairs.size / 2,
    };
  });
};
