/**
 * Puzzle 21 – Optical Vibration (Vibrating Colours)
 *
 * Players tune two hues toward complementary opposition and toggle value
 * balance to equalise their lightness. Vibration intensity increases as hues
 * approach 180° apart and lightness values converge. When intensity reaches
 * ≥90% the colour pair animates with a vibrate effect. Teaches how true
 * colour opposites at equal value create maximum visual tension and the
 * optical vibration effect studied by Josef Albers and Op Art practitioners.
 */
import React from "react";
import { createRoot } from "react-dom/client";
import { PuzzleSlider } from "./muiPuzzleControls";
import { PuzzleRenderDeps, PuzzleRenderer } from "./types";

type Puzzle21State = {
  hueA: number;
  hueB: number;
  valueBalanced: boolean;
};

type Puzzle21ViewProps = {
  persistedState: Puzzle21State;
};

/** Returns angular distance from perfect complement (180deg). */
function complementDistance(hueA: number, hueB: number): number {
  const normalizedDelta = (((hueB - hueA) % 360) + 360) % 360;
  return Math.abs(normalizedDelta - 180);
}

/** Returns a 0–1 vibration intensity score based on hue complement and value balance. */
function vibrationIntensity(hueA: number, hueB: number, valueBalanced: boolean): number {
  const hueDiff = complementDistance(hueA, hueB);
  const complementScore = Math.max(0, 1 - hueDiff / 90);
  return complementScore * (valueBalanced ? 1 : 0.35);
}

/** Returns true when the two hues are within 20° of being complementary. */
function isComplement(hueA: number, hueB: number): boolean {
  return complementDistance(hueA, hueB) <= 20;
}

function Puzzle21View({ persistedState }: Puzzle21ViewProps): React.ReactElement {
  const [local, setLocal] = React.useState<Puzzle21State>({ ...persistedState });

  const update = (updater: (prev: Puzzle21State) => Puzzle21State): void => {
    setLocal((prev) => {
      const next = updater(prev);
      Object.assign(persistedState, next);
      return next;
    });
  };

  const intensity = vibrationIntensity(local.hueA, local.hueB, local.valueBalanced);
  const intensityPct = Math.round(intensity * 100);
  const complement = isComplement(local.hueA, local.hueB);

  // Values: high saturation, and either different lightness or matched lightness
  const lightnessA = local.valueBalanced ? 52 : 38;
  const lightnessB = local.valueBalanced ? 52 : 68;

  const colorA = `hsl(${local.hueA}, 90%, ${lightnessA}%)`;
  const colorB = `hsl(${local.hueB}, 90%, ${lightnessB}%)`;

  const vibrating = intensity >= 0.9;

  return (
    <>
      <div className="mini-label" style={{ marginBottom: "8px" }}>
        Tune two hues until they are complementary and balance their lightness to maximize optical vibration.
      </div>

      {/* Side-by-side colour preview */}
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "72px",
          borderRadius: "6px",
          overflow: "hidden",
          border: "1px solid rgba(0,0,0,0.15)",
          marginBottom: "8px",
          animation: vibrating ? "vibrate 0.08s linear infinite alternate" : "none",
        }}
      >
        <div style={{ flex: 1, background: colorA }} />
        <div style={{ flex: 1, background: colorB }} />
      </div>

      {/* Vibration intensity bar */}
      <div style={{ marginBottom: "8px" }}>
        <div className="mini-label" style={{ marginBottom: "2px" }}>
          Vibration intensity: {intensityPct}%{vibrating ? " ✓ Maximum vibration!" : ""}
        </div>
        <div
          style={{
            height: "10px",
            borderRadius: "5px",
            background: "#e0e0e0",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${intensityPct}%`,
              background: vibrating
                ? "linear-gradient(90deg, #e74c3c, #f39c12)"
                : "linear-gradient(90deg, #3498db, #2ecc71)",
              transition: "width 0.2s, background 0.2s",
            }}
          />
        </div>
      </div>

      {/* Hue sliders */}
      <div style={{ marginBottom: "6px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div
            style={{
              width: "16px",
              height: "16px",
              borderRadius: "50%",
              background: colorA,
              flexShrink: 0,
              border: "1px solid rgba(0,0,0,0.2)",
            }}
          />
          <div style={{ flex: 1 }}>
            <PuzzleSlider
              label="Colour A hue"
              value={local.hueA}
              min={0}
              max={359}
              step={1}
              onChange={(v) => update((prev) => ({ ...prev, hueA: v }))}
            />
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
          <div
            style={{
              width: "16px",
              height: "16px",
              borderRadius: "50%",
              background: colorB,
              flexShrink: 0,
              border: "1px solid rgba(0,0,0,0.2)",
            }}
          />
          <div style={{ flex: 1 }}>
            <PuzzleSlider
              label="Colour B hue"
              value={local.hueB}
              min={0}
              max={359}
              step={1}
              onChange={(v) => update((prev) => ({ ...prev, hueB: v }))}
            />
          </div>
        </div>
      </div>

      {/* Value balance toggle */}
      <div style={{ marginBottom: "4px" }}>
        <button
          className={`tod-palette-btn${local.valueBalanced ? " --selected" : ""}`}
          onClick={() => update((prev) => ({ ...prev, valueBalanced: !prev.valueBalanced }))}
          style={{ padding: "6px 14px" }}
        >
          {local.valueBalanced ? "✓ Values balanced (equal lightness)" : "Balance values (equal lightness)"}
        </button>
      </div>

      <div className="mini-label" style={{ marginTop: "6px" }}>
        {complement
          ? "Hues are complementary ✓"
          : "Adjust hues so they are approximately opposite on the colour wheel."}
        {!local.valueBalanced && " — Balance values to increase vibration."}
      </div>
    </>
  );
}

export const renderPuzzle21: PuzzleRenderer = (deps: PuzzleRenderDeps) => {
  const { zone, wrapper, puzzleId, ensureState, addCheckButton } = deps;

  const state = ensureState<Puzzle21State>(puzzleId, {
    hueA: 30,
    hueB: 60,
    valueBalanced: false,
  });

  createRoot(zone).render(<Puzzle21View persistedState={state} />);

  addCheckButton(wrapper, puzzleId, () => ({
    hueA: state.hueA,
    hueB: state.hueB,
    valueBalanced: state.valueBalanced,
  }));
};
