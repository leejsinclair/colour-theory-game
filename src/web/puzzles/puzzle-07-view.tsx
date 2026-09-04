/**
 * Puzzle 07 – Complementary Colour Matching Game
 *
 * Players select a colour then pick its complement. Correct pairs: red↔green,
 * blue↔orange, yellow↔purple.
 */
import { useState, type ReactElement } from "react";
import type { PuzzleComponentProps } from "./types";

type ColorName = "red" | "orange" | "yellow" | "green" | "blue" | "purple";

export type Puzzle07Input = {
  selectedColorA: ColorName;
  selectedColorB: ColorName;
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

export default function Puzzle07View({
  value,
  onChange,
  disabled,
  announce,
}: PuzzleComponentProps<Puzzle07Input>): ReactElement {
  const [matched, setMatched] = useState<Set<ColorName>>(new Set());
  const [resultText, setResultText] = useState(
    "Build intuition: select a color, then pick its complement.",
  );

  const target = value.selectedColorA;

  const handleTarget = (color: ColorName): void => {
    if (matched.has(color)) {
      return;
    }
    onChange({ selectedColorA: color, selectedColorB: value.selectedColorB });
    setResultText(`Selected ${color}. Now pick its complement!`);
  };

  const handleComplement = (color: ColorName): void => {
    if (matched.has(color) || !target) {
      return;
    }
    const correct = comp[target] === color;
    onChange({ selectedColorA: target, selectedColorB: color });
    if (correct) {
      const next = new Set(matched);
      next.add(target);
      next.add(color);
      setMatched(next);
      const message = `Perfect! ${target} + ${color}.`;
      setResultText(`✓ ${message}`);
      announce(message);
    } else {
      setResultText(`✗ Not paired. ${target} pairs with ${comp[target]}.`);
      announce(`Not a complement. ${target} pairs with ${comp[target]}.`);
    }
  };

  const chip = (kind: "target" | "pick", def: { name: ColorName; hue: number }): ReactElement => {
    const isMatched = matched.has(def.name);
    const selected = kind === "target" && def.name === target;
    return (
      <button
        key={`${kind}-${def.name}`}
        type="button"
        className="chip-btn"
        aria-pressed={selected}
        aria-label={`${kind === "target" ? "Starting colour" : "Complement"}: ${def.name}${selected ? " (selected)" : ""}${isMatched ? " (matched)" : ""}`}
        style={{
          background: `hsl(${def.hue}, 78%, 54%)`,
          opacity: isMatched ? 0.3 : 1,
          outline: selected ? "3px solid #fff" : "none",
        }}
        disabled={disabled || isMatched}
        onClick={() => (kind === "target" ? handleTarget(def.name) : handleComplement(def.name))}
      >
        {def.name}
      </button>
    );
  };

  return (
    <>
      <div className="chip-row" role="group" aria-label="Choose a starting colour">
        {defs.map((def) => chip("target", def))}
      </div>

      <div className="mini-label">{target ? `Selected: ${target.toUpperCase()}` : "Pick a starting color"}</div>

      <div className="chip-row" role="group" aria-label="Choose the complement">
        {defs.map((def) => chip("pick", def))}
      </div>

      <div className="mini-label" aria-live="polite" aria-atomic="true">{resultText}</div>
    </>
  );
}
