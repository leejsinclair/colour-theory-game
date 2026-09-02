/**
 * Puzzle 14 – Rayleigh Scattering & Atmospheric Haze
 *
 * Players raise scatter and haze. Above 0.6 scattering the distant ridge shifts
 * blue, simulating why far mountains and the sky read blue.
 */
import { useState, type ReactElement } from "react";
import type { PuzzleComponentProps } from "./types";
import { PuzzleSlider } from "./controls";
import { Button } from "../design-system";

export type Puzzle14Input = {
  farObjectsShiftBlue: boolean;
  scatteringStrength: number;
};

type Sky = { scatter: number; haze: number };
const INITIAL: Sky = { scatter: 0.2, haze: 0.2 };

export default function Puzzle14View({
  onChange,
  disabled,
}: PuzzleComponentProps<Puzzle14Input>): ReactElement {
  const [sky, setSky] = useState<Sky>(INITIAL);

  const apply = (next: Sky): void => {
    setSky(next);
    onChange({ farObjectsShiftBlue: next.scatter >= 0.6, scatteringStrength: next.scatter });
  };

  const skyHue = Math.round(200 + sky.scatter * 24);
  const shiftBlue = sky.scatter >= 0.6;

  return (
    <>
      <div className="scatter-board" aria-hidden="true">
        <div
          className="scatter-sky"
          style={{ background: `linear-gradient(180deg, hsl(${skyHue}, ${45 + sky.scatter * 30}%, 68%), hsl(${skyHue + 14}, ${30 + sky.scatter * 25}%, 52%))` }}
        >
          <div
            className="scatter-ridge far"
            style={{ background: `hsl(${198 + sky.scatter * 18}, ${28 + sky.haze * 25}%, ${54 + sky.haze * 18}%)`, opacity: `${0.55 + sky.haze * 0.4}` }}
          />
          <div className="scatter-ridge near" style={{ background: `hsl(125, ${48 - sky.haze * 18}%, ${34 + sky.haze * 8}%)` }} />
        </div>
      </div>

      <div className="mini-label" aria-live="polite">
        {shiftBlue ? "Far ridge shifts blue with stronger scattering ✓" : "Increase scattering to push far forms toward blue."}
      </div>

      <PuzzleSlider label="Scattering strength" value={sky.scatter} min={0} max={1} step={0.01} disabled={disabled} onChange={(v) => apply({ ...sky, scatter: v })} />
      <PuzzleSlider label="Atmospheric haze" value={sky.haze} min={0} max={1} step={0.01} disabled={disabled} onChange={(v) => apply({ ...sky, haze: v })} />

      <Button
        variant="secondary"
        disabled={disabled}
        onClick={() => apply({ scatter: Math.min(1, sky.scatter + 0.14), haze: Math.min(1, sky.haze + 0.12) })}
      >
        Add Blue Haze Burst
      </Button>
    </>
  );
}
