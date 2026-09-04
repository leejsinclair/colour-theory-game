/**
 * Puzzle 21 – Optical Vibration (Vibrating Colours)
 *
 * Players tune two hues toward complementary opposition and balance their
 * lightness. Vibration peaks when hues are ~180° apart at equal value.
 */
import type { ReactElement } from "react";
import type { PuzzleComponentProps } from "./types";
import { PuzzleSlider } from "./controls";
import { Button } from "../design-system";

export type Puzzle21Input = {
  hueA: number;
  hueB: number;
  valueBalanced: boolean;
};

function complementDistance(hueA: number, hueB: number): number {
  const delta = (((hueB - hueA) % 360) + 360) % 360;
  return Math.abs(delta - 180);
}

function vibrationIntensity(hueA: number, hueB: number, valueBalanced: boolean): number {
  const complementScore = Math.max(0, 1 - complementDistance(hueA, hueB) / 90);
  return complementScore * (valueBalanced ? 1 : 0.35);
}

export default function Puzzle21View({
  value,
  onChange,
  disabled,
  reducedMotion,
}: PuzzleComponentProps<Puzzle21Input>): ReactElement {
  const intensity = vibrationIntensity(value.hueA, value.hueB, value.valueBalanced);
  const intensityPct = Math.round(intensity * 100);
  const complement = complementDistance(value.hueA, value.hueB) <= 20;
  const vibrating = intensity >= 0.9;

  const lightnessA = value.valueBalanced ? 52 : 38;
  const lightnessB = value.valueBalanced ? 52 : 68;
  const colorA = `hsl(${value.hueA}, 90%, ${lightnessA}%)`;
  const colorB = `hsl(${value.hueB}, 90%, ${lightnessB}%)`;

  return (
    <>
      <div className="mini-label">
        Tune two hues until they are complementary and balance their lightness to maximise optical vibration.
      </div>

      <div
        aria-hidden="true"
        style={{
          display: "flex",
          width: "100%",
          height: "72px",
          borderRadius: "var(--radius-sm)",
          overflow: "hidden",
          animation: vibrating && !reducedMotion ? "vibrate 0.08s linear infinite alternate" : "none",
        }}
      >
        <div style={{ flex: 1, background: colorA }} />
        <div style={{ flex: 1, background: colorB }} />
      </div>

      <div className="mini-label" aria-live="polite">
        Vibration intensity: {intensityPct}%{vibrating ? " ✓ maximum vibration" : ""}
      </div>

      <PuzzleSlider label="Colour A hue" value={value.hueA} min={0} max={359} step={1} disabled={disabled} onChange={(v) => onChange({ ...value, hueA: v })} format={(v) => `${v} degrees`} />
      <PuzzleSlider label="Colour B hue" value={value.hueB} min={0} max={359} step={1} disabled={disabled} onChange={(v) => onChange({ ...value, hueB: v })} format={(v) => `${v} degrees`} />

      <Button
        variant={value.valueBalanced ? "primary" : "secondary"}
        disabled={disabled}
        aria-pressed={value.valueBalanced}
        onClick={() => onChange({ ...value, valueBalanced: !value.valueBalanced })}
      >
        {value.valueBalanced ? "✓ Values balanced (equal lightness)" : "Balance values (equal lightness)"}
      </Button>

      <div className="mini-label">
        {complement ? "Hues are complementary ✓" : "Adjust hues so they are roughly opposite on the wheel."}
        {!value.valueBalanced && " — balance values to increase vibration."}
      </div>
    </>
  );
}
