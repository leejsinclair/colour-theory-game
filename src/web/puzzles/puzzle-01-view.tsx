/**
 * Puzzle 01 – Additive Color Mixing (RGB Light)
 *
 * Players toggle red, green, and blue light beams and align their overlap zone
 * to produce white light. Demonstrates additive RGB colour mixing as used in
 * screens and stage lighting.
 */
import type { ReactElement } from "react";
import type { PuzzleComponentProps } from "./types";

export type Puzzle01Input = {
  redBeam: boolean;
  greenBeam: boolean;
  blueBeam: boolean;
  overlap: boolean;
};

type BeamKey = keyof Puzzle01Input;

const beamDefs: Array<{ key: BeamKey; label: string; beam: string }> = [
  { key: "redBeam", label: "Red Beam", beam: "red" },
  { key: "greenBeam", label: "Green Beam", beam: "green" },
  { key: "blueBeam", label: "Blue Beam", beam: "blue" },
  { key: "overlap", label: "Align Overlap", beam: "overlap" },
];

export default function Puzzle01View({
  value,
  onChange,
  disabled,
}: PuzzleComponentProps<Puzzle01Input>): ReactElement {
  const toggleBeam = (key: BeamKey): void => {
    onChange({ ...value, [key]: !value[key] });
  };

  const r = value.redBeam && value.overlap ? 255 : 0;
  const g = value.greenBeam && value.overlap ? 255 : 0;
  const b = value.blueBeam && value.overlap ? 255 : 0;
  const parts = [value.redBeam ? "R" : "", value.greenBeam ? "G" : "", value.blueBeam ? "B" : ""].filter(
    Boolean,
  );

  const previewLabel = !value.overlap
    ? parts.length > 0
      ? `${parts.join("+")} beams - align overlap to mix`
      : "No beams active"
    : parts.length === 3
      ? "White light! ✓ All beams aligned"
      : parts.join("+") || "No beams";

  const swatchAriaLabel = value.overlap
    ? previewLabel
    : `No overlap active. Active beams: ${parts.length > 0 ? parts.join(", ") : "none"}`;

  return (
    <>
      <div className="beam-btns" role="group" aria-label="Light beam controls">
        {beamDefs.map(({ key, label, beam }) => (
          <button
            key={key}
            type="button"
            className={`beam-btn${value[key] ? " --on" : ""}`}
            data-beam={beam}
            aria-pressed={value[key]}
            disabled={disabled}
            onClick={() => toggleBeam(key)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="color-preview-row">
        <div
          className="color-preview-swatch"
          role="img"
          aria-label={swatchAriaLabel}
          style={{ background: value.overlap ? `rgb(${r}, ${g}, ${b})` : "#1a1a2e" }}
        />
        <div className="color-preview-label" aria-live="polite" aria-atomic="true">
          {previewLabel}
        </div>
      </div>
    </>
  );
}
