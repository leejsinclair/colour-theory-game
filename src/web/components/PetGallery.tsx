import type { ReactElement } from "react";
import { PetBadge, type PetBadgeSize } from "./PetBadge";

/**
 * A gallery of `PetBadge`s (FR-039, US5). Pure presentation — the caller
 * resolves each pet's origin station name and collected state.
 */

export type GalleryPet = {
  id: string;
  name: string;
  collected: boolean;
  /** Origin station name. */
  origin: string;
};

export type PetGalleryProps = {
  pets: ReadonlyArray<GalleryPet>;
  size?: PetBadgeSize;
  showLabel?: boolean;
  /** Accessible name for the list. */
  label?: string;
};

export function PetGallery({
  pets,
  size = "md",
  showLabel = true,
  label,
}: PetGalleryProps): ReactElement {
  return (
    <ul className="pet-gallery" aria-label={label}>
      {pets.map((pet) => (
        <li key={pet.id} className="pet-gallery__cell">
          <PetBadge
            petId={pet.id}
            name={pet.name}
            collected={pet.collected}
            origin={pet.origin}
            size={size}
            showLabel={showLabel}
          />
        </li>
      ))}
    </ul>
  );
}
