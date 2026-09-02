import { type ReactElement, type ReactNode } from "react";
import { render } from "@testing-library/react";
import { GameProvider } from "../../src/web/state/GameProvider";
import { useGameActions, useSession } from "../../src/web/state/contexts";
import type { GameActions } from "../../src/web/state/actions";
import type { SessionAction } from "../../src/web/state/sessionReducer";

type Handle = {
  actions: GameActions;
  dispatchSession: (action: SessionAction) => void;
};

/**
 * Render `ui` inside a real `<GameProvider>` and expose the game actions +
 * session dispatch so a test can drive domain state without going through the
 * UI. Component tests for FR-058.
 */
export function renderWithGame(ui: ReactNode): ReturnType<typeof render> & { handle: Handle } {
  const handle: Handle = {
    actions: undefined as unknown as GameActions,
    dispatchSession: () => {},
  };

  function Probe(): null {
    handle.actions = useGameActions();
    handle.dispatchSession = useSession().dispatch;
    return null;
  }

  const result = render(
    <GameProvider>
      <Probe />
      {ui as ReactElement}
    </GameProvider>,
  );

  return Object.assign(result, { handle });
}
