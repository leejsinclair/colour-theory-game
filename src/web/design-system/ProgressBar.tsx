import type { ReactElement } from "react";

/**
 * Linear progress. Renders a real `progressbar` role with `aria-valuenow`; the
 * `label` is the accessible name and callers should also show a text count
 * nearby so progress is not conveyed by the bar alone (FR-035).
 */

export type ProgressBarProps = {
  label: string;
  value: number;
  max: number;
};

export function ProgressBar({ label, value, max }: ProgressBarProps): ReactElement {
  const safeMax = max > 0 ? max : 1;
  const clamped = Math.max(0, Math.min(value, safeMax));
  const pct = Math.round((clamped / safeMax) * 100);
  return (
    <div
      className="ds-progress-bar"
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={safeMax}
      aria-valuenow={clamped}
      aria-valuetext={`${clamped} of ${safeMax}`}
    >
      <div className="ds-progress-bar__fill" style={{ width: `${pct}%` }} />
    </div>
  );
}
