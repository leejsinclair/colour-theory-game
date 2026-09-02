import { useMemo, type ReactElement } from "react";
import { Button, CelebrationBurst, Panel } from "../design-system";
import { PetBadge } from "./PetBadge";

/**
 * Brief, non-blocking success celebration (FR-033, FR-047, US4-1, US4-2).
 * A rotating line of encouragement, the freed pet, the score reason, and a
 * Continue action that is operable immediately — the colour burst is CSS/SVG,
 * `pointer-events: none`, and swaps to a static cluster under reduced motion
 * (delegated to `<CelebrationBurst>`).
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
  scoreReason: string;
  reducedMotion: boolean;
  onContinue: () => void;
  continueLabel?: string;
  /** Override the rotating encouragement (tests, special screens). */
  message?: string;
};

export function RewardReveal({
  petId,
  petName,
  scoreReason,
  reducedMotion,
  onContinue,
  continueLabel = "Continue",
  message,
}: RewardRevealProps): ReactElement {
  const headline = useMemo(
    () => message ?? pickEncouragement(petId ?? scoreReason),
    [message, petId, scoreReason],
  );

  return (
    <Panel tone="success" className="reward-reveal" role="status">
      <CelebrationBurst reducedMotion={reducedMotion} playKey={petId ?? scoreReason} />

      {petId && petName ? (
        <PetBadge
          petId={petId}
          name={petName}
          collected
          size="md"
          focusable={false}
          label={`${petName} collected`}
          className="reward-reveal__pet"
        />
      ) : null}

      <div className="reward-reveal__body">
        <p className="result-panel__heading">
          <span className="reward-reveal__icon" aria-hidden="true">
            ✓
          </span>{" "}
          {headline}
        </p>
        {petName ? (
          <p className="reward-reveal__pet-line">
            <span aria-hidden="true">✨</span> {petName} freed — added to your collection.
          </p>
        ) : null}
        <p>{scoreReason}</p>
        <div className="check-row">
          <Button onClick={onContinue}>{continueLabel}</Button>
        </div>
      </div>
    </Panel>
  );
}
