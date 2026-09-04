import { useMemo, useReducer, useState, type ReactElement, type ReactNode } from "react";
import { createGameStore } from "./gameStore";
import { createGameActions } from "./actions";
import { initialSessionState, sessionReducer } from "./sessionReducer";
import { GameActionsContext, GameStoreContext, SessionContext } from "./contexts";
import { usePersistenceSync } from "./persistenceSync";

/**
 * Mounts the game store, the session reducer, and the three split contexts
 * (contracts/app-state.md §Contexts). Runs `usePersistenceSync` so load/save
 * happen exactly once for the app.
 */

function PersistenceBridge(): null {
  usePersistenceSync();
  return null;
}

export function GameProvider({ children }: { children: ReactNode }): ReactElement {
  const [store] = useState(createGameStore);

  const [sessionState, dispatch] = useReducer(sessionReducer, initialSessionState);

  const actions = useMemo(
    () => createGameActions({ store, dispatchSession: dispatch }),
    [store],
  );

  const sessionValue = useMemo(
    () => ({ state: sessionState, dispatch }),
    [sessionState],
  );

  return (
    <GameStoreContext.Provider value={store}>
      <GameActionsContext.Provider value={actions}>
        <SessionContext.Provider value={sessionValue}>
          <PersistenceBridge />
          {children}
        </SessionContext.Provider>
      </GameActionsContext.Provider>
    </GameStoreContext.Provider>
  );
}
