/**
 * Puzzle 19 – Colour Balance & Composition Ratios (60-30-10 Rule)
 *
 * Players choose hues for a primary, secondary, and accent role, then adjust
 * percentage sliders to hit target proportions: 60% primary, 30% secondary,
 * and 10% accent (within tolerances). A stacked bar updates in real time to
 * visualise the balance. Teaches the classic 60-30-10 colour composition
 * rule widely used in interior design, fashion, and graphic design.
 */
import React from "react";
import { createRoot } from "react-dom/client";
import { PuzzleSlider } from "./muiPuzzleControls";
import { PuzzleRenderDeps, PuzzleRenderer } from "./types";

type Puzzle19State = {
  primaryHue: number;
  secondaryHue: number;
  accentHue: number;
  primaryPct: number;
  secondaryPct: number;
  accentPct: number;
};

type Puzzle19ViewProps = {
  persistedState: Puzzle19State;
};

const TARGET_PRIMARY = 60;
const TARGET_SECONDARY = 30;
const TARGET_ACCENT = 10;
const TOLERANCE_PRIMARY = 5;
const TOLERANCE_SECONDARY = 5;
const TOLERANCE_ACCENT = 3;

function isWithinTarget(value: number, target: number, tolerance: number): boolean {
  return Math.abs(value - target) <= tolerance;
}

function Puzzle19View({ persistedState }: Puzzle19ViewProps): React.ReactElement {
  const [localState, setLocalState] = React.useState<Puzzle19State>({ ...persistedState });

  const updateState = (updater: (prev: Puzzle19State) => Puzzle19State): void => {
    setLocalState((prev) => {
      const next = updater(prev);
      Object.assign(persistedState, next);
      return next;
    });
  };

  const total = localState.primaryPct + localState.secondaryPct + localState.accentPct;

  const primaryOk = isWithinTarget(localState.primaryPct, TARGET_PRIMARY, TOLERANCE_PRIMARY);
  const secondaryOk = isWithinTarget(localState.secondaryPct, TARGET_SECONDARY, TOLERANCE_SECONDARY);
  const accentOk = isWithinTarget(localState.accentPct, TARGET_ACCENT, TOLERANCE_ACCENT);
  const totalOk = Math.abs(total - 100) <= 2;

  const primaryColor = `hsl(${localState.primaryHue}, 55%, 52%)`;
  const secondaryColor = `hsl(${localState.secondaryHue}, 55%, 52%)`;
  const accentColor = `hsl(${localState.accentHue}, 80%, 55%)`;

  const hueSlider = (
    label: string,
    key: "primaryHue" | "secondaryHue" | "accentHue",
    color: string,
  ): React.ReactElement => (
    <div className="mini-row" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <div
        className="mini-label"
        style={{
          width: "16px",
          height: "16px",
          borderRadius: "50%",
          background: color,
          flexShrink: 0,
          border: "1px solid rgba(0,0,0,0.2)",
        }}
      />
      <div style={{ flex: 1 }}>
        <PuzzleSlider
          label={label}
          value={localState[key]}
          min={0}
          max={360}
          step={1}
          onChange={(value) => updateState((prev) => ({ ...prev, [key]: value }))}
        />
      </div>
    </div>
  );

  const pctSlider = (
    label: string,
    key: "primaryPct" | "secondaryPct" | "accentPct",
    target: number,
    ok: boolean,
  ): React.ReactElement => (
    <PuzzleSlider
      label={`${label}: ${localState[key]}% (target ~${target}%) ${ok ? "✓" : ""}`}
      value={localState[key]}
      min={0}
      max={100}
      step={1}
      onChange={(value) => updateState((prev) => ({ ...prev, [key]: value }))}
    />
  );

  return (
    <>
      <div
        className="balance-composition"
        style={{
          display: "flex",
          width: "100%",
          height: "80px",
          borderRadius: "6px",
          overflow: "hidden",
          border: "1px solid rgba(0,0,0,0.15)",
          marginBottom: "8px",
        }}
      >
        <div
          style={{
            flex: localState.primaryPct,
            background: primaryColor,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "rgba(255,255,255,0.9)",
            fontSize: "11px",
            fontWeight: "bold",
            minWidth: 0,
            overflow: "hidden",
          }}
        >
          {localState.primaryPct >= 15 ? `${localState.primaryPct}%` : ""}
        </div>
        <div
          style={{
            flex: localState.secondaryPct,
            background: secondaryColor,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "rgba(255,255,255,0.9)",
            fontSize: "11px",
            fontWeight: "bold",
            minWidth: 0,
            overflow: "hidden",
          }}
        >
          {localState.secondaryPct >= 12 ? `${localState.secondaryPct}%` : ""}
        </div>
        <div
          style={{
            flex: localState.accentPct,
            background: accentColor,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "rgba(255,255,255,0.9)",
            fontSize: "11px",
            fontWeight: "bold",
            minWidth: 0,
            overflow: "hidden",
          }}
        >
          {localState.accentPct >= 8 ? `${localState.accentPct}%` : ""}
        </div>
      </div>

      <div
        className="mini-label"
        style={{ color: totalOk ? "inherit" : "#c0392b", marginBottom: "4px" }}
      >
        Total: {total}% {totalOk ? "✓" : `(must sum to 100%)`}
      </div>

      <div style={{ marginBottom: "8px" }}>
        <div className="mini-label" style={{ fontWeight: "bold", marginBottom: "4px" }}>Choose colors</div>
        {hueSlider("Primary hue", "primaryHue", primaryColor)}
        {hueSlider("Secondary hue", "secondaryHue", secondaryColor)}
        {hueSlider("Accent hue", "accentHue", accentColor)}
      </div>

      <div>
        <div className="mini-label" style={{ fontWeight: "bold", marginBottom: "4px" }}>Set proportions</div>
        {pctSlider("Primary", "primaryPct", TARGET_PRIMARY, primaryOk)}
        {pctSlider("Secondary", "secondaryPct", TARGET_SECONDARY, secondaryOk)}
        {pctSlider("Accent", "accentPct", TARGET_ACCENT, accentOk)}
      </div>
    </>
  );
}

export const renderPuzzle19: PuzzleRenderer = (deps: PuzzleRenderDeps) => {
  const { zone, wrapper, puzzleId, ensureState, addCheckButton } = deps;

  const state = ensureState<Puzzle19State>(puzzleId, {
    primaryHue: 220,
    secondaryHue: 40,
    accentHue: 0,
    primaryPct: 40,
    secondaryPct: 40,
    accentPct: 20,
  });

  createRoot(zone).render(<Puzzle19View persistedState={state} />);

  addCheckButton(wrapper, puzzleId, () => ({
    primaryPct: state.primaryPct,
    secondaryPct: state.secondaryPct,
    accentPct: state.accentPct,
  }));
};
