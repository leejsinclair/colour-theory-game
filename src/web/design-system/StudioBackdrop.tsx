import type { ReactElement } from "react";

/**
 * The ambient "magical studio" ground behind every screen (research.md R8,
 * FR-042, FR-045). A *bounded* set of soft pigment blobs over a radial wash —
 * fixed, behind content, `pointer-events: none`. Motion is CSS drift only and is
 * disabled under `prefers-reduced-motion` by `styles.css`, so this component
 * takes no props.
 */

const BLOBS = [
  { top: "-8%", left: "-6%", size: "26rem", color: "rgba(124, 92, 255, 0.28)", delay: "0s" },
  { top: "12%", left: "72%", size: "22rem", color: "rgba(70, 224, 208, 0.20)", delay: "-6s" },
  { top: "58%", left: "-10%", size: "24rem", color: "rgba(255, 91, 176, 0.18)", delay: "-11s" },
  { top: "70%", left: "60%", size: "20rem", color: "rgba(255, 207, 92, 0.16)", delay: "-3s" },
];

export function StudioBackdrop(): ReactElement {
  return (
    <div className="ds-studio-backdrop" aria-hidden="true">
      {BLOBS.map((blob, i) => (
        <div
          key={i}
          className="ds-studio-backdrop__blob"
          style={{
            top: blob.top,
            left: blob.left,
            width: blob.size,
            height: blob.size,
            background: `radial-gradient(circle at 50% 50%, ${blob.color}, transparent 70%)`,
            animationDelay: blob.delay,
          }}
        />
      ))}
    </div>
  );
}
