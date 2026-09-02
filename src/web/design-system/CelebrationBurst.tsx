import { useMemo, type CSSProperties, type ReactElement } from "react";

/**
 * A brief, non-blocking colour burst for a correct solve (FR-033, FR-045).
 * CSS transforms/opacity only, a capped particle count (R13), and `pointer-events:
 * none` so it never blocks interaction. Under reduced motion it renders a small
 * static cluster instead of an animation (FR-047, SC-009) — callers pass
 * `reducedMotion` from `useReducedMotion()`.
 */

const PARTICLE_COUNT = 12;
const PALETTE = [
  "var(--accent-primary)",
  "var(--accent-secondary)",
  "var(--accent-gold)",
  "var(--accent-violet)",
];

export type CelebrationBurstProps = {
  reducedMotion: boolean;
  /** Restart key — change it to replay the burst. */
  playKey?: string | number;
};

export function CelebrationBurst({ reducedMotion, playKey = 0 }: CelebrationBurstProps): ReactElement {
  const particles = useMemo(
    () =>
      Array.from({ length: PARTICLE_COUNT }, (_, i) => {
        const angle = (i / PARTICLE_COUNT) * Math.PI * 2;
        const distance = reducedMotion ? 22 : 60 + (i % 3) * 14;
        return {
          key: `${playKey}-${i}`,
          color: PALETTE[i % PALETTE.length],
          x: `${Math.cos(angle) * distance}px`,
          y: `${Math.sin(angle) * distance}px`,
          delay: reducedMotion ? "0ms" : `${(i % 4) * 30}ms`,
        };
      }),
    [reducedMotion, playKey],
  );

  return (
    <div
      className={`ds-celebration${reducedMotion ? " ds-celebration--static" : ""}`}
      aria-hidden="true"
    >
      {particles.map((p) => (
        <span
          key={p.key}
          className="ds-celebration__particle"
          style={
            {
              background: p.color,
              animationDelay: p.delay,
              "--ds-burst-x": p.x,
              "--ds-burst-y": p.y,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}
