import { memo, useMemo, type ReactElement } from "react";
import { Button, CelebrationBurst, Heading, Panel } from "../design-system";
import { useProgress, usePets, useStations } from "../state/selectors";
import { useHashRoute } from "../app/useHashRoute";
import { useReducedMotion } from "../state/useReducedMotion";
import { PetGallery, type GalleryPet } from "../components/PetGallery";

/**
 * The finale (US1 functional, US6 visual). A certificate-style reward that reads
 * as clearly distinct from a puzzle screen while staying on the shared design
 * system: an award panel with a one-shot colour burst, the preserved stats, the
 * full pet roll through the shared `PetBadge`, saved-progress reassurance, and
 * the return / review-practise actions. The +200 bonus is applied once by the
 * domain at unlock time. Under reduced motion `CelebrationBurst` renders a
 * static cluster instead of the burst (FR-020, FR-040, FR-047, SC-009).
 */

function GrandCanvasScreenImpl(): ReactElement {
  const progress = useProgress();
  const pets = usePets();
  const stations = useStations();
  const { navigate } = useHashRoute();
  const reducedMotion = useReducedMotion();

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

  const stats: ReadonlyArray<{ key: string; value: string; caption: string }> = [
    { key: "solved", value: `${progress.solved}`, caption: `Puzzles solved: ${progress.solved}` },
    {
      key: "pets",
      value: `${progress.petsCollected}/${pets.length}`,
      caption: `Pets rescued: ${progress.petsCollected}/${pets.length}`,
    },
    { key: "streak", value: `${progress.bestStreak}`, caption: `Best streak: ${progress.bestStreak}` },
  ];

  return (
    <section className="screen grand-canvas">
      <Panel tone="success" className="grand-canvas__award">
        <CelebrationBurst reducedMotion={reducedMotion} playKey="grand-canvas" />
        <div className="grand-canvas__award-body">
          <p className="grand-canvas__eyebrow">Chromatic Mastery — complete</p>
          <Heading level={1} size="hero" className="grand-canvas__title">
            Grand Canvas
          </Heading>
          <p className="grand-canvas__lede">
            Every puzzle solved, every Chromatic Pet freed. The studio is yours.
          </p>

          <ul className="grand-canvas__stats">
            {stats.map((stat) => (
              <li key={stat.key} className="grand-canvas__stat">
                <span className="grand-canvas__stat-value" aria-hidden="true">
                  {stat.value}
                </span>
                <span className="grand-canvas__stat-caption" role="status">
                  {stat.caption}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </Panel>

      <div className="grand-canvas__roll">
        <Heading level={2} size="2">
          The Chromatic Pets
        </Heading>
        <PetGallery pets={rollPets} label="Pet rescue roll" />
      </div>

      <p className="grand-canvas__saved">
        Your progress is saved — every station is open now, so revisit any of them to review a lesson
        or practise a puzzle.
      </p>

      <div className="screen__actions">
        <Button onClick={toStudio}>Return to Studio</Button>
        <Button variant="ghost" onClick={toStudio}>
          Review &amp; practise puzzles
        </Button>
      </div>
    </section>
  );
}

/** Memoised: the app shell re-renders on every HUD/progress change (T106). */
export const GrandCanvasScreen = memo(GrandCanvasScreenImpl);
