import type { ReactElement } from "react";
import { Heading } from "../design-system";
import { useProgress } from "../state/selectors";

/**
 * Screen shell (T028). Stats, full pet roll and return/review actions land in
 * T049 (US1); the distinctive finale layout in T102 (US6).
 */
export function GrandCanvasScreen(): ReactElement {
  const progress = useProgress();

  return (
    <>
      <Heading level={1} size="hero">
        Grand Canvas
      </Heading>
      <p>
        Puzzles solved: {progress.solved} · Pets rescued: {progress.petsCollected} · Best streak:{" "}
        {progress.bestStreak}
      </p>
    </>
  );
}
