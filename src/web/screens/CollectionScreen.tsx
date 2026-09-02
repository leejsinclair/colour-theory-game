import { useMemo, type ReactElement } from "react";
import { Heading, ProgressBar } from "../design-system";
import { usePets, useStations } from "../state/selectors";
import { PetGallery, type GalleryPet } from "../components/PetGallery";

/**
 * The Chromatic Pet collection (US5) — a game-like gallery: freed pets show
 * their art, name and origin station; the rest stay as silhouettes that don't
 * reveal the design. Every tile is keyboard-focusable with an accessible label
 * (`contracts/ui-contract.md` §Collection).
 */
export function CollectionScreen(): ReactElement {
  const pets = usePets();
  const stations = useStations();
  const collected = pets.filter((pet) => pet.collected).length;

  const galleryPets = useMemo<GalleryPet[]>(() => {
    const stationName = (id: string): string =>
      stations.find((station) => station.id === id)?.name ?? "the studio";
    return pets.map((pet) => ({
      id: pet.id,
      name: pet.name,
      collected: pet.collected,
      origin: stationName(pet.originStationId),
    }));
  }, [pets, stations]);

  return (
    <section className="screen">
      <Heading level={1}>Chromatic Pet Collection</Heading>
      <p className="screen__lede">
        Every puzzle you solve frees a Chromatic Pet. Freed pets show their true colours here — the
        rest are still hiding in the dark.
      </p>

      <div className="collection__progress">
        <ProgressBar
          label={`Chromatic Pets freed: ${collected} of ${pets.length}`}
          value={collected}
          max={pets.length}
        />
        <p className="collection__count" role="status">
          {collected} of {pets.length} freed
        </p>
      </div>

      <PetGallery pets={galleryPets} label="Chromatic Pet collection" />
    </section>
  );
}
