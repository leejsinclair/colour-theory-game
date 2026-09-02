/**
 * Puzzle 05 – Value Ordering (Lightest to Darkest)
 *
 * Players reorder colour tiles from darkest to lightest with left/right
 * controls. Correct order reveals a hidden icon. Teaches value progression.
 */
import type { ReactElement } from "react";
import type { PuzzleComponentProps } from "./types";
import { Button } from "../design-system";

export type Puzzle05Input = {
  orderedValues: number[];
  hiddenImageRevealed: boolean;
};

function isOrdered(values: number[]): boolean {
  return values.every((v, i, arr) => i === 0 || v >= arr[i - 1]);
}

export default function Puzzle05View({
  value,
  onChange,
  disabled,
}: PuzzleComponentProps<Puzzle05Input>): ReactElement {
  const tiles = value.orderedValues;
  const ordered = isOrdered(tiles);

  const shift = (idx: number, direction: -1 | 1): void => {
    const next = [...tiles];
    const other = idx + direction;
    [next[other], next[idx]] = [next[idx], next[other]];
    onChange({ orderedValues: next, hiddenImageRevealed: isOrdered(next) });
  };

  return (
    <>
      <div className="mini-label">Reorder tiles from darkest to lightest. Correct order reveals the hidden icon.</div>

      <div className="ladder-wrap" role="group" aria-label="Value tiles">
        {tiles.map((v, idx) => {
          const tone = Math.round(v * 255);
          return (
            <div key={`${idx}-${v}`} className="ladder-tile" style={{ background: `rgb(${tone}, ${tone}, ${tone})` }}>
              <div className="ladder-controls">
                <Button variant="secondary" size="sm" disabled={disabled || idx === 0} onClick={() => shift(idx, -1)}>
                  <span aria-hidden="true">←</span>
                  <span className="ds-visually-hidden">Move tile {idx + 1} left</span>
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={disabled || idx === tiles.length - 1}
                  onClick={() => shift(idx, 1)}
                >
                  <span aria-hidden="true">→</span>
                  <span className="ds-visually-hidden">Move tile {idx + 1} right</span>
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      <div className={`hidden-reveal${ordered ? " is-on" : ""}`} aria-live="polite">
        {ordered ? "Hidden image revealed: ⟡" : "Hidden image is scrambled"}
      </div>
    </>
  );
}
