import { describe, expect, it } from "vitest";
import { act } from "react";
import { screen, within } from "@testing-library/react";
import { renderWithGame } from "./helpers";
import { StudioScreen } from "../../src/web/screens/StudioScreen";
import { getDemoSolution } from "../../src/content/demoSolutions";
import type { GameActions } from "../../src/web/state/actions";

/**
 * T057 (US2) — the Studio hub at fresh / mid-game / all-complete states: each
 * station card carries a distinct treatment, and the recommended-next target
 * tracks the earliest unlocked incomplete station's next unsolved puzzle.
 */

const STATION_ONE = "Light Laboratory";
const STATION_TWO = "Value Sketchboard";

const ALL_PLAYABLE = [
  ...Array.from({ length: 21 }, (_, i) => `puzzle-${String(i + 1).padStart(2, "0")}`),
  "puzzle-23",
];

function solve(actions: GameActions, ids: string[]): void {
  act(() => {
    for (const id of ids) {
      actions.submitPuzzle(id, getDemoSolution(id));
    }
  });
}

describe("StudioScreen (US2)", () => {
  it("fresh: only the first station is enterable, the rest read as locked", () => {
    renderWithGame(<StudioScreen />);

    expect(screen.getByRole("button", { name: `Enter ${STATION_ONE}` })).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: new RegExp(`(Enter|Continue) ${STATION_TWO}`) }),
    ).not.toBeInTheDocument();

    const sketchboard = screen.getByRole("article", { name: STATION_TWO });
    expect(
      within(sketchboard).getByText(/Locked — finish previous stations/),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: /^Recommended: Create White Light/ }),
    ).toBeInTheDocument();
  });

  it("mid-game: a started station shows Continue and recommends the next puzzle", () => {
    const { handle } = renderWithGame(<StudioScreen />);
    solve(handle.actions, ["puzzle-01"]);

    expect(screen.getByRole("button", { name: `Continue ${STATION_ONE}` })).toBeInTheDocument();

    const lightLab = screen.getByRole("article", { name: STATION_ONE });
    expect(within(lightLab).getByText(/1 of 3 solved/)).toBeInTheDocument();
    expect(within(lightLab).getByText("In progress")).toBeInTheDocument();

    // puzzle-01 solved → recommend the next unsolved puzzle in the same station.
    expect(screen.getByRole("button", { name: /^Recommended:/ })).toHaveTextContent(
      /Recommended: (?!Create White Light)/,
    );
  });

  it("all complete: every station card is complete and the finale is recommended", () => {
    const { handle } = renderWithGame(<StudioScreen />);
    solve(handle.actions, ALL_PLAYABLE);

    expect(screen.getAllByText("Complete")).toHaveLength(7);
    expect(
      screen.getByRole("button", { name: "Recommended: Grand Canvas" }),
    ).toBeInTheDocument();
  });
});
