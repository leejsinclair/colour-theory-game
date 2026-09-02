/**
 * Puzzle 10 – Simultaneous Contrast Illusion
 *
 * Two gray squares sit on differently-coloured surrounds. Players tune each
 * surround's hue/saturation/lightness to minimise the perceived difference
 * between the grays (target ≤5%).
 */
import { useState, type ReactElement } from "react";
import type { PuzzleComponentProps } from "./types";
import { circularHueDistance } from "../puzzleValidation";
import { PuzzleSlider } from "./controls";
import { Button } from "../design-system";

export type Puzzle10Input = {
  perceivedDifference: number;
  backgroundsAdjusted: boolean;
};

type Surrounds = {
  leftHue: number;
  rightHue: number;
  leftSat: number;
  rightSat: number;
  leftLight: number;
  rightLight: number;
};

const INITIAL: Surrounds = {
  leftHue: 40,
  rightHue: 230,
  leftSat: 65,
  rightSat: 65,
  leftLight: 52,
  rightLight: 52,
};

function perceivedDifference(s: Surrounds): number {
  const hueDist = circularHueDistance(s.leftHue, s.rightHue) / 180;
  const satAvg = (s.leftSat + s.rightSat) / 200;
  const lightDist = Math.abs(s.leftLight - s.rightLight) / 100;
  const satDist = Math.abs(s.leftSat - s.rightSat) / 100;
  return hueDist * satAvg * 0.55 + lightDist * 0.3 + satDist * 0.15;
}

export default function Puzzle10View({
  onChange,
  disabled,
}: PuzzleComponentProps<Puzzle10Input>): ReactElement {
  const [surrounds, setSurrounds] = useState<Surrounds>(INITIAL);

  const apply = (next: Surrounds): void => {
    setSurrounds(next);
    onChange({ perceivedDifference: perceivedDifference(next), backgroundsAdjusted: true });
  };

  const diff = perceivedDifference(surrounds);

  const slider = (label: string, key: keyof Surrounds, min: number, max: number): ReactElement => (
    <PuzzleSlider
      label={label}
      value={surrounds[key]}
      min={min}
      max={max}
      step={1}
      disabled={disabled}
      onChange={(v) => apply({ ...surrounds, [key]: v })}
    />
  );

  return (
    <>
      <div className="illusion-board">
        <div className="illusion-panel" style={{ background: `hsl(${surrounds.leftHue}, ${surrounds.leftSat}%, ${surrounds.leftLight}%)` }}>
          <div className="illusion-square" style={{ background: "#a6a6a6" }} />
        </div>
        <div className="illusion-panel" style={{ background: `hsl(${surrounds.rightHue}, ${surrounds.rightSat}%, ${surrounds.rightLight}%)` }}>
          <div className="illusion-square" style={{ background: "#a6a6a6" }} />
        </div>
      </div>

      <div className="mini-label" aria-live="polite">
        Estimated perception gap: {(diff * 100).toFixed(1)}% (lower is better, target ≤ 5%)
      </div>

      {slider("Left surround hue", "leftHue", 0, 360)}
      {slider("Right surround hue", "rightHue", 0, 360)}
      {slider("Left saturation", "leftSat", 0, 100)}
      {slider("Right saturation", "rightSat", 0, 100)}
      {slider("Left lightness", "leftLight", 20, 80)}
      {slider("Right lightness", "rightLight", 20, 80)}

      <Button
        variant="secondary"
        disabled={disabled}
        onClick={() => apply({ ...surrounds, rightLight: surrounds.leftLight, rightSat: surrounds.leftSat })}
      >
        Normalize Values
      </Button>
    </>
  );
}
