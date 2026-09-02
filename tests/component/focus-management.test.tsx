import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { GameProvider } from "../../src/web/state/GameProvider";
import { App } from "../../src/web/app/App";
import { LiveRegion, announce } from "../../src/web/design-system";
import { __resetLiveRegion } from "../../src/web/design-system/LiveRegion";

/**
 * T089 (US7) — focus & live-region management (contracts/ui-contract.md
 * §Behavioural guarantees):
 *   - a route change moves keyboard focus to the new screen's <h1>
 *   - `announce()` produces a polite `status` update
 *
 * The info-modal focus trap (open → Escape → focus returns to opener) is
 * covered by `tests/component/InfoModal.test.tsx` (T034).
 */

describe("focus management (US7)", () => {
  beforeEach(() => {
    window.location.hash = "";
    // No puzzle-info markdown in jsdom; force the inline fallback if fetched.
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    window.location.hash = "";
  });

  it("moves focus to the <h1> on every route change", async () => {
    const user = userEvent.setup();
    render(
      <GameProvider>
        <App />
      </GameProvider>,
    );

    // Fresh state → caretaker intro. Its <h1> takes focus on mount.
    const introHeading = await screen.findByRole("heading", {
      name: "Welcome to the Studio",
      level: 1,
    });
    await waitFor(() => expect(introHeading).toHaveFocus());

    await user.click(screen.getByRole("button", { name: "Enter the Studio" }));

    const studioHeading = await screen.findByRole("heading", {
      name: "Chromatic Mastery Studio",
      level: 1,
    });
    await waitFor(() => expect(studioHeading).toHaveFocus());

    await user.click(screen.getByRole("button", { name: "Enter Light Laboratory" }));

    const stationHeading = await screen.findByRole("heading", {
      name: "Light Laboratory",
      level: 1,
    });
    await waitFor(() => expect(stationHeading).toHaveFocus());
  });

  it("announce() pushes a polite status message", async () => {
    __resetLiveRegion();
    render(<LiveRegion />);

    const region = screen.getByRole("status");
    expect(region).toHaveAttribute("aria-live", "polite");
    expect(region).toHaveTextContent("");

    announce("Correct — puzzle solved. Glow Sprite freed.");

    await waitFor(() =>
      expect(region).toHaveTextContent("Correct — puzzle solved. Glow Sprite freed."),
    );

    // A later call overwrites the previous message in place.
    announce("Station complete.");
    await waitFor(() => expect(region).toHaveTextContent("Station complete."));

    __resetLiveRegion();
  });
});
