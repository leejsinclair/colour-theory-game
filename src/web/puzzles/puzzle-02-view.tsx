/**
 * Puzzle 02 – Subtractive Color Mixing (CMY Pigments)
 *
 * Players adjust cyan, magenta, and yellow sliders to mix a target colour.
 * CMY converts to RGB with the subtractive formula (RGB = 255 × (1 − CMY)).
 * Side-by-side swatches compare the mix against the target.
 */
import type { ReactElement } from "react";
import type { PuzzleComponentProps } from "./types";
import { PuzzleSlider } from "./controls";

export type Puzzle02Input = {
  cyan: number;
  magenta: number;
  yellow: number;
  target: { cyan: number; magenta: number; yellow: number };
};

type Channel = "cyan" | "magenta" | "yellow";

export default function Puzzle02View({
  value,
  onChange,
  disabled,
}: PuzzleComponentProps<Puzzle02Input>): ReactElement {
  const set = (channel: Channel, next: number): void => onChange({ ...value, [channel]: next });

  const r = Math.round(255 * (1 - value.cyan));
  const g = Math.round(255 * (1 - value.magenta));
  const b = Math.round(255 * (1 - value.yellow));

  const tr = Math.round(255 * (1 - value.target.cyan));
  const tg = Math.round(255 * (1 - value.target.magenta));
  const tb = Math.round(255 * (1 - value.target.yellow));

  return (
    <>
      <PuzzleSlider label="Cyan" value={value.cyan} min={0} max={1} step={0.01} disabled={disabled} onChange={(v) => set("cyan", v)} />
      <PuzzleSlider label="Magenta" value={value.magenta} min={0} max={1} step={0.01} disabled={disabled} onChange={(v) => set("magenta", v)} />
      <PuzzleSlider label="Yellow" value={value.yellow} min={0} max={1} step={0.01} disabled={disabled} onChange={(v) => set("yellow", v)} />

      <div className="color-preview-row">
        <div className="color-preview-swatch" role="img" aria-label={`Your mix: rgb ${r}, ${g}, ${b}`} style={{ background: `rgb(${r}, ${g}, ${b})` }} />
        <div className="color-preview-swatch" role="img" aria-label="Target colour" style={{ background: `rgb(${tr}, ${tg}, ${tb})` }} />
        <div className="color-preview-label">Current to Target</div>
      </div>
    </>
  );
}
