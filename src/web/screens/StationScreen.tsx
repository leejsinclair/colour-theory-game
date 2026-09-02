import type { ReactElement } from "react";
import { Badge, Button, Card, Heading } from "../design-system";
import { useStation, useStations } from "../state/selectors";
import { useSession } from "../state/contexts";
import { useHashRoute } from "../app/useHashRoute";

/**
 * A station's puzzle list (US1 functional). "Back to Studio", per-puzzle
 * Play / Continue / Practice, and a "Go to <next station>" CTA once every
 * puzzle here is solved (FR-024, FR-027). Distinctive station art lands in US2.
 */

export function StationScreen({ stationId }: { stationId: string }): ReactElement {
  const station = useStation(stationId);
  const stations = useStations();
  const { dispatch } = useSession();
  const { navigate } = useHashRoute();

  if (!station) {
    return (
      <section className="screen">
        <Heading level={1}>Station</Heading>
        <Button variant="ghost" onClick={() => navigate({ view: "studio" })}>
          Back to Studio
        </Button>
      </section>
    );
  }

  const index = stations.findIndex((s) => s.id === station.id);
  const nextStation = stations.slice(index + 1).find((s) => s.status !== "locked");

  const openPuzzle = (puzzleId: string, practice: boolean): void => {
    dispatch(practice ? { type: "ENTER_PRACTICE", puzzleId } : { type: "EXIT_PRACTICE" });
    navigate({ view: "puzzle", stationId: station.id, puzzleId });
  };

  return (
    <section className="screen">
      <Heading level={1}>{station.name}</Heading>
      <div className="screen__actions">
        <Button variant="ghost" onClick={() => navigate({ view: "studio" })}>
          Back to Studio
        </Button>
      </div>

      <ul className="puzzle-list">
        {station.puzzles.map((puzzle) => (
          <li key={puzzle.id}>
            <Card as="div" className="puzzle-row">
              <span className="puzzle-row__title">
                <Heading level={2} size="3">
                  {puzzle.title}
                </Heading>
                {puzzle.state === "solved" ? (
                  <Badge tone="success" icon={<span aria-hidden="true">✓</span>}>
                    Solved
                  </Badge>
                ) : puzzle.state === "locked" ? (
                  <Badge tone="locked" icon={<span aria-hidden="true">🔒</span>}>
                    Locked
                  </Badge>
                ) : null}
              </span>
              {puzzle.state === "locked" ? (
                <span>Locked</span>
              ) : puzzle.state === "solved" ? (
                <Button variant="secondary" onClick={() => openPuzzle(puzzle.id, true)}>
                  Practice {puzzle.title}
                </Button>
              ) : (
                <Button onClick={() => openPuzzle(puzzle.id, false)}>Play {puzzle.title}</Button>
              )}
            </Card>
          </li>
        ))}
      </ul>

      {station.status === "complete" && nextStation ? (
        <div className="screen__actions">
          <Button onClick={() => navigate({ view: "station", stationId: nextStation.id })}>
            Go to {nextStation.name}
          </Button>
        </div>
      ) : null}
    </section>
  );
}
