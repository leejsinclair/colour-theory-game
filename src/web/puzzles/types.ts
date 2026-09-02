import type { ComponentType } from "react";

/**
 * Contract: PuzzleComponent (contracts/puzzle-component.md).
 *
 * Every playable puzzle is a controlled React component satisfying this shape.
 * There is no `persistedState` bridge, no `createRoot`-per-puzzle, no
 * `addCheckButton`, no DOM queries and no domain imports — the component's only
 * channel out is `onChange`, and `<PuzzlePlayer>` owns the Check action.
 */

export type PuzzleComponentProps<TInput = unknown> = {
  /** Current answer. Controlled — the component renders from this, never from its own copy. */
  value: TInput;
  /** Report a new answer. The ONLY channel out of the component. */
  onChange: (next: TInput) => void;
  /** True until the learning gate is passed, and briefly during reward playback. */
  disabled: boolean;
  /** Push a message to the shared aria-live region (results, hints, "cap reached"). */
  announce: (message: string) => void;
  /** Reduced-motion flag for any in-puzzle animation. */
  reducedMotion: boolean;
};

export type PuzzleComponent<TInput = unknown> = ComponentType<PuzzleComponentProps<TInput>>;
