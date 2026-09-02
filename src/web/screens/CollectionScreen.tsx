import type { ReactElement } from "react";
import { Heading } from "../design-system";
import { usePets, useStations } from "../state/selectors";
import { getPetSprite } from "../petSprites";

/**
 * The Chromatic Pet collection — a simple grid in US1 (T050). The game-like
 * gallery with intriguing locked silhouettes lands in US5 (T098).
 */
export function CollectionScreen(): ReactElement {
  const pets = usePets();
  const stations = useStations();
  const collected = pets.filter((pet) => pet.collected).length;

  const stationName = (id: string): string =>
    stations.find((station) => station.id === id)?.name ?? "the studio";

  return (
    <section className="screen">
      <Heading level={1}>Chromatic Pet Collection</Heading>
      <p>
        {collected} of {pets.length} collected
      </p>

      <ul className="pet-grid">
        {pets.map((pet) => {
          const sprite = getPetSprite(pet.id, pet.collected);
          const label = pet.collected
            ? `${pet.name} — from ${stationName(pet.originStationId)}`
            : `Locked pet — solve a puzzle in ${stationName(pet.originStationId)} to reveal`;
          return (
            <li key={pet.id} className="pet-grid__cell">
              <span
                className={`pet-grid__sprite${pet.collected ? "" : " pet-grid__sprite--locked"}`}
                role="img"
                aria-label={label}
                style={sprite.style}
              />
              <span className="pet-grid__name">{pet.collected ? pet.name : "???"}</span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
