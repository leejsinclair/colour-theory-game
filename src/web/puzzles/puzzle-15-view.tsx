/**
 * Puzzle 15 – Time of Day & Golden Hour (Two-Stage)
 *
 * Stage 1: match four colour palettes to four times of day.
 * Stage 2: adjust sun height, atmosphere and colour temperature to recreate
 * golden-hour light in the window scene.
 */
import { useState, type CSSProperties, type ReactElement } from "react";
import type { PuzzleComponentProps } from "./types";
import { PuzzleSlider } from "./controls";
import { Button } from "../design-system";

export type Puzzle15Input = {
  palettesMatched: boolean;
  sunHeight: number;
  colorTemperature: number;
  atmosphere: number;
};

const PALETTES: Array<{ id: string; label: string; swatches: string[] }> = [
  { id: "A", label: "Palette A", swatches: ["#a8c8e8", "#f5e6a0", "#c8cad0", "#9ab89a", "#b8d8e8"] },
  { id: "B", label: "Palette B", swatches: ["#6080b0", "#50c050", "#e8c020", "#505060", "#60a0d0"] },
  { id: "C", label: "Palette C", swatches: ["#e87030", "#e0a020", "#a05030", "#f0c040", "#c098b8"] },
  { id: "D", label: "Palette D", swatches: ["#203070", "#704090", "#202060", "#6068a0", "#404878"] },
];

const SLOTS: Array<{ id: string; label: string; correctPaletteId: string }> = [
  { id: "morning", label: "Morning", correctPaletteId: "A" },
  { id: "midday", label: "Midday", correctPaletteId: "B" },
  { id: "goldenHour", label: "Golden Hour", correctPaletteId: "C" },
  { id: "afterSunset", label: "After Sunset", correctPaletteId: "D" },
];

