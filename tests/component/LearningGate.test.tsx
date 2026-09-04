import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithGame } from "./helpers";
import { PuzzleScreen } from "../../src/web/screens/PuzzleScreen";

/**
 * T032 — the learning gate (FR-016, US3-2): puzzle controls and Check are absent
 * until the quiz is passed at 100%; a pass records the quiz and reveals the solve
 * stage.
 */
describe("learning gate", () => {
  it("gates the puzzle behind a 100%-correct quiz", async () => {
    const user = userEvent.setup();
    renderWithGame(<PuzzleScreen stationId="station-01" puzzleId="puzzle-01" />);

    // Intro stage — no puzzle body, no Check.
    expect(screen.getByRole("button", { name: "Start quiz" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Check" })).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Start quiz" }));

    // Wrong answers → still gated, explanation tips shown.
    await user.click(
      screen.getByRole("radio", { name: "Because pigments reflect those three colors" }),
    );
    await user.click(
      screen.getByRole("radio", { name: "It becomes darker because colors cancel out" }),
    );
    await user.click(screen.getByRole("button", { name: "Submit quiz" }));

    expect(screen.getByText(/You need 100%/)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Check" })).not.toBeInTheDocument();
    expect(screen.getAllByText(/^Tip:/)).toHaveLength(2);

    // Correct answers → gate opens, Check appears.
    await user.click(
      screen.getByRole("radio", {
        name: "Because emitted light wavelengths add to form other colors",
      }),
    );
    await user.click(
      screen.getByRole("radio", { name: "It shifts toward green and may become lighter" }),
    );
    await user.click(screen.getByRole("button", { name: "Submit quiz" }));

    expect(await screen.findByRole("button", { name: "Check" })).toBeInTheDocument();
  });
});
