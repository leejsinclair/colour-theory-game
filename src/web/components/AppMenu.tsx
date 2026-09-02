import { useState, type ReactElement } from "react";
import { Button, Dialog, Menu, MoreVertIcon, type MenuItemSpec } from "../design-system";
import { useGameActions, useSession } from "../state/contexts";
import { useHashRoute } from "../app/useHashRoute";

/**
 * The app menu (FR-021, FR-022, FR-030a). "Auto solve journey" is only offered
 * on a dev / e2e host (localhost / 127.0.0.1) — never on the deployed site.
 * "Reset run" is destructive and confirms before wiping progress.
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
  const [confirmReset, setConfirmReset] = useState(false);

  const items: MenuItemSpec[] = [
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

  items.push({
    key: "reset",
    label: "Reset run",
    tone: "danger",
    onSelect: () => setConfirmReset(true),
  });

  return (
    <>
      <Menu triggerLabel="Menu" triggerIcon={<MoreVertIcon />} items={items} />
      <Dialog
        open={confirmReset}
        onClose={() => setConfirmReset(false)}
        title="Reset all progress?"
        titleId="reset-run-title"
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmReset(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                setConfirmReset(false);
                actions.reset();
                navigate({ view: "studio" });
              }}
            >
              Reset run
            </Button>
          </>
        }
      >
        <p style={{ margin: 0 }}>
          Every solved puzzle, freed pet and streak is cleared. This can't be undone.
        </p>
      </Dialog>
    </>
  );
}
