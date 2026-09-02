import { useCallback, useRef, useState, type ReactElement } from "react";
import { LegacyPuzzleAdapter } from "./LegacyPuzzleAdapter";
import { CheckButton } from "./CheckButton";
import { useGameActions } from "../state/contexts";
import { announce } from "../design-system";
import type { SubmitResult, SubmitSuccess, FailureDiagnosis } from "../state/actions";

/**
 * Hosts a puzzle experience and owns the Check action (contracts/puzzle-component.md
 * §PuzzlePlayer, FR-006, FR-019).
 *
 * In US1 the puzzle body still comes from `<LegacyPuzzleAdapter>`, which forwards
 * the legacy view's current-answer factory up via `onInputFactory`. US3 (T079)
 * swaps that for a native `<PuzzleComponent value onChange … />`. Either way the
 * real Check button lives in this subtree.
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
  const inputFactoryRef = useRef<(() => unknown) | null>(null);
  const pendingRef = useRef(false);
  const [pending, setPending] = useState(false);

  const handleInputFactory = useCallback((factory: () => unknown) => {
    inputFactoryRef.current = factory;
  }, []);

  const submit = useCallback(() => {
    if (disabled || pendingRef.current) {
      return;
    }
    const input = inputFactoryRef.current ? inputFactoryRef.current() : undefined;

    pendingRef.current = true;
    setPending(true);
    // Release the guard on the next frame — the submit itself is synchronous,
    // this only debounces a burst of fast repeated clicks (Edge Cases).
    queueMicrotask(() => {
      pendingRef.current = false;
      setPending(false);
    });

    const result: SubmitResult = practice
      ? actions.practiceSubmit(puzzleId, input)
      : actions.submitPuzzle(puzzleId, input);

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
      <LegacyPuzzleAdapter
        puzzleId={puzzleId}
        state={practice ? "solved" : "available"}
        onInputFactory={handleInputFactory}
      />
      <div className="check-row">
        <CheckButton disabled={disabled} pending={pending} onClick={submit} />
      </div>
    </div>
  );
}
