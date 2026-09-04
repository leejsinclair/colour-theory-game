import { useState, type ReactElement } from "react";
import { Button, Card, Heading } from "../design-system";
import { puzzleLearningContent } from "../../content/puzzleLearningContent";
import { evaluateLearningQuiz } from "../learning/evaluateLearningQuiz";

/**
 * Stage 2 of the learning gate (FR-016, US3-2). A 100%-correct pass is required;
 * a failed attempt reveals the per-question explanation tips and can be retried
 * or backed out of. `onPass` is called once, then `<PuzzleScreen>` records the
 * quiz pass through `actions.recordQuizPass`.
 */

export type LearningQuizProps = {
  puzzleId: string;
  onPass: () => void;
  onBack: () => void;
  announce: (message: string) => void;
};

export function LearningQuiz({
  puzzleId,
  onPass,
  onBack,
  announce,
}: LearningQuizProps): ReactElement | null {
  const learning = puzzleLearningContent[puzzleId];
  const questionCount = learning?.quiz.length ?? 0;
  const [selections, setSelections] = useState<number[]>(() => new Array(questionCount).fill(-1));
  const [feedback, setFeedback] = useState("");
  const [showExplanations, setShowExplanations] = useState(false);

  if (!learning) {
    return null;
  }

  const choose = (questionIndex: number, optionIndex: number): void => {
    setSelections((prev) => {
      const next = [...prev];
      next[questionIndex] = optionIndex;
      return next;
    });
  };

  const submit = (): void => {
    if (selections.some((value) => value < 0)) {
      setFeedback("Answer every question before submitting.");
      announce("Answer every question before submitting.");
      return;
    }

    const result = evaluateLearningQuiz(learning.quiz, selections);
    setFeedback(result.feedback);
    setShowExplanations(true);
    announce(result.feedback);

    if (result.passed) {
      onPass();
    }
  };

  return (
    <Card className="learning-card" aria-label={`Quiz: ${learning.title}`}>
      <Heading level={2}>Quiz: {learning.title}</Heading>

      {learning.quiz.map((question, questionIndex) => (
        <fieldset key={questionIndex} className="learning-quiz__question">
          <legend>
            {questionIndex + 1}. {question.prompt}
          </legend>
          {question.options.map((option, optionIndex) => (
            <label key={optionIndex} className="learning-quiz__option">
              <input
                type="radio"
                name={`${puzzleId}-q-${questionIndex}`}
                checked={selections[questionIndex] === optionIndex}
                onChange={() => choose(questionIndex, optionIndex)}
              />
              <span>{option}</span>
            </label>
          ))}
          {showExplanations ? (
            <p className="learning-quiz__explanation">Tip: {question.explanation}</p>
          ) : null}
        </fieldset>
      ))}

      <div className="check-row">
        <Button onClick={submit}>Submit quiz</Button>
        <Button variant="ghost" onClick={onBack}>
          Back to intro
        </Button>
      </div>

      <p className="learning-quiz__feedback" role="status">
        {feedback || "Get every answer correct to unlock puzzle play."}
      </p>
    </Card>
  );
}
