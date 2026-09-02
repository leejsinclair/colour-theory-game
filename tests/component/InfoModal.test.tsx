import { type ReactElement } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithGame } from "./helpers";
import { InfoModal } from "../../src/web/components/InfoModal";
import { useSession } from "../../src/web/state/contexts";

function Opener(): ReactElement {
  const { dispatch } = useSession();
  return (
    <button type="button" onClick={() => dispatch({ type: "OPEN_INFO", puzzleId: "puzzle-01" })}>
      How this works
    </button>
  );
}

/**
 * T034 — the info modal opens as a focus-trapped dialog, `Escape` closes it, and
 * focus returns to the opener (US7-3, FR-018).
 */
describe("InfoModal", () => {
  beforeEach(() => {
    // No markdown card in jsdom — force the inline learning-content fallback.
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("opens, traps focus, closes on Escape and restores focus", async () => {
    const user = userEvent.setup();
    renderWithGame(
      <>
        <Opener />
        <InfoModal />
      </>,
    );

    const opener = screen.getByRole("button", { name: "How this works" });
    await user.click(opener);

    const dialog = await screen.findByRole("dialog");
    expect(dialog).toBeInTheDocument();
    await waitFor(() => expect(dialog).toHaveTextContent(/RGB White Light/));

    // focus is inside the dialog
    await waitFor(() => expect(dialog.contains(document.activeElement)).toBe(true));

    await user.keyboard("{Escape}");

    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(opener).toHaveFocus();
  });
});
