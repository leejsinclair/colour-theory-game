import type { ReactElement } from "react";
import { Menu, MoreVertIcon, type MenuItemSpec } from "../design-system";
import { useGameActions, useSession } from "../state/contexts";
import { useHashRoute } from "../app/useHashRoute";

/**
 * The app menu (FR-021, FR-022, FR-030a). "Auto solve journey" is only offered
 * on a dev / e2e host (localhost / 127.0.0.1) — never on the deployed site.
 */

const FEEDBACK_URL = "https://form.jotform.com/260802651069052";

function isDevHost(): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  const host = window.location.hostname;
  return host === "localhost" || host === "127.0.0.1" || host === "";
}

export function AppMenu(): ReactElement {
  const actions = useGameActions();
  const { dispatch } = useSession();
  const { navigate } = useHashRoute();

  const items: MenuItemSpec[] = [
    {
      key: "reset",
      label: "Reset run",
      onSelect: () => {
        actions.reset();
        navigate({ view: "studio" });
      },
    },
    {
      key: "replay-intro",
      label: "Replay intro",
      onSelect: () => {
        dispatch({ type: "REPLAY_INTRO" });
        navigate({ view: "intro" });
      },
    },
    {
      key: "feedback",
      label: "Feedback",
      onSelect: () => {
        window.open(FEEDBACK_URL, "_blank", "noopener,noreferrer");
      },
    },
  ];

  if (isDevHost()) {
    items.push({
      key: "auto-solve",
      label: "Auto solve journey",
      onSelect: () => {
        void actions.autoSolveJourney().then(() => navigate({ view: "grand-canvas" }));
      },
    });
  }

  return <Menu triggerLabel="Menu" triggerIcon={<MoreVertIcon />} items={items} />;
}
