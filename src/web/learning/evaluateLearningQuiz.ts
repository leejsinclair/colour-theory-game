import type { LearningQuizQuestion } from "../../content/puzzleLearningContent";

/**
 * Pure learning-quiz scorer (was in the retired `src/web/legacy/learningFlow.ts`).
 * A pass requires every answer correct — the 100% gate in FR-016. Unit-tested in
 * `tests/learningFlow.test.ts`.
 */
export function evaluateLearningQuiz(
  questions: LearningQuizQuestion[],
  selections: number[],
): { passed: boolean; score: number; outOf: number; feedback: string } {
  let correct = 0;
  for (let i = 0; i < questions.length; i += 1) {
    if (selections[i] === questions[i].correctIndex) {
      correct += 1;
    }
  }

  const passed = correct === questions.length;
  const feedback = passed
    ? `Perfect score: ${correct}/${questions.length}. Puzzle unlocked.`
    : `Score ${correct}/${questions.length}. You need 100% to unlock this puzzle.`;

  return { passed, score: correct, outOf: questions.length, feedback };
}
