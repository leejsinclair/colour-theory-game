import { useMemo, type ReactElement } from "react";
import { Button, Card, Heading } from "../design-system";
import { useProgress, usePets, useStations } from "../state/selectors";
import { useHashRoute } from "../app/useHashRoute";
import { PetGallery, type GalleryPet } from "../components/PetGallery";

/**
 * The finale (US1 functional). Preserved stats, the full pet roll, and the
 * return / review-practice actions. The +200 bonus is applied once by the
 * domain at unlock time. The distinctive certificate layout lands in US6 (T102).
 */
export function GrandCanvasScreen(): ReactElement {
  const progress = useProgress();
  const pets = usePets();
  const stations = useStations();
  const { navigate } = useHashRoute();

  const toStudio = (): void => navigate({ view: "studio" });

  const rollPets = useMemo<GalleryPet[]>(() => {
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
      <Heading level={1} size="hero">
        Grand Canvas
      </Heading>
      <p className="screen__lede">
        Every puzzle solved, every Chromatic Pet freed. Your progress is saved — revisit any station
        to review a lesson or practise.
      </p>

      <Card as="div">
        <p role="status">Puzzles solved: {progress.solved}</p>
        <p role="status">
          Pets rescued: {progress.petsCollected}/{pets.length}
        </p>
        <p role="status">Best streak: {progress.bestStreak}</p>
      </Card>

      <PetGallery pets={rollPets} label="Pet rescue roll" />


      <div className="screen__actions">
        <Button onClick={toStudio}>Return to Studio</Button>
        <Button variant="ghost" onClick={toStudio}>
          Review &amp; practise puzzles
        </Button>
      </div>
    </section>
  );
}
