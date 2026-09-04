import { describe, expect, it } from "vitest";
import { act } from "react";
import { screen } from "@testing-library/react";
import { renderWithGame } from "./helpers";
import { GrandCanvasScreen } from "../../src/web/screens/GrandCanvasScreen";
import { getDemoSolution } from "../../src/content/demoSolutions";
import type { GameActions } from "../../src/web/state/actions";

/**
 * T100 (US6) — the Grand Canvas finale: preserved stats (puzzles solved / pets
 * rescued / best streak), the full pet roll through the shared PetBadge, the
 * return + review/practise actions, and a static celebration under reduced
 * motion (FR-020, FR-040, FR-047).
 */

const ALL_PLAYABLE = [
  ...Array.from({ length: 21 }, (_, i) => `puzzle-${String(i + 1).padStart(2, "0")}`),
  "puzzle-23",
];

function solveAll(actions: GameActions): void {
  act(() => {
    for (const id of ALL_PLAYABLE) {
      actions.submitPuzzle(id, getDemoSolution(id));
    }
  });
}

function withReducedMotion(matches: boolean, run: () => void): void {
  const original = window.matchMedia;
  window.matchMedia = ((query: string) => ({
    matches: matches && query.includes("reduce"),
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })) as typeof window.matchMedia;
  try {
    run();
  } finally {
    window.matchMedia = original;
  }
}

describe("GrandCanvasScreen (US6)", () => {
  it("shows preserved stats, the full pet roll, and both finale actions", () => {
    const { handle } = renderWithGame(<GrandCanvasScreen />);
    solveAll(handle.actions);

    expect(screen.getByText("Puzzles solved")).toBeInTheDocument();
    expect(screen.getByText("Pets rescued")).toBeInTheDocument();
    expect(screen.getByText("Best streak")).toBeInTheDocument();

    // The whole 22-pet roll, every tile the shared PetBadge (role="img"), freed.
    expect(screen.getAllByRole("img", { name: /— from / })).toHaveLength(22);

    expect(screen.getByRole("button", { name: "Return to Studio" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Review & practise puzzles" }),
    ).toBeInTheDocument();
  });

  it("reads as a finale, not a puzzle screen: hero heading + saved-progress reassurance", () => {
    renderWithGame(<GrandCanvasScreen />);

    expect(screen.getByRole("heading", { name: "Grand Canvas", level: 1 })).toBeInTheDocument();
    expect(screen.getByText(/your progress is saved/i)).toBeInTheDocument();
    expect(screen.getByText(/complete/i)).toBeInTheDocument();
  });

  it("celebrates by default and falls back to a static cluster under reduced motion", () => {
    withReducedMotion(false, () => {
      const { container } = renderWithGame(<GrandCanvasScreen />);
      const burst = container.querySelector(".ds-celebration");
      expect(burst).not.toBeNull();
      expect(burst?.className).not.toContain("ds-celebration--static");
    });

    withReducedMotion(true, () => {
      const { container } = renderWithGame(<GrandCanvasScreen />);
      expect(container.querySelector(".ds-celebration--static")).not.toBeNull();
    });
  });
});
