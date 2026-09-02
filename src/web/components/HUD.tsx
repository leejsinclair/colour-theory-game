import { memo, type ReactElement } from "react";
import { Badge, TrophyIcon, PetsIcon, AutoAwesomeIcon } from "../design-system";
import { useProgress, usePets } from "../state/selectors";
import { AppMenu } from "./AppMenu";

/**
 * The persistent player HUD (FR-015, FR-030, FR-035, SC-002). Brand + app menu
 * on the top line, then puzzles / score / pets / streak at a glance, plus the
 * earned pet-milestone badges (icon + label, never colour alone). Simplifies —
 * not shrinks — on small screens (the streak tile drops out, values step down).
 */

const MILESTONE_ICON: Record<string, ReactElement> = {
  "Color Apprentice": <AutoAwesomeIcon size={14} />,
  "Palette Keeper": <PetsIcon size={14} />,
  "Chromatic Master": <TrophyIcon size={14} />,
};

function HUDImpl(): ReactElement {
  const progress = useProgress();
  const pets = usePets();
  const petsTotal = pets.length;

  return (
    <div className="hud">
      <div className="hud__top">
        <a className="hud__brand" href="#/studio">
          Chromatic Mastery
        </a>
        <AppMenu />
      </div>

      <div className="hud__stats">
        <p className="hud__stat" role="status">
          <span className="hud__stat-value">
            {progress.solved}/{progress.total}
          </span>
          <span className="hud__stat-label">
            Puzzles solved: {progress.solved} of {progress.total}
          </span>
        </p>

        <p className="hud__stat" role="status">
          <span className="hud__stat-value">{progress.score}</span>
          <span className="hud__stat-label">Score</span>
        </p>

        <p className="hud__stat" role="status">
          <span className="hud__stat-value">
            {progress.petsCollected}/{petsTotal}
          </span>
          <span className="hud__stat-label">Pets collected: {progress.petsCollected} of {petsTotal}</span>
        </p>

        {progress.currentStreak > 0 ? (
          <p className="hud__stat" role="status">
            <span className="hud__stat-value">{progress.currentStreak}</span>
            <span className="hud__stat-label">Streak: {progress.currentStreak}</span>
          </p>
        ) : null}
      </div>

      {progress.petMilestonesUnlocked.length > 0 ? (
        <ul className="hud__milestones" aria-label="Milestones unlocked">
          {progress.petMilestonesUnlocked.map((badge) => (
            <li key={badge}>
              <Badge tone="gold" icon={MILESTONE_ICON[badge]}>
                {badge}
              </Badge>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

/** Memoised: subscribes to its own progress slice, so route changes alone don't re-render it (T106). */
export const HUD = memo(HUDImpl);
