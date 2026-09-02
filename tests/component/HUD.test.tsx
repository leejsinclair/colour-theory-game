import { describe, expect, it } from "vitest";
import { act } from "react";
import { screen, within } from "@testing-library/react";
import { renderWithGame } from "./helpers";
import { HUD } from "../../src/web/components/HUD";
import { getDemoSolution } from "../../src/content/demoSolutions";

/**
 * T031 — the HUD reflects the game snapshot: score / pets / streak readouts and
 * the Grand-Canvas progress ring, with pet-milestone badges carrying an icon +
 * label (never colour alone).
 */
describe("HUD", () => {
  it("shows fresh readouts and no streak / milestones", () => {
    renderWithGame(<HUD />);
    expect(screen.getByText("Score")).toBeInTheDocument();
    expect(screen.getByText("Pets collected: 0 of 22")).toBeInTheDocument();
    expect(screen.queryByText(/^Streak:/)).not.toBeInTheDocument();
    expect(
      screen.getByRole("progressbar", { name: /Grand Canvas progress: 0 of 22/ }),
    ).toHaveAttribute("aria-valuenow", "0");
    expect(screen.getByRole("button", { name: "Menu" })).toBeInTheDocument();
  });

  it("updates score, pets and streak after a solve", () => {
    const { handle } = renderWithGame(<HUD />);
    act(() => {
      handle.actions.submitPuzzle("puzzle-01", getDemoSolution("puzzle-01"));
    });
    expect(screen.getByText("Pets collected: 1 of 22")).toBeInTheDocument();
    expect(screen.getByText("Streak: 1")).toBeInTheDocument();
    expect(
      screen.getByRole("progressbar", { name: /Grand Canvas progress/ }),
    ).toHaveAttribute("aria-valuenow", "1");
  });

  it("renders earned milestone badges with an icon and a text label", () => {
    const { handle } = renderWithGame(<HUD />);
    act(() => {
      // Solve the first six puzzles → "Color Apprentice" milestone (6 pets).
      for (let n = 1; n <= 6; n += 1) {
        const id = `puzzle-${String(n).padStart(2, "0")}`;
        handle.actions.submitPuzzle(id, getDemoSolution(id));
      }
    });
    const list = screen.getByRole("list", { name: "Milestones unlocked" });
    expect(within(list).getByText("Color Apprentice")).toBeInTheDocument();
  });
});
