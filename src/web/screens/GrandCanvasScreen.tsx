import type { ReactElement } from "react";
import { Heading } from "../design-system";
import { useProgress, usePets } from "../state/selectors";
import { useHashRoute } from "../app/useHashRoute";
import { CompletionCertificate } from "../CompletionCertificate";

/**
 * The finale (US1 functional). Preserved stats, full pet roll, and the
 * return / review-practice actions via the existing `CompletionCertificate`.
 * The distinctive finale layout redesign lands in US6 (T102). The +200 bonus
 * is applied once by the domain at unlock time.
 */
export function GrandCanvasScreen(): ReactElement {
  const progress = useProgress();
  const pets = usePets();
  const { navigate } = useHashRoute();

  const toStudio = (): void => navigate({ view: "studio" });

  return (
    <section className="screen">
      <Heading level={1} size="hero">
        Grand Canvas
      </Heading>
      <CompletionCertificate
        solvedPuzzleCount={progress.solved}
        petsCollected={progress.petsCollected}
        totalPets={pets.length}
        bestStreak={progress.bestStreak}
        unlockedPetIds={pets.filter((pet) => pet.collected).map((pet) => pet.id)}
        onReturn={toStudio}
        onReviewPractice={toStudio}
      />
    </section>
  );
}
