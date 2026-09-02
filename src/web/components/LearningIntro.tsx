import type { ReactElement } from "react";
import { Button, Card, Heading } from "../design-system";
import { puzzleLearningContent } from "../../content/puzzleLearningContent";

/**
 * Stage 1 of the learning gate (FR-016). Ports the intro card from the retired
 * `src/web/legacy/learningFlow.ts` into the React tree: title, illustration,
 * the two intro paragraphs, and the how-to-win / why-this-fails / key-terms
 * meta rows. "Start quiz" advances; "How this works" opens the info modal.
 */

export type LearningIntroProps = {
  puzzleId: string;
  onStartQuiz: () => void;
  onOpenInfo: () => void;
};

export function LearningIntro({ puzzleId, onStartQuiz, onOpenInfo }: LearningIntroProps): ReactElement | null {
  const learning = puzzleLearningContent[puzzleId];
  if (!learning) {
    return null;
  }

  return (
    <Card className="learning-card" aria-label={`Introduction: ${learning.title}`}>
      <Heading level={2}>{learning.title}</Heading>

      <div
        className="learning-card__illustration"
        aria-hidden="true"
        // Illustration markup is authored in-repo (content/puzzleLearningContent.ts),
        // not user input.
        dangerouslySetInnerHTML={{ __html: learning.illustrationSvg }}
      />

      {learning.intro.map((paragraph, index) => (
        <p key={index}>{paragraph}</p>
      ))}

      {learning.howToWin ? (
        <p>
          <strong>How to win:</strong> {learning.howToWin}
        </p>
      ) : null}
      {learning.whyFailed ? (
        <p>
          <strong>Why this fails:</strong> {learning.whyFailed}
        </p>
      ) : null}
      {learning.tooltips && learning.tooltips.length > 0 ? (
        <p>
          <strong>Key terms:</strong> {learning.tooltips.join(" · ")}
        </p>
      ) : null}

      <div className="check-row">
        <Button onClick={onStartQuiz}>Start quiz</Button>
        <Button variant="ghost" onClick={onOpenInfo}>
          How this works
        </Button>
      </div>
    </Card>
  );
}
