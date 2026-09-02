/**
 * Puzzle 12 – Neutral Support & Accent Pop
 *
 * Players tune the number of neutral fields, their lightness, and the accent's
 * hue and saturation. Contrast rises with accent saturation — desaturated
 * neutrals make a focal accent "pop".
 */
import { useState, type ReactElement } from "react";
import type { PuzzleComponentProps } from "./types";
import { PuzzleSlider } from "./controls";

export type Puzzle12Input = {
  neutralCount: number;
  accentContrast: number;
};

export default function Puzzle12View({
  value,
  onChange,
  disabled,
}: PuzzleComponentProps<Puzzle12Input>): ReactElement {
  const [accentHue, setAccentHue] = useState(8);
  const [accentSat, setAccentSat] = useState(80);
  const [neutralLight, setNeutralLight] = useState(55);

  const setAccentSaturation = (next: number): void => {
    setAccentSat(next);
    onChange({ ...value, accentContrast: Math.min(1, 0.25 + (next / 100) * 0.75) });
  };

  return (
    <>
      <div className="neutral-hero-board">
        <div className="neutral-field" style={{ background: `hsl(30, 12%, ${neutralLight}%)` }}>
          <div className="accent-chip" style={{ background: `hsl(${accentHue}, ${accentSat}%, 50%)` }} />
        </div>
      </div>

      <div className="mini-label" aria-live="polite">
        Neutral fields: {value.neutralCount} · Accent pop: {(value.accentContrast * 100).toFixed(0)}%
      </div>

      <PuzzleSlider label="Neutral mixes count" value={value.neutralCount} min={0} max={5} step={1} disabled={disabled} onChange={(v) => onChange({ ...value, neutralCount: v })} />
      <PuzzleSlider label="Neutral lightness" value={neutralLight} min={20} max={80} step={1} disabled={disabled} onChange={setNeutralLight} />
      <PuzzleSlider label="Accent hue" value={accentHue} min={0} max={360} step={1} disabled={disabled} onChange={setAccentHue} />
      <PuzzleSlider label="Accent saturation" value={accentSat} min={0} max={100} step={1} disabled={disabled} onChange={setAccentSaturation} />
      <PuzzleSlider label="Accent contrast" value={value.accentContrast} min={0} max={1} step={0.01} disabled={disabled} onChange={(v) => onChange({ ...value, accentContrast: v })} />
    </>
  );
}
