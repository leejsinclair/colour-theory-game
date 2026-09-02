import { memo, type CSSProperties, type ReactElement } from "react";
import { getPetSprite } from "../petSprites";

/**
 * THE reusable Chromatic Pet component (FR-038, US5). One presentation used in
 * the Collection gallery, the reward reveal and the Grand Canvas roll.
 *
 * - Locked: a true silhouette (the sprite is knocked to black by CSS) plus a
 *   "?" glyph — the design is not revealed until the pet is freed.
 * - Unlocked: the full sprite art, name and origin.
 * - The badge is an `img` with an accessible label and is keyboard-focusable
 *   (US5 independent test) unless `focusable={false}`. State is never carried by
 *   colour alone — the silhouette, the "?" and the caption text all say "locked".
 */

export type PetBadgeSize = "sm" | "md" | "lg";

export type PetBadgeProps = {
  petId: string;
  name: string;
  collected: boolean;
  /** Origin — a station name. Shown in the label and, with `showLabel`, the caption. */
  origin?: string;
  size?: PetBadgeSize;
  /** Render the name (or "???") and origin beneath the sprite. */
  showLabel?: boolean;
  /** Override the computed accessible label. */
  label?: string;
  /** Tab-stop so keyboard/switch users can land on each collectible. Default true. */
  focusable?: boolean;
  className?: string;
};

function accessibleLabel({ name, collected, origin, label }: PetBadgeProps): string {
  if (label) {
    return label;
  }
  if (collected) {
    return origin ? `${name} — from ${origin}` : `${name} collected`;
  }
  return origin
    ? `Locked pet — solve a puzzle in ${origin} to reveal`
    : "Locked pet — solve its puzzle to reveal";
}

function PetBadgeImpl(props: PetBadgeProps): ReactElement {
  const {
    petId,
    name,
    collected,
    origin,
    size = "md",
    showLabel = false,
    focusable = true,
    className,
  } = props;
  const sprite = getPetSprite(petId, collected);

  const cls = [
    "pet-badge",
    `pet-badge--${size}`,
    collected ? "pet-badge--collected" : "pet-badge--locked",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <figure className={cls}>
      <span
        className="pet-badge__frame"
        role="img"
        aria-label={accessibleLabel(props)}
        tabIndex={focusable ? 0 : undefined}
      >
        <span
          className="pet-badge__sprite"
          aria-hidden="true"
          style={sprite.style as CSSProperties}
        />
        {collected ? null : (
          <span className="pet-badge__lock" aria-hidden="true">
            ?
          </span>
        )}
      </span>
      {showLabel ? (
        <figcaption className="pet-badge__caption">
          <span className="pet-badge__name">{collected ? name : "???"}</span>
          {origin ? (
            <span className="pet-badge__origin">{collected ? `from ${origin}` : origin}</span>
          ) : null}
        </figcaption>
      ) : null}
    </figure>
  );
}

/** Memoised: gallery/roll lists re-render on every progress change; props are all primitives (T106). */
export const PetBadge = memo(PetBadgeImpl);
