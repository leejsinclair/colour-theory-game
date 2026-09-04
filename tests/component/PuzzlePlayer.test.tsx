import { describe, expect, it, vi } from "vitest";
import { act } from "react";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithGame } from "./helpers";
import { PuzzlePlayer } from "../../src/web/components/PuzzlePlayer";

/**
 * T033 — `<PuzzlePlayer>` hosts a puzzle body, renders the real Check button in
 * its own subtree (FR-006), routes the domain result to `onSolved` / `onFailed`,
 * and guards against a double submit (Edge Cases).
 */
describe("PuzzlePlayer", () => {
  it("renders the Check button inside its own subtree", () => {
    const { container } = renderWithGame(
      <PuzzlePlayer puzzleId="puzzle-01" disabled={false} onSolved={vi.fn()} onFailed={vi.fn()} />,
    );
    const stage = container.querySelector(".puzzle-stage__play");
    expect(stage).not.toBeNull();
    const check = screen.getByRole("button", { name: "Check" });
    expect(stage?.contains(check)).toBe(true);
  });

  it("routes a wrong answer to onFailed with a diagnosis", async () => {
    const user = userEvent.setup();
    const onSolved = vi.fn();
    const onFailed = vi.fn();
    renderWithGame(
      <PuzzlePlayer puzzleId="puzzle-01" disabled={false} onSolved={onSolved} onFailed={onFailed} />,
    );

    await user.click(screen.getByRole("button", { name: "Check" }));

    expect(onSolved).not.toHaveBeenCalled();
    expect(onFailed).toHaveBeenCalledTimes(1);
    expect(onFailed.mock.calls[0][0]).toHaveProperty("explanations");
  });

  it("routes a correct answer to onSolved and stays idempotent on a second click", async () => {
    const user = userEvent.setup();
    const onSolved = vi.fn();
    const onFailed = vi.fn();
    const { container } = renderWithGame(
      <PuzzlePlayer puzzleId="puzzle-01" disabled={false} onSolved={onSolved} onFailed={onFailed} />,
    );

    // puzzle-01 legacy body renders `.beam-btn` DOM buttons.
    const beams = ["red", "green", "blue", "overlap"];
    for (const beam of beams) {
      const btn = container.querySelector<HTMLButtonElement>(`.beam-btn[data-beam="${beam}"]`);
      expect(btn).not.toBeNull();
      await act(async () => {
        btn?.click();
      });
    }

    const check = screen.getByRole("button", { name: "Check" });
    await user.click(check);
    await user.click(check);

    expect(onFailed).not.toHaveBeenCalled();
    expect(onSolved).toHaveBeenCalled();
    // second submit returns the cached success, never a duplicate failure
    expect(onSolved.mock.calls.at(-1)?.[0]).toMatchObject({ ok: true });
  });

  it("does not submit while disabled", async () => {
    const user = userEvent.setup();
    const onSolved = vi.fn();
    const onFailed = vi.fn();
    renderWithGame(
      <PuzzlePlayer puzzleId="puzzle-01" disabled onSolved={onSolved} onFailed={onFailed} />,
    );
    await user.click(screen.getByRole("button", { name: "Check" }));
    expect(onSolved).not.toHaveBeenCalled();
    expect(onFailed).not.toHaveBeenCalled();
  });
});
