/**
 * Puzzle 20 – Colour Psychology & Emotional Association
 *
 * Four colour swatches each present four emotion labels. Players click the
 * association that best matches: red→excitement, blue→trust, yellow→optimism,
 * green→growth.
 */
import type { ReactElement } from "react";
import type { PuzzleComponentProps } from "./types";

type ColourName = "red" | "blue" | "yellow" | "green";

export type Puzzle20Input = {
  mappings: Record<string, string>;
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

export default function Puzzle20View({
  value,
  onChange,
  disabled,
}: PuzzleComponentProps<Puzzle20Input>): ReactElement {
  const { mappings } = value;

  const setMapping = (colour: string, emotionId: string): void => {
    onChange({
      mappings: { ...mappings, [colour]: mappings[colour] === emotionId ? "" : emotionId },
    });
  };

  const matched = COLOURS.filter((c) => mappings[c.name] === CORRECT[c.name]).length;

  return (
    <>
      <div className="mini-label">For each colour, click the psychological association that best describes it.</div>

      {COLOURS.map((colour) => (
        <div key={colour.name} className="mood-match-card">
          <div className="mood-match-title">
            <span aria-hidden="true" className="tod-swatch" style={{ background: colour.hex }} /> {colour.label}
            {mappings[colour.name] === CORRECT[colour.name] ? " ✓ matched" : ""}
          </div>
          <div className="mood-match-options" role="group" aria-label={`Emotion options for ${colour.label}`}>
            {EMOTIONS.map((emotion) => (
              <button
                key={`${colour.name}-${emotion.id}`}
                type="button"
                className={`tod-palette-btn${mappings[colour.name] === emotion.id ? " --selected" : ""}`}
                aria-pressed={mappings[colour.name] === emotion.id}
                aria-label={`${emotion.label} for ${colour.label}`}
                disabled={disabled}
                onClick={() => setMapping(colour.name, emotion.id)}
              >
                <span style={{ fontWeight: 700 }}>{emotion.label}</span>
                <span style={{ opacity: 0.75 }}> — {emotion.description}</span>
              </button>
            ))}
          </div>
        </div>
      ))}

      <div className="mini-label" aria-live="polite" aria-atomic="true">
        {matched === COLOURS.length ? "All colours matched! ✓" : `${matched} of ${COLOURS.length} matched.`}
      </div>
    </>
  );
}
