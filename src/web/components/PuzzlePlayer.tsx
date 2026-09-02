import { Suspense, useCallback, useRef, useState, type ReactElement } from "react";
import { CheckButton } from "./CheckButton";
import { PuzzleSkeleton } from "./PuzzleSkeleton";
import { puzzleComponents, initialInputFor } from "../puzzles";
import { useGameActions } from "../state/contexts";
import { useReducedMotion } from "../state/useReducedMotion";
import { announce } from "../design-system";
import type { SubmitResult, SubmitSuccess, FailureDiagnosis } from "../state/actions";

/**
 * Hosts a puzzle experience and owns the Check action
 * (contracts/puzzle-component.md §PuzzlePlayer, FR-006, FR-019).
 *
 * The puzzle body is a controlled `PuzzleComponent`: `<PuzzlePlayer>` owns the
 * answer (`useState(initialInputFor(...))`), passes it down as `value`, and
 * takes updates back through `onChange`. There is no `persistedState` bridge and
 * no DOM Check button — the real Check button lives in this subtree.
 */

export type PuzzlePlayerProps = {
  puzzleId: string;
  /** Learning gate not yet passed → controls + Check are inert. */
  disabled: boolean;
  practice?: boolean;
  onSolved: (result: SubmitSuccess) => void;
  onFailed: (diagnosis: FailureDiagnosis) => void;
};

export function PuzzlePlayer({
  puzzleId,
  disabled,
  practice = false,
  onSolved,
  onFailed,
}: PuzzlePlayerProps): ReactElement {
  const actions = useGameActions();
  const reducedMotion = useReducedMotion();
  const PuzzleView = puzzleComponents[puzzleId];

  const [value, setValue] = useState<unknown>(() => initialInputFor(puzzleId));
  const valueRef = useRef(value);
  valueRef.current = value;

  const pendingRef = useRef(false);
  const [pending, setPending] = useState(false);

  const handleChange = useCallback((next: unknown) => {
    valueRef.current = next;
    setValue(next);
  }, []);

  const submit = useCallback(() => {
    if (disabled || pendingRef.current) {
      return;
    }
    pendingRef.current = true;
    setPending(true);
    // Release the guard on the next microtask — the submit is synchronous; this
    // only debounces a burst of fast repeated clicks (Edge Cases).
    queueMicrotask(() => {
      pendingRef.current = false;
      setPending(false);
    });

    const result: SubmitResult = practice
      ? actions.practiceSubmit(puzzleId, valueRef.current)
      : actions.submitPuzzle(puzzleId, valueRef.current);

    if (result.ok) {
      if (practice) {
        announce(result.scoreEvent.reason);
      }
      onSolved(result);
    } else {
      onFailed(result.diagnosis);
    }
  }, [actions, disabled, onFailed, onSolved, practice, puzzleId]);

  return (
    <div className="puzzle-stage__play">
      {PuzzleView ? (
        <Suspense fallback={<PuzzleSkeleton />}>
          <PuzzleView
            value={value}
            onChange={handleChange}
            disabled={disabled}
            announce={announce}
            reducedMotion={reducedMotion}
          />
        </Suspense>
      ) : (
        <p role="alert">This puzzle could not be loaded.</p>
      )}
      <div className="check-row">
        <CheckButton disabled={disabled} pending={pending} onClick={submit} />
      </div>
    </div>
  );
}
