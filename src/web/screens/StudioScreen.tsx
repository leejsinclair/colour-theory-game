import type { ReactElement } from "react";
import { Badge, Button, Card, Heading, Tag } from "../design-system";
import { useProgress, useRecommendedNext, useStations, usePets } from "../state/selectors";
import { useHashRoute } from "../app/useHashRoute";
import type { Route } from "../app/routes";
import type { RecommendedNext } from "../state/gameStore";

/**
 * The Studio hub — functional in US1 (station list, enter/continue, a
 * recommended-next line, pet summary). The game-world card redesign and
 * `StudioBackdrop` treatment land in US2 (T059–T062).
 */

function recommendedRoute(rec: RecommendedNext): Route | null {
  switch (rec.kind) {
    case "station":
      return { view: "station", stationId: rec.stationId };
    case "puzzle":
      return { view: "puzzle", stationId: rec.stationId, puzzleId: rec.puzzleId };
    case "grand-canvas":
      return { view: "grand-canvas" };
    default:
      return null;
  }
}

export function StudioScreen(): ReactElement {
  const progress = useProgress();
  const stations = useStations();
  const pets = usePets();
  const recommended = useRecommendedNext();
  const { navigate } = useHashRoute();

  const recRoute = recommendedRoute(recommended);

  return (
    <section className="screen">
      <Heading level={1} size="hero">
        Chromatic Mastery Studio
      </Heading>
      <p className="screen__lede">
        A midnight studio of colour machines. Solve puzzles to free Chromatic Pets and relight each
        station.
      </p>
      <p>
        {progress.solved} of {progress.total} puzzles solved · {pets.filter((p) => p.collected).length}{" "}
        of {pets.length} pets rescued
      </p>

      {recRoute ? (
        <p>
          <Button variant="secondary" onClick={() => navigate(recRoute)}>
            Recommended: {recommended.label}
          </Button>
        </p>
      ) : (
        <p>{recommended.label}</p>
      )}

      <div className="station-grid">
        {stations.map((station) => {
          const locked = station.status === "locked";
          const started = station.solvedCount > 0 && !locked;
          return (
            <Card key={station.id} interactive={!locked}>
              <Heading level={2} size="3">
                {station.name}
              </Heading>
              <p>
                <Tag>
                  {station.solvedCount}/{station.puzzleCount} solved
                </Tag>{" "}
                {station.status === "complete" ? (
                  <Badge tone="success" icon={<span aria-hidden="true">✓</span>}>
                    Complete
                  </Badge>
                ) : locked ? (
                  <Badge tone="locked" icon={<span aria-hidden="true">🔒</span>}>
                    Locked
                  </Badge>
                ) : null}
              </p>
              {locked ? (
                <p>Locked — finish previous stations</p>
              ) : (
                <Button onClick={() => navigate({ view: "station", stationId: station.id })}>
                  {started ? `Continue ${station.name}` : `Enter ${station.name}`}
                </Button>
              )}
            </Card>
          );
        })}
      </div>

      <p>
        <Button variant="ghost" onClick={() => navigate({ view: "collection" })}>
          View pet collection
        </Button>
      </p>
    </section>
  );
}
