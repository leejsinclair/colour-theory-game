import type { ReactElement } from "react";
import { Heading } from "../design-system";
import { usePuzzle } from "../state/selectors";

/**
 * Screen shell (T028). The learning-stage reducer, `LearningIntro` →
 * `LearningQuiz` → `PuzzlePlayer` flow and "How this works" modal land in
 * T044 (US1).
 */
export function PuzzleScreen({
  puzzleId,
}: {
  stationId: string;
  puzzleId: string;
}): ReactElement {
  const puzzle = usePuzzle(puzzleId);

  return (
    <>
      <Heading level={1}>{puzzle?.title ?? "Puzzle"}</Heading>
    </>
  );
}
