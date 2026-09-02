import type { ReactElement } from "react";
import { Heading, Tag } from "../design-system";
import { useStation } from "../state/selectors";

/**
 * Screen shell (T028). The puzzle list/map, "Back to Studio" and next-station
 * CTA land in T042 (US1).
 */
export function StationScreen({ stationId }: { stationId: string }): ReactElement {
  const station = useStation(stationId);

  return (
    <>
      <Heading level={1}>{station?.name ?? "Station"}</Heading>
      <ul>
        {station?.puzzles.map((puzzle) => (
          <li key={puzzle.id}>
            {puzzle.title} <Tag>{puzzle.state}</Tag>
          </li>
        ))}
      </ul>
    </>
  );
}
