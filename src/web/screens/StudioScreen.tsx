import { memo, useCallback, type ReactElement } from "react";
import { Button, Heading, ProgressBar } from "../design-system";
import { useProgress, useStations, usePets } from "../state/selectors";
import { useHashRoute } from "../app/useHashRoute";
import { StationCard } from "../components/StationCard";
import { RecommendedNext } from "../components/RecommendedNext";

/**
 * The Studio hub (US2, FR-028) — a game-world lobby that orients a player in
 * seconds: premise, overall completion, a recommended next activity, and the
 * seven stations as distinctive cards. The ambient `StudioBackdrop` is mounted
 * once at the app shell (T025/T027).
 */

function StudioScreenImpl(): ReactElement {
  const progress = useProgress();
  const stations = useStations();
  const pets = usePets();
  const { navigate } = useHashRoute();

  const petsCollected = pets.filter((pet) => pet.collected).length;
  const enterStation = useCallback(
    (stationId: string) => navigate({ view: "station", stationId }),
    [navigate],
  );

  return (
    <section className="screen studio">
      <header className="studio__hero">
        <p className="studio__eyebrow">Magical Artist's Studio · Colour Laboratory</p>
        <Heading level={1} size="hero">
          Chromatic Mastery Studio
        </Heading>
        <p className="screen__lede">
          A midnight studio of glowing colour machines. Solve their puzzles to free the
          Chromatic Pets and relight every station.
        </p>

        <div className="studio__progress">
          <ProgressBar label="Overall completion" value={progress.solved} max={progress.total} />
          <p>
            {progress.solved} of {progress.total} puzzles solved · {petsCollected} of {pets.length}{" "}
            pets rescued
          </p>
        </div>

        <RecommendedNext />
      </header>

      <div className="station-grid">
        {stations.map((station, index) => (
          <StationCard
            key={station.id}
            station={station}
            index={index}
            onEnter={enterStation}
          />
        ))}
      </div>

      <p>
        <Button variant="ghost" onClick={() => navigate({ view: "collection" })}>
          View pet collection
        </Button>
      </p>
    </section>
  );
}

/** Memoised: the app shell re-renders on every HUD/progress change (T106). */
export const StudioScreen = memo(StudioScreenImpl);
