/**
 * Puzzle 18 – Art Station paint pad (special apparatus,
 * contracts/puzzle-component.md rule 6).
 *
 * A React rewrite of the retired imperative canvas mini-game: pick a pure
 * colour, paint dots on the pad (pointer drag or keyboard), and step back to
 * the blended preview. All coverage / optical maths lives in
 * `artStationCoverage.ts`; this component only holds the pad pixels and the
 * selected colour as local state and reports the Check payload via `onChange`.
 */
import { useState, type ReactElement } from "react";
import type { PuzzleComponentProps } from "./types";
import { ART_PAD_BLANK, artStationResult, getArtCoverage, opticalPreview } from "./artStationCoverage";
import { Button } from "../design-system";

export type ArtStationInput = {
  usedPureDots: boolean;
  mixedOnPalette: false;
  opticalBlendVisible: boolean;
};

const COLS = 12;
const ROWS = 8;
const PREVIEW_COLS = 6;
const PREVIEW_ROWS = 4;
const PALETTE = ["#0d8db0", "#ec7755", "#2f9e44", "#f0b429", "#6f42c1", "#1f2030"];

function blankPad(): string[] {
  return new Array(COLS * ROWS).fill(ART_PAD_BLANK);
}

export default function ArtStationPad({
  onChange,
  disabled,
  announce,
}: PuzzleComponentProps<ArtStationInput>): ReactElement {
  const [pixels, setPixels] = useState<string[]>(blankPad);
  const [color, setColor] = useState(PALETTE[0]);
  const [painting, setPainting] = useState(false);

  const paint = (index: number): void => {
    if (disabled || pixels[index] === color) {
      return;
    }
    const next = [...pixels];
    next[index] = color;
    setPixels(next);
    onChange(artStationResult(next));
  };

  const clear = (): void => {
    const next = blankPad();
    setPixels(next);
    onChange(artStationResult(next));
    announce("Pad cleared");
  };

  const coverage = Math.round(getArtCoverage(pixels) * 100);
  const preview = opticalPreview(pixels, COLS, ROWS, PREVIEW_COLS, PREVIEW_ROWS);

  return (
    <div className="art-station-pad">
      <div className="mini-label">Paint dots of pure colour. Step back to see optical mixing at work.</div>

      <div className="swatch-row" role="radiogroup" aria-label="Pure colours">
        {PALETTE.map((swatch) => (
          <button
            key={swatch}
            type="button"
            role="radio"
            aria-checked={color === swatch}
            aria-label={`Colour ${swatch}`}
            className={`swatch${color === swatch ? " is-active" : ""}`}
            style={{ background: swatch }}
            disabled={disabled}
            onClick={() => setColor(swatch)}
          />
        ))}
      </div>

      <div
        className="paint-pad"
        role="grid"
        aria-label="Paint pad"
        style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }}
        onPointerDown={() => setPainting(true)}
        onPointerUp={() => setPainting(false)}
        onPointerLeave={() => setPainting(false)}
      >
        {pixels.map((pixel, index) => (
          <button
            key={index}
            type="button"
            role="gridcell"
            aria-label={`Cell ${index + 1}${pixel === ART_PAD_BLANK ? "" : " painted"}`}
            className="paint-cell"
            style={{ background: pixel }}
            disabled={disabled}
            onPointerDown={() => paint(index)}
            onPointerEnter={() => {
              if (painting) {
                paint(index);
              }
            }}
            onClick={() => paint(index)}
          />
        ))}
      </div>

      <div className="optical-preview-wrap">
        <div className="mini-label">Distance view (blended preview)</div>
        <div className="optical-preview" aria-hidden="true" style={{ gridTemplateColumns: `repeat(${PREVIEW_COLS}, 1fr)` }}>
          {preview.map((swatch, index) => (
            <div key={index} className="optical-cell" style={{ background: swatch }} />
          ))}
        </div>
      </div>

      <div className="coverage-wrap">
        <div className="coverage-bar-track">
          <div className={`coverage-bar-fill${coverage >= 12 ? " --ready" : ""}`} style={{ width: `${coverage}%` }} />
        </div>
        <div className="coverage-bar-label" aria-live="polite">
          {coverage >= 12 ? `Coverage: ${coverage}% ✓ optical mixing visible` : `Coverage: ${coverage}% — paint more dots (need 12%)`}
        </div>
      </div>

      <Button variant="secondary" disabled={disabled} onClick={clear}>
        Clear Pad
      </Button>
    </div>
  );
}
