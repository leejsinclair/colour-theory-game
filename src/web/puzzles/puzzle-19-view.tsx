/**
 * Puzzle 19 – Colour Balance & Composition Ratios (60-30-10 Rule)
 *
 * Players choose hues for primary / secondary / accent roles and tune the
 * percentage sliders to hit 60 / 30 / 10 within tolerance.
 */
import { useState, type ReactElement } from "react";
import type { PuzzleComponentProps } from "./types";
import { PuzzleSlider } from "./controls";

export type Puzzle19Input = {
  primaryPct: number;
  secondaryPct: number;
  accentPct: number;
};

const TARGETS = { primaryPct: 60, secondaryPct: 30, accentPct: 10 };
const TOLERANCE = { primaryPct: 5, secondaryPct: 5, accentPct: 3 };

export default function Puzzle19View({
  value,
  onChange,
  disabled,
}: PuzzleComponentProps<Puzzle19Input>): ReactElement {
  const [hues, setHues] = useState({ primary: 220, secondary: 40, accent: 0 });

  const total = value.primaryPct + value.secondaryPct + value.accentPct;
  const totalOk = Math.abs(total - 100) <= 2;

  const colors = {
    primary: `hsl(${hues.primary}, 55%, 52%)`,
    secondary: `hsl(${hues.secondary}, 55%, 52%)`,
    accent: `hsl(${hues.accent}, 80%, 55%)`,
  };

  const pctSlider = (label: string, key: keyof Puzzle19Input, role: keyof typeof TARGETS): ReactElement => {
    const ok = Math.abs(value[key] - TARGETS[role]) <= TOLERANCE[role];
    return (
      <PuzzleSlider
        label={`${label}: ${value[key]}% (target ~${TARGETS[role]}%)${ok ? " ✓" : ""}`}
        hideValue
        value={value[key]}
        min={0}
        max={100}
        step={1}
        disabled={disabled}
        onChange={(v) => onChange({ ...value, [key]: v })}
        format={(v) => `${v} percent`}
      />
    );
  };

  return (
    <>
      <div className="balance-composition" aria-hidden="true" style={{ display: "flex", width: "100%", height: "72px", borderRadius: "var(--radius-sm)", overflow: "hidden" }}>
        <div style={{ flex: value.primaryPct, background: colors.primary }} />
        <div style={{ flex: value.secondaryPct, background: colors.secondary }} />
        <div style={{ flex: value.accentPct, background: colors.accent }} />
      </div>

      <div className="mini-label" aria-live="polite">
        Total: {total}% {totalOk ? "✓" : "(must sum to 100%)"}
      </div>

      <div className="mini-label">Choose colours</div>
      <PuzzleSlider label="Primary hue" value={hues.primary} min={0} max={360} step={1} disabled={disabled} onChange={(v) => setHues((h) => ({ ...h, primary: v }))} format={(v) => `${v} degrees`} />
      <PuzzleSlider label="Secondary hue" value={hues.secondary} min={0} max={360} step={1} disabled={disabled} onChange={(v) => setHues((h) => ({ ...h, secondary: v }))} format={(v) => `${v} degrees`} />
      <PuzzleSlider label="Accent hue" value={hues.accent} min={0} max={360} step={1} disabled={disabled} onChange={(v) => setHues((h) => ({ ...h, accent: v }))} format={(v) => `${v} degrees`} />

      <div className="mini-label">Set proportions</div>
      {pctSlider("Primary", "primaryPct", "primaryPct")}
      {pctSlider("Secondary", "secondaryPct", "secondaryPct")}
      {pctSlider("Accent", "accentPct", "accentPct")}
    </>
  );
}
