/**
 * Puzzle 03 – Luminous Shadows from Complementary Pigments
 *
 * Players choose two pigment colours and set a "gloss" slider. A true
 * complementary pair (red+green, blue+orange, yellow+purple) with enough gloss
 * (≥0.55) makes the mixed shadow a warm, luminous chromatic black.
 */
import { useState, type ReactElement } from "react";
import type { PuzzleComponentProps } from "./types";
import { PuzzleSlider } from "./controls";

type Pigment = "red" | "orange" | "yellow" | "green" | "blue" | "purple";

export type Puzzle03Input = {
  pigments: [Pigment, Pigment];
  luminousShadow: boolean;
};

const chipHue: Record<Pigment, number> = { red: 8, orange: 28, yellow: 52, green: 132, blue: 220, purple: 282 };
const colors: Pigment[] = ["red", "orange", "yellow", "green", "blue", "purple"];

function isComplement(a: Pigment, b: Pigment): boolean {
  const pair = [a, b].sort().join("+");
  return ["blue+orange", "green+red", "purple+yellow"].includes(pair);
}

export default function Puzzle03View({
  value,
  onChange,
  disabled,
}: PuzzleComponentProps<Puzzle03Input>): ReactElement {
  const [gloss, setGloss] = useState(0.3);
  const [a, b] = value.pigments;

  const emit = (nextA: Pigment, nextB: Pigment, nextGloss: number): void => {
    onChange({
      pigments: [nextA, nextB],
      luminousShadow: isComplement(nextA, nextB) && nextGloss >= 0.55,
    });
  };

  const h1 = chipHue[a] ?? 0;
  const h2 = chipHue[b] ?? 0;
  const hue = Math.round((h1 + h2) / 2);
  const complement = isComplement(a, b);
  const sat = complement ? Math.max(8, Math.round(20 + gloss * 20)) : Math.round(38 + gloss * 15);
  const light = complement ? Math.round(18 + gloss * 12) : Math.round(24 + gloss * 8);
  const luminousShadow = complement && gloss >= 0.55;

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
          role="img"
          aria-label={`Shadow swatch: ${a} and ${b} mix — ${feedback}`}
          style={{
            background: `radial-gradient(circle at 35% 30%, rgba(255,255,255,${0.16 + gloss * 0.4}), transparent 42%), hsl(${hue}, ${sat}%, ${light}%)`,
          }}
        />
      </div>

      <div className="chip-grid">
        <div className="mini-label">Pigment A: {a}</div>
        <div className="chip-row" role="group" aria-label="Choose Pigment A">
          {colors.map((name) => (
            <button
              key={`a-${name}`}
              type="button"
              className="chip-btn"
              style={{ background: `hsl(${chipHue[name]}, 80%, 52%)` }}
              aria-pressed={a === name}
              aria-label={`Pigment A: ${name}${a === name ? " (selected)" : ""}`}
              disabled={disabled}
              onClick={() => emit(name, b, gloss)}
            >
              A: {name}
            </button>
          ))}
        </div>

        <div className="mini-label">Pigment B: {b}</div>
        <div className="chip-row" role="group" aria-label="Choose Pigment B">
          {colors.map((name) => (
            <button
              key={`b-${name}`}
              type="button"
              className="chip-btn"
              style={{ background: `hsl(${chipHue[name]}, 80%, 52%)` }}
              aria-pressed={b === name}
              aria-label={`Pigment B: ${name}${b === name ? " (selected)" : ""}`}
              disabled={disabled}
              onClick={() => emit(a, name, gloss)}
            >
              B: {name}
            </button>
          ))}
        </div>
      </div>

      <PuzzleSlider
        label="Shadow gloss"
        value={gloss}
        min={0}
        max={1}
        step={0.01}
        disabled={disabled}
        onChange={(next) => {
          setGloss(next);
          emit(a, b, next);
        }}
      />

      <div className="mini-label" aria-live="polite" aria-atomic="true">{feedback}</div>
    </>
  );
}
