import MuiSlider from "@mui/material/Slider";
import { useId, type ReactElement } from "react";

/**
 * Thin skin over MUI `Slider` — retained (research.md R7) for pointer + keyboard
 * operation and `aria-valuetext`. Every puzzle slider goes through this so the
 * interaction vocabulary is uniform (contracts/puzzle-component.md rule 3).
 *
 * Always labelled: `label` renders a visible `<label>` unless `hideLabel` is set,
 * in which case it becomes the `aria-label`.
 */

export type SliderProps = {
  label: string;
  hideLabel?: boolean;
  value: number;
  min: number;
  max: number;
  step?: number;
  disabled?: boolean;
  onChange: (value: number) => void;
  /** Human-readable value for screen readers, e.g. "60 degrees". */
  valueText?: (value: number) => string;
  marks?: boolean;
};

export function Slider({
  label,
  hideLabel = false,
  value,
  min,
  max,
  step = 1,
  disabled = false,
  onChange,
  valueText,
  marks = false,
}: SliderProps): ReactElement {
  const id = useId();
  return (
    <div className="ds-slider-field">
      {!hideLabel ? (
        <label htmlFor={id} className="ds-tag" style={{ background: "transparent", padding: 0 }}>
          {label}
        </label>
      ) : null}
      <MuiSlider
        id={id}
        className="ds-slider"
        value={value}
        min={min}
        max={max}
        step={step}
        marks={marks}
        disabled={disabled}
        aria-label={hideLabel ? label : undefined}
        getAriaValueText={valueText}
        valueLabelDisplay={valueText ? "auto" : "off"}
        valueLabelFormat={valueText}
        onChange={(_event, next) => onChange(Array.isArray(next) ? next[0] : next)}
      />
    </div>
  );
}
