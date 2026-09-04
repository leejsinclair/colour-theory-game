import { useEffect, type ReactElement } from "react";
import { Button, Panel } from "../design-system";
import { announce } from "../design-system";
import type { FailureDiagnosis } from "../state/actions";

/**
 * The Result Analysis surface (FR-017, FR-034, FR-036). Consumes the ordered
 * `diagnose.ts` / `failureReasons.ts` output already built into the
 * `FailureDiagnosis`. Every state carries an icon + a leading word + its own
 * shape (a bordered failure panel), never colour alone (FR-035). The specific
 * colour-theory principle to revisit is named at the top, and the whole result
 * is pushed through the app live region.
 */

export type ResultPanelProps = {
  diagnosis: FailureDiagnosis;
  onRetry: () => void;
};

export function ResultPanel({ diagnosis, onRetry }: ResultPanelProps): ReactElement {
  const explanations =
    diagnosis.explanations.length > 0
      ? diagnosis.explanations
      : ["That's not quite right yet — adjust your answer and try again."];

  useEffect(() => {
    const lead = diagnosis.explanations[0] ?? "Adjust your answer and try again.";
    announce(
      diagnosis.principle
        ? `Not quite. Principle to revisit: ${diagnosis.principle}. ${lead}`
        : `Not quite. ${lead}`,
    );
  }, [diagnosis]);

  return (
    <Panel tone="failure" className="result-panel" role="alert">
      <p className="result-panel__heading">
        <span className="result-panel__icon" aria-hidden="true">
          ✗
        </span>{" "}
        Not quite
      </p>

      {diagnosis.principle ? (
        <p className="result-panel__principle">
          <span aria-hidden="true">🎯</span> Principle to revisit:{" "}
          <strong>{diagnosis.principle}</strong>
        </p>
      ) : null}

      <ul className="result-panel__list">
        {explanations.map((text, index) => (
          <li key={index}>{text}</li>
        ))}
      </ul>

      <div className="check-row">
        <Button variant="ghost" onClick={onRetry}>
          Try again
        </Button>
      </div>
    </Panel>
  );
}
