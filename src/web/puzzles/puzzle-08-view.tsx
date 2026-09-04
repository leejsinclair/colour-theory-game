/**
 * Puzzle 08 – Triadic Harmony (120° Spacing)
 *
 * Players adjust three hue sliders toward roughly equal 120° spacing on the
 * colour wheel. "Triad aligned" appears when all gaps are within ±15° of 120°.
 */
import type { ReactElement } from "react";
import type { PuzzleComponentProps } from "./types";
import { PuzzleSlider } from "./controls";

export type Puzzle08Input = {
  hueAngles: [number, number, number];
};

function normalizeHue(h: number): number {
  return ((h % 360) + 360) % 360;
}

function triadInfo(angles: number[]): { gaps: number[]; good: boolean } {
  const values = angles.map(normalizeHue).sort((a, b) => a - b);
  const gaps = [
    (values[1] - values[0] + 360) % 360,
    (values[2] - values[1] + 360) % 360,
    (values[0] + 360 - values[2]) % 360,
  ];
  return { gaps, good: gaps.every((gap) => Math.abs(gap - 120) <= 15) };
}

export default function Puzzle08View({
  value,
  onChange,
  disabled,
}: PuzzleComponentProps<Puzzle08Input>): ReactElement {
  const angles = value.hueAngles;
  const setHue = (index: 0 | 1 | 2, next: number): void => {
    const nextAngles = [...angles] as [number, number, number];
    nextAngles[index] = next;
    onChange({ hueAngles: nextAngles });
  };

  const { gaps, good } = triadInfo(angles);

  return (
    <>
      <div className="mini-label">Aim for roughly equal 120° spacing between all three hue markers.</div>

      {([0, 1, 2] as const).map((index) => (
        <div key={index} className="mini-row">
          <div className="hue-row">
            <span>Hue {index + 1}: {Math.round(angles[index])}°</span>
            <span className="hue-swatch" style={{ background: `hsl(${angles[index]}, 85%, 55%)` }} />
          </div>
          <PuzzleSlider
            label={`Hue ${index + 1}`}
            hideValue
            value={angles[index]}
            min={0}
            max={360}
            step={1}
            disabled={disabled}
            onChange={(v) => setHue(index, v)}
            format={(v) => `${Math.round(v)} degrees`}
          />
        </div>
      ))}

      <div className="triad-strip" aria-hidden="true">
        {angles.map((hue, index) => (
          <div
            key={index}
            className="triad-mark"
            style={{ left: `${(normalizeHue(hue) / 360) * 100}%`, background: `hsl(${hue}, 85%, 55%)` }}
          />
        ))}
      </div>

      <div className="mini-label" aria-live="polite">
        Gaps: {Math.round(gaps[0])}° / {Math.round(gaps[1])}° / {Math.round(gaps[2])}°{good ? " — triad aligned ✓" : ""}
      </div>
    </>
  );
}