export default function Puzzle15View({
  value,
  onChange,
  disabled,
  announce,
}: PuzzleComponentProps<Puzzle15Input>): ReactElement {
  const [stage, setStage] = useState<1 | 2>(value.palettesMatched ? 2 : 1);
  const [selected, setSelected] = useState<string | null>(null);
  const [assignments, setAssignments] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState("");

  const assignedPaletteIds = Object.values(assignments);

  const pickPalette = (paletteId: string): void => {
    if (assignedPaletteIds.includes(paletteId)) {
      return;
    }
    setSelected((prev) => (prev === paletteId ? null : paletteId));
  };

  const assignToSlot = (slotId: string): void => {
    if (!selected) {
      return;
    }
    const next = { ...assignments, [slotId]: selected };
    setSelected(null);

    if (SLOTS.every((slot) => next[slot.id])) {
      const allCorrect = SLOTS.every((slot) => next[slot.id] === slot.correctPaletteId);
      if (allCorrect) {
        setAssignments(next);
        setFeedback("Palettes matched. Now recreate the golden hour.");
        setStage(2);
        onChange({ ...value, palettesMatched: true });
        announce("Palettes matched. Stage two: control the sun.");
        return;
      }
      setAssignments({});
      setFeedback("The sun's colour changes as it moves across the sky. Try again!");
      announce("Not quite — palettes reset.");
      return;
    }

    setAssignments(next);
    setFeedback("");
  };

  const resetStage1 = (): void => {
    setAssignments({});
    setSelected(null);
    setFeedback("");
    setStage(1);
    onChange({ ...value, palettesMatched: false });
  };

  const setStage2 = (patch: Partial<Puzzle15Input>): void => onChange({ ...value, ...patch });

  const heightOk = value.sunHeight < 0.35;
  const tempOk = value.colorTemperature > 0.7;
  const atmosOk = value.atmosphere >= 0.4 && value.atmosphere <= 0.6;

  const skyHue = Math.round(220 - value.colorTemperature * 190);
  const skyStyle: CSSProperties = {
    height: "150px",
    borderRadius: "var(--radius-md)",
    background: `linear-gradient(180deg, hsl(${skyHue}, 60%, ${52 + (1 - value.sunHeight) * 20}%), hsl(${skyHue - 10}, 55%, ${34 + (1 - value.sunHeight) * 18}%))`,
    filter: value.atmosphere > 0.5 ? `blur(${((value.atmosphere - 0.5) * 2).toFixed(2)}px)` : "none",
    position: "relative",
    overflow: "hidden",
  };
  const sunStyle: CSSProperties = {
    position: "absolute",
    width: "38px",
    height: "38px",
    borderRadius: "50%",
    top: `${68 - value.sunHeight * 60}%`,
    left: `${50 + (value.sunHeight - 0.5) * 30}%`,
    background: `radial-gradient(circle, rgba(255,240,180,${0.25 + value.colorTemperature * 0.45}), hsl(${Math.round(40 + (1 - value.colorTemperature) * 140)}, 95%, 65%) 45%, transparent 75%)`,
  };

  return (
    <>
      {stage === 1 ? (
        <div className="tod-stage">
          <div className="phase-indicator">Stage 1 — Match the Palette</div>
          <div className="mini-label">Click a palette to select it, then click a time-of-day card to assign it.</div>

          <div className="tod-palette-tray" role="group" aria-label="Colour palettes">
            {PALETTES.map((pal) => {
              const isAssigned = assignedPaletteIds.includes(pal.id);
              return (
                <button
                  key={pal.id}
                  type="button"
                  className={`tod-palette-btn${selected === pal.id ? " --selected" : ""}${isAssigned ? " --assigned" : ""}`}
                  aria-pressed={selected === pal.id}
                  aria-label={`Select ${pal.label}${isAssigned ? " (already assigned)" : ""}`}
                  disabled={disabled || isAssigned}
                  onClick={() => pickPalette(pal.id)}
                >
                  <span className="tod-palette-name">{pal.label}</span>
                  <div className="tod-swatch-row">
                    {pal.swatches.map((color) => (
                      <div key={color} className="tod-swatch" style={{ background: color }} />
                    ))}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="tod-slot-grid" role="group" aria-label="Times of day">
            {SLOTS.map((slot) => {
              const assignedId = assignments[slot.id];
              const assignedPalette = PALETTES.find((p) => p.id === assignedId);
              return (
                <button
                  key={slot.id}
                  type="button"
                  className={`tod-slot${assignedId ? " --assigned" : ""}${selected && !assignedId ? " --drop-ready" : ""}`}
                  aria-label={`${slot.label}${assignedPalette ? `: ${assignedPalette.label}` : selected ? " — click to assign selected palette" : ""}`}
                  disabled={disabled || !selected || Boolean(assignedId)}
                  onClick={() => assignToSlot(slot.id)}
                >
                  <div className="tod-slot-label">{slot.label}</div>
                  <div className="tod-slot-content">{assignedPalette ? assignedPalette.label : ""}</div>
                </button>
              );
            })}
          </div>

          <div className="mini-label" aria-live="polite" aria-atomic="true">{feedback}</div>
          <Button variant="secondary" disabled={disabled} onClick={resetStage1}>
            Reset Palettes
          </Button>
        </div>
      ) : (
        <div className="tod-stage">
          <div className="phase-indicator">Stage 2 — Control the Sun</div>
          <div className="phase-guide">
            Target: Golden Hour — warm orange sunlight, long shadows, a soft glowing horizon. Adjust the
            controls until the window view matches.
          </div>

          <div style={skyStyle} aria-hidden="true">
            <div style={sunStyle} />
          </div>

          <div className="mini-label" aria-live="polite" aria-atomic="true">
            Sun height {heightOk ? "✓" : "…"} · Colour temperature {tempOk ? "✓" : "…"} · Atmosphere {atmosOk ? "✓" : "…"}
            {heightOk && tempOk && atmosOk ? " — golden hour achieved!" : ""}
          </div>

          <PuzzleSlider label="Sun height (low = near horizon)" value={value.sunHeight} min={0} max={1} step={0.01} disabled={disabled} onChange={(v) => setStage2({ sunHeight: v })} />
          <PuzzleSlider label="Atmosphere (haze)" value={value.atmosphere} min={0} max={1} step={0.01} disabled={disabled} onChange={(v) => setStage2({ atmosphere: v })} />
          <PuzzleSlider label="Colour temperature (cool → warm)" value={value.colorTemperature} min={0} max={1} step={0.01} disabled={disabled} onChange={(v) => setStage2({ colorTemperature: v })} />

          <Button variant="ghost" disabled={disabled} onClick={resetStage1}>
            Back to palette matching
          </Button>
        </div>
      )}
    </>
  );
}
