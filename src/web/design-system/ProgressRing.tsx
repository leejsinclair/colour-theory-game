import type { ReactElement } from "react";

/**
 * Circular progress — HUD Grand-Canvas progress, station-card completion.
 * SVG-only (no asset). `progressbar` role with a value text; a visible count
 * should accompany it so it is not colour/arc-only (FR-035).
 */

export type ProgressRingProps = {
  label: string;
  value: number;
  max: number;
  size?: number;
  strokeWidth?: number;
  /** Optional text drawn in the centre (e.g. "8/22"). */
  centerLabel?: string;
};

export function ProgressRing({
  label,
  value,
  max,
  size = 48,
  strokeWidth = 5,
  centerLabel,
}: ProgressRingProps): ReactElement {
  const safeMax = max > 0 ? max : 1;
  const clamped = Math.max(0, Math.min(value, safeMax));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - clamped / safeMax);

  return (
    <svg
      className="ds-progress-ring"
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={safeMax}
      aria-valuenow={clamped}
      aria-valuetext={`${clamped} of ${safeMax}`}
    >
      <circle
        className="ds-progress-ring__track"
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        strokeWidth={strokeWidth}
      />
      <circle
        className="ds-progress-ring__value"
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      {centerLabel ? (
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dominantBaseline="central"
          fill="var(--text-primary)"
          fontSize={size * 0.28}
          fontFamily="var(--font-body)"
        >
          {centerLabel}
        </text>
      ) : null}
    </svg>
  );
}
