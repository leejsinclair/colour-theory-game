/**
 * Puzzle 11 – Colour Induction (Warm Context → Cool Illusion)
 *
 * A neutral gray square sits inside a coloured surround. Players adjust the
 * surround's hue, saturation, and lightness until the warm orange context is
 * strong enough to make the gray appear cool/bluish. Teaches colour induction:
 * how a complementary surround can shift the perceived hue of a neutral object.
 */
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

  const [highContrast, setHighContrast] = React.useState(false);

  const feedbackText = orangeStrength >= 0.6
    ? "Grey appears cooler/blue from warm orange context ✓"
    : "Push toward a stronger orange surround to induce blue shift";

  return (
    <>
      <div className="illusion-board single">
        <div
          className="illusion-panel"
          role="img"
          aria-label={`Surround colour: hue ${localState.surroundHue}°, saturation ${localState.surroundSat}%, lightness ${localState.surroundLight}%`}
          style={{ background: `hsl(${localState.surroundHue}, ${localState.surroundSat}%, ${localState.surroundLight}%)` }}
        >
          <div
            className="illusion-square"
            role="img"
            aria-label="Central grey square — colour is fixed at #9d9d9d"
            style={{
              background: "#9d9d9d",
              outline: highContrast ? "3px dashed #000" : undefined,
            }}
          />
        </div>
      </div>

      <div className="mini-label" aria-live="polite" aria-atomic="true">{feedbackText}</div>

      <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.82rem", marginBottom: "4px" }}>
        <input
          type="checkbox"
          checked={highContrast}
          onChange={(e) => setHighContrast(e.target.checked)}
        />
        High-contrast outline on grey square
      </label>

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
