import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactElement,
} from "react";
import { Button, CelebrationBurst } from "../design-system";
import { PetBadge } from "./PetBadge";

/**
 * Full-screen success overlay (FR-033, FR-047, US4-1, US4-2): a clear "puzzle
 * complete" banner, the points earned, the freed pet, and a countdown that
 * auto-returns the player to the next place in the game. The colour burst is
 * CSS/SVG, `pointer-events: none`, and swaps to a static cluster under reduced
 * motion (delegated to `<CelebrationBurst>`); the countdown still runs under
 * reduced motion (it is information, not decoration) but its ring does not spin.
 *
 * In practice mode the countdown simply closes the overlay (returning to the
 * puzzle for another attempt) rather than navigating away; `autoReturnSeconds =
 * null` disables it entirely, leaving a manual dismiss only.
 */

const ENCOURAGEMENTS = [
  "Beautifully done.",
  "That's a clean solve.",
  "Your colour eye is sharpening.",
  "Masterful mix.",
  "The studio glows a little brighter.",
  "Spot on.",
];

function pickEncouragement(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  }
  return ENCOURAGEMENTS[Math.abs(hash) % ENCOURAGEMENTS.length];
}

export type RewardRevealProps = {
  petId: string | null;
  petName: string | null;
  /** Points awarded for this solve (`scoreEvent.delta`). */
  points: number;
  scoreReason: string;
  reducedMotion: boolean;
  onContinue: () => void;
  continueLabel?: string;
  /** Woven into the countdown copy: "Returning to <destinationLabel>…". */
  destinationLabel?: string;
  /** Seconds before the countdown auto-returns; `null` disables it. */
  autoReturnSeconds?: number | null;
  /** Override the rotating encouragement (tests, special screens). */
  message?: string;
};

export function RewardReveal({
  petId,
  petName,
  points,
  scoreReason,
  reducedMotion,
  onContinue,
  continueLabel = "Continue",
  destinationLabel = "the studio",
  autoReturnSeconds = 5,
  message,
}: RewardRevealProps): ReactElement {
  const headline = useMemo(
    () => message ?? pickEncouragement(petId ?? scoreReason),
    [message, petId, scoreReason],
  );

  const totalSeconds =
    typeof autoReturnSeconds === "number" && autoReturnSeconds > 0 ? autoReturnSeconds : 0;
  const [remaining, setRemaining] = useState(totalSeconds);
  const [paused, setPaused] = useState(false);
  const countingDown = totalSeconds > 0 && !paused;

  // Track the latest onContinue so ticking never restarts the timer.
  const continueRef = useRef(onContinue);
  useEffect(() => {
    continueRef.current = onContinue;
  }, [onContinue]);

  useEffect(() => {
    if (!countingDown) {
      return;
    }
    if (remaining <= 0) {
      continueRef.current();
      return;
    }
    const handle = setTimeout(() => setRemaining((n) => n - 1), 1000);
    return () => clearTimeout(handle);
  }, [countingDown, remaining]);

  const ringPct = totalSeconds > 0 ? Math.max(0, Math.min(1, remaining / totalSeconds)) * 100 : 0;

  return (
    <div className="reward-overlay">
      <div className="reward-overlay__card">
        <CelebrationBurst reducedMotion={reducedMotion} playKey={petId ?? scoreReason} />

        <div className="reward-overlay__status" role="status">
          <p className="reward-overlay__eyebrow">
            <span className="reward-overlay__icon" aria-hidden="true">
              ✓
            </span>{" "}
            Puzzle complete
          </p>

          {points > 0 ? (
            <p className="reward-overlay__points">
              <span className="reward-overlay__points-value">+{points}</span>
              <span className="reward-overlay__points-label">
                {points === 1 ? "point" : "points"}
              </span>
            </p>
          ) : null}

          {petId && petName ? (
            <PetBadge
              petId={petId}
              name={petName}
              collected
              size="md"
              focusable={false}
              label={`${petName} collected`}
              className="reward-overlay__pet"
            />
          ) : null}

          <div className="reward-overlay__body">
            <p className="result-panel__heading">{headline}</p>
            {petName ? (
              <p className="reward-overlay__pet-line">
                <span aria-hidden="true">✨</span> {petName} freed — added to your collection.
              </p>
            ) : null}
            <p>{scoreReason}</p>
          </div>
        </div>

        {countingDown ? (
          <p
            className="reward-overlay__countdown"
            aria-hidden="true"
            style={{ "--reward-ring": `${ringPct}%` } as CSSProperties}
          >
            <span className="reward-overlay__countdown-num">{Math.max(remaining, 0)}</span>
            Returning to {destinationLabel}…
          </p>
        ) : null}

        <div className="check-row reward-overlay__actions">
          <Button onClick={onContinue}>{continueLabel}</Button>
          {countingDown ? (
            <Button variant="ghost" onClick={() => setPaused(true)}>
              Stay here
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
