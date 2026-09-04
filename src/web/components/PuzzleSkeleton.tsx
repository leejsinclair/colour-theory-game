import type { ReactElement } from "react";

/**
 * Suspense fallback while a puzzle's code-split chunk loads
 * (contracts/puzzle-component.md §PuzzlePlayer). Reserves vertical space so the
 * Check button below it does not jump.
 */
export function PuzzleSkeleton(): ReactElement {
  return (
    <div className="puzzle-skeleton" role="status" aria-live="polite">
      <span className="ds-visually-hidden">Loading puzzle…</span>
      <span className="puzzle-skeleton__bar" aria-hidden="true" />
      <span className="puzzle-skeleton__bar" aria-hidden="true" />
      <span className="puzzle-skeleton__bar" aria-hidden="true" />
    </div>
  );
}
