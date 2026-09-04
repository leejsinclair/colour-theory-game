import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
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
 * In practice mode the countdown navigates away (back to the puzzle list) by
 * default, same as elsewhere; "Stay here" (`onStay`) is what returns to the
 * puzzle for another attempt instead of just pausing. `autoReturnSeconds =
 * null` disables the countdown entirely, leaving a manual dismiss only.
 *
 * The card is a modal dialog (`role="dialog"`, `aria-modal`): focus moves to
 * Continue on mount, Tab is trapped inside the card, Escape stops the countdown
 * (or continues when there is none), and focus is restored to the triggering
 * element on unmount (FR a11y — WCAG 2.1.2 / 2.4.3).
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
  /** Overrides "Stay here": called instead of pausing the countdown. */
  onStay?: () => void;
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
  onStay,
  destinationLabel = "the studio",
  autoReturnSeconds = 9,
  message,
}: RewardRevealProps): ReactElement {
  const headline = useMemo(
    () => message ?? pickEncouragement(petId ?? scoreReason),
    [message, petId, scoreReason],
  );

  const cardRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

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

  const stayHere = useCallback(() => {
    if (onStay) {
      onStay();
      return;
    }
    setPaused(true);
  }, [onStay]);

  // Modal focus: move focus in on mount, restore it on unmount.
  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const focusTarget = cardRef.current?.querySelector<HTMLElement>(
      "button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])",
    );
    focusTarget?.focus();
    return () => previouslyFocused?.focus?.();
  }, []);

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>): void => {
    if (event.key === "Escape") {
      event.preventDefault();
      if (countingDown) {
        stayHere();
      } else {
        onContinue();
      }
      return;
    }
    if (event.key !== "Tab") {
      return;
    }
    const focusable = Array.from(
      cardRef.current?.querySelectorAll<HTMLElement>(
        "button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])",
      ) ?? [],
    ).filter((el) => !el.hasAttribute("disabled"));
    if (focusable.length === 0) {
      return;
    }
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement;
    if (event.shiftKey && active === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  };

  return (
    <div className="reward-overlay">
      {countingDown ? (
        <p className="ds-visually-hidden" role="status">
          Returning to {destinationLabel} in {totalSeconds} seconds. Select “Stay here” to remain.
        </p>
      ) : null}
      <div
        ref={cardRef}
        className="reward-overlay__card"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onKeyDown={handleKeyDown}
      >
        <CelebrationBurst reducedMotion={reducedMotion} playKey={petId ?? scoreReason} />

        <div className="reward-overlay__status" role="status">
          <p className="reward-overlay__eyebrow" id={titleId}>
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
            <Button variant="ghost" onClick={stayHere}>
              Stay here
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
