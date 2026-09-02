import type { ReactElement } from "react";
import { Heading } from "../design-system";
import { usePets } from "../state/selectors";

/**
 * Screen shell (T028). The pet grid lands in T050 (US1); the game-like gallery
 * redesign in T098 (US5).
 */
export function CollectionScreen(): ReactElement {
  const pets = usePets();
  const collected = pets.filter((pet) => pet.collected).length;

  return (
    <>
      <Heading level={1}>Chromatic Pet Collection</Heading>
      <p>
        {collected} of {pets.length} collected
      </p>
    </>
  );
}
