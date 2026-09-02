/**
 * Puzzle 11 – Colour Induction (Warm Context → Cool Illusion)
 *
 * A neutral gray square sits inside a coloured surround. Players push the
 * surround toward a strong warm orange until the gray reads cool/bluish.
 */
import { useState, type ReactElement } from "react";
import type { PuzzleComponentProps } from "./types";
import { circularHueDistance } from "../puzzleValidation";
import { PuzzleSlider } from "./controls";
import { Checkbox } from "../design-system";

export type Puzzle11Input = {
  usedOrangeSurroundings: boolean;
  greySquareChanged: false;
};

type Surround = { hue: number; sat: number; light: number };
const INITIAL: Surround = { hue: 30, sat: 70, light: 50 };

export default function Puzzle11View({
  onChange,
  disabled,
}: PuzzleComponentProps<Puzzle11Input>): ReactElement {
  const [surround, setSurround] = useState<Surround>(INITIAL);
  const [highContrast, setHighContrast] = useState(false);

  const apply = (next: Surround): void => {
    setSurround(next);
    onChange({
      usedOrangeSurroundings: circularHueDistance(next.hue, 30) <= 20 && next.sat >= 55,
      greySquareChanged: false,
    });
  };

  const orangeDistance = circularHueDistance(surround.hue, 30);
  const orangeStrength = Math.max(0, 1 - orangeDistance / 45) * (surround.sat / 100);
  const feedbackText =
    orangeStrength >= 0.6
      ? "Grey appears cooler/blue from the warm orange context ✓"
      : "Push toward a stronger orange surround to induce the blue shift";

  return (
    <>
      <div className="illusion-board single">
        <div
          className="illusion-panel"
          role="img"
          aria-label={`Surround colour: hue ${Math.round(surround.hue)}°, saturation ${Math.round(surround.sat)}%, lightness ${Math.round(surround.light)}%`}
          style={{ background: `hsl(${surround.hue}, ${surround.sat}%, ${surround.light}%)` }}
        >
          <div
            className="illusion-square"
            role="img"
            aria-label="Central grey square — colour is fixed at #9d9d9d"
            style={{ background: "#9d9d9d", outline: highContrast ? "3px dashed #000" : undefined }}
          />
        </div>
      </div>

      <div className="mini-label" aria-live="polite" aria-atomic="true">{feedbackText}</div>

      <Checkbox
        label="High-contrast outline on grey square"
        checked={highContrast}
        disabled={disabled}
        onChange={setHighContrast}
      />

      <PuzzleSlider label="Surround hue" value={surround.hue} min={0} max={360} step={1} disabled={disabled} onChange={(v) => apply({ ...surround, hue: v })} />
      <PuzzleSlider label="Surround saturation" value={surround.sat} min={0} max={100} step={1} disabled={disabled} onChange={(v) => apply({ ...surround, sat: v })} />
      <PuzzleSlider label="Surround lightness" value={surround.light} min={20} max={80} step={1} disabled={disabled} onChange={(v) => apply({ ...surround, light: v })} />
    </>
  );
}
