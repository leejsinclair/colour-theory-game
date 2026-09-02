import type { ReactElement } from "react";
import { Heading, Tag } from "../design-system";
import { useProgress, useStations } from "../state/selectors";

/**
 * Screen shell (T028) — wired to selector hooks. The station-card grid,
 * recommended-next and pet summary land in T041 (US1) / T061 (US2).
 */
export function StudioScreen(): ReactElement {
  const progress = useProgress();
  const stations = useStations();

  return (
    <>
      <Heading level={1} size="hero">
        Chromatic Mastery Studio
      </Heading>
      <p>
        {progress.solved} of {progress.total} puzzles solved · {progress.petsCollected} pets rescued
      </p>
      <ul>
        {stations.map((station) => (
          <li key={station.id}>
            {station.name} <Tag>{station.status}</Tag>{" "}
            <Tag>
              {station.solvedCount}/{station.puzzleCount}
            </Tag>
          </li>
        ))}
      </ul>
    </>
  );
}
