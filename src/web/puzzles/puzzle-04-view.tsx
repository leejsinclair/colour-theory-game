/**
 * Puzzle 04 – Value & Readability (Silhouette under Blur)
 *
 * Players paint a row of grayscale tone blocks and toggle a blur effect to
 * test whether the silhouette stays readable. Success needs ≥75% tonal
 * contrast between the darkest and lightest blocks.
 */
import { useState, type ReactElement } from "react";
import type { PuzzleComponentProps } from "./types";
import { Button } from "../design-system";

export type Puzzle04Input = {
  usesOnlyBlackAndWhite: true;
  blurReadability: number;
};

const INITIAL_TONES = [30, 220, 40, 210, 50, 200];

function readabilityOf(tones: number[]): number {
  return (Math.max(...tones) - Math.min(...tones)) / 255;
}

export default function Puzzle04View({
  onChange,
  disabled,
}: PuzzleComponentProps<Puzzle04Input>): ReactElement {
  const [tones, setTones] = useState<number[]>(INITIAL_TONES);
  const [blur, setBlur] = useState(true);

  const emit = (nextTones: number[]): void => {
    onChange({ usesOnlyBlackAndWhite: true, blurReadability: readabilityOf(nextTones) });
  };

  const readability = readabilityOf(tones);

  return (
    <>
      <div className="mini-label">Paint the statue blocks in grayscale so the silhouette stays readable under blur.</div>

      <div className="value-block-row" role="group" aria-label="Tone blocks">
        {tones.map((tone, idx) => (
          <button
            key={idx}
            type="button"
            className="value-block"
            style={{ background: `rgb(${tone}, ${tone}, ${tone})` }}
            aria-label={`Tone ${idx + 1}: ${tone} of 255`}
            disabled={disabled}
            onClick={() => {
              const next = [...tones];
              next[idx] = (next[idx] + 32) % 256;
              setTones(next);
              emit(next);
            }}
          />
        ))}
      </div>

      <div className="blur-preview" aria-hidden="true" style={{ filter: blur ? "blur(4px)" : "none" }}>
        {tones.map((tone, idx) => (
          <div key={idx} className="blur-stripe" style={{ background: `rgb(${tone}, ${tone}, ${tone})` }} />
        ))}
      </div>

      <Button variant="secondary" disabled={disabled} onClick={() => setBlur((prev) => !prev)}>
        Toggle Squint Blur
      </Button>

      <div className="mini-label" aria-live="polite">
        Blur readability: {(readability * 100).toFixed(0)}% (target ≥ 75%)
      </div>
    </>
  );
}
