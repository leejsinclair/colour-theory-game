/**
 * Puzzle 20 – Colour Psychology & Emotional Association
 *
 * Four colour swatches (red, blue, yellow, green) each present four emotion
 * labels with descriptions. Players click the emotion that best matches the
 * colour's psychological association: red→excitement, blue→trust,
 * yellow→optimism, green→growth. Teaches colour psychology as applied in
 * branding, marketing, and UX design.
 */
import React from "react";
import { createRoot } from "react-dom/client";
import { PuzzleRenderDeps, PuzzleRenderer } from "./types";

type ColourName = "red" | "blue" | "yellow" | "green";

type Puzzle20State = {
  mappings: Record<string, string>;
};

type Puzzle20ViewProps = {
  persistedState: Puzzle20State;
};

const COLOURS: Array<{ name: ColourName; hex: string; label: string }> = [
  { name: "red", hex: "#E74C3C", label: "Red" },
  { name: "blue", hex: "#2980B9", label: "Blue" },
  { name: "yellow", hex: "#F1C40F", label: "Yellow" },
  { name: "green", hex: "#27AE60", label: "Green" },
];

const EMOTIONS: Array<{ id: string; label: string; description: string }> = [
  { id: "excitement", label: "Excitement & Urgency", description: "Energy, passion, action" },
  { id: "trust", label: "Trust & Calm", description: "Stability, reliability, peace" },
  { id: "optimism", label: "Optimism & Warmth", description: "Happiness, creativity, attention" },
  { id: "growth", label: "Growth & Balance", description: "Nature, harmony, renewal" },
];

const CORRECT: Record<ColourName, string> = {
  red: "excitement",
  blue: "trust",
  yellow: "optimism",
  green: "growth",
};

function Puzzle20View({ persistedState }: Puzzle20ViewProps): React.ReactElement {
  const [mappings, setMappings] = React.useState<Record<string, string>>({ ...persistedState.mappings });

  const setMapping = (colorName: string, emotionId: string): void => {
    setMappings((prev) => {
      const next = { ...prev, [colorName]: prev[colorName] === emotionId ? "" : emotionId };
      persistedState.mappings = next;
      return next;
    });
  };

  const matched = COLOURS.filter((c) => mappings[c.name] === CORRECT[c.name]).length;

  return (
    <>
      <div className="mini-label" style={{ marginBottom: "8px" }}>
        For each colour swatch, click the psychological association that best describes it.
      </div>

      {COLOURS.map((colour) => (
        <div
          key={colour.name}
          className="mood-match-card"
          style={{ marginBottom: "10px" }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
            <div
              role="img"
              aria-label={`${colour.label} colour swatch`}
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "6px",
                background: colour.hex,
                border: "1px solid rgba(0,0,0,0.15)",
                flexShrink: 0,
              }}
            />
            <div className="mood-match-title" style={{ margin: 0 }}>
              {colour.label}
              {mappings[colour.name] === CORRECT[colour.name] ? " ✓ matched" : ""}
            </div>
          </div>
          <div className="mood-match-options" role="group" aria-label={`Emotion options for ${colour.label}`} style={{ flexWrap: "wrap", gap: "6px" }}>
            {EMOTIONS.map((emotion) => (
              <button
                key={`${colour.name}-${emotion.id}`}
                className={`tod-palette-btn${mappings[colour.name] === emotion.id ? " --selected" : ""}`}
                aria-pressed={mappings[colour.name] === emotion.id}
                onClick={() => setMapping(colour.name, emotion.id)}
                style={{ textAlign: "left", padding: "6px 10px", minWidth: "140px" }}
              >
                <div style={{ fontWeight: "bold", fontSize: "12px" }}>{emotion.label}</div>
                <div style={{ fontSize: "11px", opacity: 0.75 }}>{emotion.description}</div>
              </button>
            ))}
          </div>
        </div>
      ))}

      <div className="mini-label" aria-live="polite" aria-atomic="true">
        {matched === COLOURS.length
          ? "All colours matched! ✓"
          : `${matched} of ${COLOURS.length} matched.`}
      </div>
    </>
  );
}

export const renderPuzzle20: PuzzleRenderer = (deps: PuzzleRenderDeps) => {
  const { zone, wrapper, puzzleId, ensureState, addCheckButton } = deps;

  const state = ensureState<Puzzle20State>(puzzleId, { mappings: {} });

  createRoot(zone).render(<Puzzle20View persistedState={state} />);

  addCheckButton(wrapper, puzzleId, () => ({ mappings: state.mappings }));
};
