/**
 * Session / UI-navigation state that is NOT domain state and NOT derivable from
 * the route (data-model.md §3b). This replaces the module-level `let` variables
 * in the retired `legacyGame.ts`.
 *
 * The reducer is pure and unit-tested (T011). Toast ids are supplied by the
 * caller so the reducer stays deterministic.
 */

export type Toast = {
  id: string;
  message: string;
  kind: "success" | "info";
  petId?: string;
  icon?: string;
};

export type SessionState = {
  practicePuzzleId: string | null;
  modal: { kind: "info"; puzzleId: string } | null;
  toasts: Toast[];
  /** True once the intro has been dismissed OR a persisted `introSeen` was restored. */
  introDismissedThisSession: boolean;
  /** True while the player has explicitly re-opened the intro from the menu. */
  introReplayRequested: boolean;
  /** Skip the next persistence write once (after a forced reset — Edge Cases). */
  skipNextPersist: boolean;
};

export const initialSessionState: SessionState = {
  practicePuzzleId: null,
  modal: null,
  toasts: [],
  introDismissedThisSession: false,
  introReplayRequested: false,
  skipNextPersist: false,
};

export type SessionAction =
  | { type: "ENTER_PRACTICE"; puzzleId: string }
  | { type: "EXIT_PRACTICE" }
  | { type: "OPEN_INFO"; puzzleId: string }
  | { type: "CLOSE_MODAL" }
  | { type: "PUSH_TOAST"; toast: Toast }
  | { type: "EXPIRE_TOAST"; id: string }
  | { type: "DISMISS_INTRO" }
  | { type: "REPLAY_INTRO" }
  | { type: "RESTORE_INTRO_SEEN" }
  | { type: "CONSUME_SKIP_PERSIST" }
  | { type: "RESET" };

export function sessionReducer(state: SessionState, action: SessionAction): SessionState {
  switch (action.type) {
    case "ENTER_PRACTICE":
      return { ...state, practicePuzzleId: action.puzzleId };

    case "EXIT_PRACTICE":
      return { ...state, practicePuzzleId: null };

    case "OPEN_INFO":
      return { ...state, modal: { kind: "info", puzzleId: action.puzzleId } };

    case "CLOSE_MODAL":
      return state.modal === null ? state : { ...state, modal: null };

    case "PUSH_TOAST":
      return { ...state, toasts: [...state.toasts, action.toast] };

    case "EXPIRE_TOAST":
      return { ...state, toasts: state.toasts.filter((toast) => toast.id !== action.id) };

    case "DISMISS_INTRO":
      return { ...state, introDismissedThisSession: true, introReplayRequested: false };

    case "REPLAY_INTRO":
      return { ...state, introReplayRequested: true };

    case "RESTORE_INTRO_SEEN":
      return state.introDismissedThisSession ? state : { ...state, introDismissedThisSession: true };

    case "CONSUME_SKIP_PERSIST":
      return state.skipNextPersist ? { ...state, skipNextPersist: false } : state;

    case "RESET":
      return { ...initialSessionState, skipNextPersist: true };
  }
}
