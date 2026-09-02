import { useEffect, type ReactElement } from "react";
import { Button, Panel } from "../design-system";
import { announce } from "../design-system";
import type { FailureDiagnosis } from "../state/actions";

/**
 * The Result Analysis surface (FR-017, FR-034, FR-036). Consumes the ordered
 * `diagnose.ts` / `failureReasons.ts` output already built into the
 * `FailureDiagnosis`. State is carried by an icon + the leading word, never
 * colour alone (FR-035). Announced through the app live region.
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
    announce(`Not quite. ${explanations[0]}`);
  }, [explanations]);

  return (
    <Panel tone="failure" className="result-panel" role="alert">
      <p className="result-panel__heading">
        <span aria-hidden="true">✗</span> Not quite
      </p>
      <ul className="result-panel__list">
        {explanations.map((text, index) => (
          <li key={index}>{text}</li>
        ))}
      </ul>
      <div className="check-row">
        <Button variant="secondary" onClick={onRetry}>
          Try again
        </Button>
      </div>
    </Panel>
  );
}
