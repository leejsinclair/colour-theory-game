/**
 * Puzzle 13 – Atmospheric / Aerial Perspective
 *
 * Three mountain layers simulate depth. Players raise edge softening, saturation
 * drop and cool hue shift until each cue reaches its threshold (≥0.45).
 */
import { useState, type ReactElement } from "react";
import type { PuzzleComponentProps } from "./types";
import { PuzzleSlider } from "./controls";

export type Puzzle13Input = {
  edgeSharpnessDropsWithDistance: boolean;
  saturationDropsWithDistance: boolean;
  hueShiftsCoolerWithDistance: boolean;
};

type Cues = { edgeDrop: number; satDrop: number; coolShift: number };
const INITIAL: Cues = { edgeDrop: 0.15, satDrop: 0.2, coolShift: 0.15 };

export default function Puzzle13View({
  onChange,
  disabled,
}: PuzzleComponentProps<Puzzle13Input>): ReactElement {
  const [cues, setCues] = useState<Cues>(INITIAL);

  const apply = (next: Cues): void => {
    setCues(next);
    onChange({
      edgeSharpnessDropsWithDistance: next.edgeDrop >= 0.45,
      saturationDropsWithDistance: next.satDrop >= 0.45,
      hueShiftsCoolerWithDistance: next.coolShift >= 0.45,
    });
  };

  const nearHue = 120;
  const midHue = Math.round(nearHue + cues.coolShift * 30);
  const farHue = Math.round(nearHue + cues.coolShift * 65);

  return (
    <>
      <div className="depth-scene" aria-hidden="true">
        <div className="mountain far" style={{ background: `hsl(${farHue}, ${Math.round(54 - cues.satDrop * 55)}%, 56%)`, filter: `blur(${(cues.edgeDrop * 8).toFixed(1)}px)` }} />
        <div className="mountain mid" style={{ background: `hsl(${midHue}, ${Math.round(62 - cues.satDrop * 40)}%, 43%)`, filter: `blur(${(cues.edgeDrop * 4).toFixed(1)}px)` }} />
        <div className="mountain near" style={{ background: `hsl(${nearHue}, ${Math.round(70 - cues.satDrop * 20)}%, 36%)` }} />
      </div>

      <div className="mini-label" aria-live="polite">
        Depth cues: edges {cues.edgeDrop >= 0.45 ? "✓" : "…"} · saturation {cues.satDrop >= 0.45 ? "✓" : "…"} · cooler distance {cues.coolShift >= 0.45 ? "✓" : "…"}
      </div>

      <PuzzleSlider label="Edge softening" value={cues.edgeDrop} min={0} max={1} step={0.01} disabled={disabled} onChange={(v) => apply({ ...cues, edgeDrop: v })} />
      <PuzzleSlider label="Saturation drop" value={cues.satDrop} min={0} max={1} step={0.01} disabled={disabled} onChange={(v) => apply({ ...cues, satDrop: v })} />
      <PuzzleSlider label="Cool shift" value={cues.coolShift} min={0} max={1} step={0.01} disabled={disabled} onChange={(v) => apply({ ...cues, coolShift: v })} />
    </>
  );
}
