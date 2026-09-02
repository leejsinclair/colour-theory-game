import type { ReactElement } from "react";
import { Button, Card, Heading } from "../design-system";
import { puzzleLearningContent } from "../../content/puzzleLearningContent";

/**
 * Stage 1 of the learning gate (FR-016). The intro card: title, illustration,
 * a short "what you'll learn" lede, a compact goal line, and the key terms as a
 * definition list. "Why this fails" lives in the failure panel now — it is not
 * shown before the player has attempted anything. "Start quiz" advances; the
 * puzzle-screen nav row owns the single "How this works" affordance.
 */

export type LearningIntroProps = {
  puzzleId: string;
  onStartQuiz: () => void;
};

function splitTerm(entry: string): [string, string] {
  const idx = entry.indexOf(":");
  if (idx === -1) {
    return [entry, ""];
  }
  return [entry.slice(0, idx).trim(), entry.slice(idx + 1).trim()];
}

export function LearningIntro({ puzzleId, onStartQuiz }: LearningIntroProps): ReactElement | null {
  const learning = puzzleLearningContent[puzzleId];
  if (!learning) {
    return null;
  }

  const terms = (learning.tooltips ?? []).map(splitTerm).filter(([, def]) => def.length > 0);

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

      <div className="learning-card__lede">
        {learning.intro.map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>

      {learning.howToWin ? (
        <p className="learning-card__goal">
          <span className="learning-card__goal-label">Goal</span> {learning.howToWin}
        </p>
      ) : null}

      {terms.length > 0 ? (
        <dl className="learning-card__terms">
          {terms.map(([term, def]) => (
            <div key={term}>
              <dt>{term}</dt>
              <dd>{def}</dd>
            </div>
          ))}
        </dl>
      ) : null}

      <div className="check-row">
        <Button onClick={onStartQuiz}>Start quiz</Button>
      </div>
    </Card>
  );
}
