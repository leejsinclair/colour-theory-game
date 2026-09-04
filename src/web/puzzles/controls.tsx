import type { ReactElement } from "react";
import { Slider } from "../design-system";

/**
 * Puzzle-local formatting wrapper around the design-system `<Slider>` — shows the
 * current numeric value in the label the way every mini-game did before the
 * migration. The underlying control is still `design-system/Slider`
 * (contracts/puzzle-component.md rule 3); this only formats the label.
 */

export type PuzzleSliderProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  disabled?: boolean;
  onChange: (value: number) => void;
  /** Override the value shown after the label (defaults to a fixed-precision number). */
  format?: (value: number) => string;
  /** Hide the value readout entirely. */
  hideValue?: boolean;
};

export function PuzzleSlider({
  label,
  value,
  min,
  max,
  step = 1,
  disabled = false,
  onChange,
  format,
  hideValue = false,
}: PuzzleSliderProps): ReactElement {
  const precision = step >= 1 ? 0 : 2;
  const shown = format ? format(value) : value.toFixed(precision);
  return (
    <Slider
      label={hideValue ? label : `${label}: ${shown}`}
      value={value}
      min={min}
      max={max}
      step={step}
      disabled={disabled}
      onChange={onChange}
      valueText={(v) => (format ? format(v) : v.toFixed(precision))}
    />
  );
}
