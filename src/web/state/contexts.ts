import { createContext, useContext, type Dispatch } from "react";
import type { GameStore } from "./gameStore";
import type { GameActions } from "./actions";
import type { SessionAction, SessionState } from "./sessionReducer";

/**
 * Three split contexts (contracts/app-state.md §Contexts, research.md R3) so a
 * snapshot change does not re-render action-only or session-only consumers.
 *
 * `GameStoreContext` holds the store object (subscribe/getSnapshot), not the
 * snapshot itself — selector hooks pass a slice selector to
 * `useSyncExternalStore` for per-slice re-render granularity.
 */

export const GameStoreContext = createContext<GameStore | null>(null);
export const GameActionsContext = createContext<GameActions | null>(null);
export const SessionContext = createContext<{
  state: SessionState;
  dispatch: Dispatch<SessionAction>;
} | null>(null);

export function useGameStore(): GameStore {
  const store = useContext(GameStoreContext);
  if (!store) {
    throw new Error("useGameStore must be used within <GameProvider>");
  }
  return store;
}

export function useGameActions(): GameActions {
  const actions = useContext(GameActionsContext);
  if (!actions) {
    throw new Error("useGameActions must be used within <GameProvider>");
  }
  return actions;
}

export function useSession(): { state: SessionState; dispatch: Dispatch<SessionAction> } {
  const ctx = useContext(SessionContext);
  if (!ctx) {
    throw new Error("useSession must be used within <GameProvider>");
  }
  return ctx;
}
