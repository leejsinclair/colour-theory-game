import { type ReactElement } from "react";
import { Button, CelebrationBurst, Panel } from "../design-system";
import { getPetSprite } from "../petSprites";

/**
 * Brief, non-blocking success celebration (FR-033). Pet reveal + encouraging
 * copy + Continue. The colour burst is CSS/SVG and swaps to a static cluster
 * under reduced motion (delegated to `<CelebrationBurst>`). Polished in US4.
 */

export type RewardRevealProps = {
  petId: string | null;
  petName: string | null;
  scoreReason: string;
  message: string;
  reducedMotion: boolean;
  onContinue: () => void;
  continueLabel?: string;
};

export function RewardReveal({
  petId,
  petName,
  scoreReason,
  message,
  reducedMotion,
  onContinue,
  continueLabel = "Continue",
}: RewardRevealProps): ReactElement {
  const sprite = petId ? getPetSprite(petId, true) : null;

  return (
    <Panel tone="success" className="reward-reveal" role="status">
      <CelebrationBurst reducedMotion={reducedMotion} playKey={petId ?? scoreReason} />

      {sprite && petName ? (
        <span
          className="reward-reveal__pet"
          role="img"
          aria-label={`${petName} collected`}
          style={sprite.style}
        />
      ) : null}

      <div>
        <p className="result-panel__heading">
          <span aria-hidden="true">✓</span> {message}
        </p>
        <p>{scoreReason}</p>
        <div className="check-row">
          <Button onClick={onContinue}>{continueLabel}</Button>
        </div>
      </div>
    </Panel>
  );
}
