import React from "react";
import { ALL_PET_IDS, createPetSpriteDiv } from "./petSprites";

type CompletionCertificateProps = {
  solvedPuzzleCount: number;
  petsCollected: number;
  totalPets: number;
  bestStreak: number;
  unlockedPetIds: string[];
  onReturn: () => void;
  onReviewPractice: () => void;
};

const confettiPalette = ["#F96E5B", "#3F9AAE", "#F0B429", "#2F9E44", "#1f2030"];
const confettiPieces = Array.from({ length: 28 }, (_, index) => ({
  left: `${2 + index * 3.5}%`,
  delay: `${(index % 7) * 0.18}s`,
  duration: `${3.2 + (index % 6) * 0.28}s`,
  rotate: `${-52 + (index % 9) * 13}deg`,
  color: confettiPalette[index % confettiPalette.length],
}));

type CertificatePetSlotProps = {
  petId: string;
  collected: boolean;
};

function CertificatePetSlot({ petId, collected }: CertificatePetSlotProps): React.ReactElement {
  const slotRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    const slot = slotRef.current;
    if (!slot) {
      return;
    }

    slot.replaceChildren();
    const sprite = createPetSpriteDiv(petId, collected, { includeLabel: true });
    sprite.classList.add("completion-certificate__pet-sprite");
    slot.appendChild(sprite);

    return () => {
      slot.replaceChildren();
    };
  }, [collected, petId]);

  return <div className="completion-certificate__pet-slot" ref={slotRef} />;
}

export function CompletionCertificate({
  solvedPuzzleCount,
  petsCollected,
  totalPets,
  bestStreak,
  unlockedPetIds,
  onReturn,
  onReviewPractice,
}: CompletionCertificateProps): React.ReactElement {
  const unlockedPetIdSet = React.useMemo(() => new Set(unlockedPetIds), [unlockedPetIds]);

  return (
    <div className="puzzle-item completion-certificate" aria-label="Completion certificate">
      <div className="completion-certificate__confetti" aria-hidden="true">
        {confettiPieces.map((piece, index) => (
          <span
            key={`${piece.left}-${index}`}
            className="completion-certificate__confetti-piece"
            style={{
              ["--confetti-left" as string]: piece.left,
              ["--confetti-delay" as string]: piece.delay,
              ["--confetti-duration" as string]: piece.duration,
              ["--confetti-rotate" as string]: piece.rotate,
              ["--confetti-color" as string]: piece.color,
            }}
          />
        ))}
      </div>

      <h3 className="completion-certificate__title">Grand Canvas Unlocked</h3>

      <p className="completion-certificate__subtitle">
        Congratulations. You solved every puzzle and rescued every pet in Chromatic Mastery.
      </p>

      <div className="completion-certificate__stats">
        <div className="completion-certificate__stat">
          <span className="completion-certificate__stat-label">Puzzles Solved</span>
          <strong className="completion-certificate__stat-value">{solvedPuzzleCount}</strong>
        </div>
        <div className="completion-certificate__stat">
          <span className="completion-certificate__stat-label">Pets Rescued</span>
          <strong className="completion-certificate__stat-value">{petsCollected}/{totalPets}</strong>
        </div>
        <div className="completion-certificate__stat">
          <span className="completion-certificate__stat-label">Best Streak</span>
          <strong className="completion-certificate__stat-value">{bestStreak}</strong>
        </div>
      </div>

      <p className="completion-certificate__pet-header">Pet Rescue Roll</p>

      <div className="completion-certificate__pet-grid">
        {ALL_PET_IDS.map((petId) => (
          <CertificatePetSlot key={petId} petId={petId} collected={unlockedPetIdSet.has(petId)} />
        ))}
      </div>

      <div className="completion-certificate__actions">
        <button type="button" className="btn btn-secondary" onClick={onReturn}>
          Return
        </button>
        <button
          type="button"
          className="btn btn-primary"
          aria-label="Review and practice previously solved puzzles"
          onClick={onReviewPractice}
        >
          Review &amp; Practice Puzzles
        </button>
      </div>

      <p className="completion-certificate__footer">
        Your progress is saved. Re-enter any station to review learning cards or practice solved puzzles anytime.
      </p>
    </div>
  );
}