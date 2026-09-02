import { memo, type CSSProperties, type ReactElement } from "react";
import { Badge, Button, Card, Heading, ProgressRing, Tag } from "../design-system";
import type { BadgeTone } from "../design-system";
import type { StationSnapshot, StationStatus } from "../state/gameStore";
import { stationPresentation } from "../content/stationPresentation";

/**
 * A station rendered as a game-world card (US2, FR-029, FR-035): identity,
 * blurb, per-station hue, puzzle count, a progress ring, and a lock/complete
 * treatment that always pairs an icon with text — never colour alone. Locked
 * cards state the reason and expose no navigation control.
 */

export type StationCardProps = {
  station: StationSnapshot;
  /** 0-based position in the station list, for the fallback hue. */
  index: number;
  /** Passed the station id so the parent can hold one stable callback (T106). */
  onEnter: (stationId: string) => void;
};

const STATE_META: Record<
  StationStatus,
  { icon: string; label: string; tone: BadgeTone }
> = {
  locked: { icon: "🔒", label: "Locked", tone: "locked" },
  available: { icon: "✦", label: "Ready to play", tone: "default" },
  "in-progress": { icon: "◐", label: "In progress", tone: "default" },
  complete: { icon: "✓", label: "Complete", tone: "success" },
};

function StationCardImpl({ station, index, onEnter }: StationCardProps): ReactElement {
  const { blurb, accentVar } = stationPresentation(station.id, index);
  const meta = STATE_META[station.status];
  const locked = station.status === "locked";
  const started = station.status === "in-progress" || station.status === "complete";
  const headingId = `station-card-${station.id}`;

  return (
    <Card
      as="article"
      className="station-card"
      interactive={!locked}
      aria-labelledby={headingId}
      style={{ "--station-accent": `var(${accentVar})` } as CSSProperties}
    >
      <div className="station-card__top">
        <Tag>{station.puzzleCount} puzzles</Tag>
        <Badge tone={meta.tone} icon={<span aria-hidden="true">{meta.icon}</span>}>
          {meta.label}
        </Badge>
      </div>

      <Heading level={2} size="3" id={headingId}>
        {station.name}
      </Heading>
      <p className="station-card__blurb">{blurb}</p>

      <div className="station-card__progress">
        <ProgressRing
          label={`${station.name} progress`}
          value={station.solvedCount}
          max={station.puzzleCount}
          size={44}
          centerLabel={`${station.solvedCount}/${station.puzzleCount}`}
        />
        <span>
          {station.solvedCount} of {station.puzzleCount} solved
        </span>
      </div>

      {locked ? (
        <p className="station-card__locked">
          <span aria-hidden="true">🔒</span> Locked — finish previous stations
        </p>
      ) : (
        <Button onClick={() => onEnter(station.id)} block>
          {started ? `Continue ${station.name}` : `Enter ${station.name}`}
        </Button>
      )}
    </Card>
  );
}

/** Memoised: the station list re-renders on every progress change (T106). */
export const StationCard = memo(StationCardImpl);
