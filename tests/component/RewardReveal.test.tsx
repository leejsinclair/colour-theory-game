import { afterEach, describe, expect, it, vi } from "vitest";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RewardReveal } from "../../src/web/components/RewardReveal";

/**
 * T083 (US4) — the success overlay clearly signals completion: a "Puzzle
 * complete" banner, the points earned, the freed pet, and an encouraging line.
 * Under reduced motion the colour burst is a static cluster. A countdown
 * auto-returns the player (in practice mode it closes the overlay instead);
 * passing `autoReturnSeconds={null}` removes it and leaves a manual action only.
 */

const baseProps = {
  petId: "pet-01",
  petName: "Glow Sprite",
  points: 40,
  scoreReason: "Solved in one try",
  onContinue: vi.fn(),
};

afterEach(() => {
  vi.useRealTimers();
});

describe("RewardReveal", () => {
  it("renders a static burst (no animation) under reduced motion", () => {
    const { container } = render(
      <RewardReveal {...baseProps} reducedMotion autoReturnSeconds={null} />,
    );
    const burst = container.querySelector(".ds-celebration");
    expect(burst).not.toBeNull();
    expect(burst?.className).toContain("ds-celebration--static");
  });

  it("renders the animated burst when motion is allowed", () => {
    const { container } = render(
      <RewardReveal {...baseProps} reducedMotion={false} autoReturnSeconds={null} />,
    );
    const burst = container.querySelector(".ds-celebration");
    expect(burst?.className).not.toContain("ds-celebration--static");
  });

  it("shows a completion banner: status role, tick, points, encouragement, pet, score", () => {
    render(
      <RewardReveal
        {...baseProps}
        reducedMotion
        autoReturnSeconds={null}
        message="Beautifully done."
      />,
    );
    const region = screen.getByRole("status");
    expect(region).toHaveTextContent("✓");
    expect(region).toHaveTextContent("Puzzle complete");
    expect(region).toHaveTextContent("+40");
    expect(region).toHaveTextContent("Beautifully done.");
    expect(region).toHaveTextContent("Solved in one try");
    expect(screen.getByRole("img", { name: "Glow Sprite collected" })).toBeInTheDocument();
    expect(region).toHaveTextContent(/Glow Sprite freed/);
  });

  it("omits the points block when no points were awarded", () => {
    render(
      <RewardReveal {...baseProps} points={0} reducedMotion autoReturnSeconds={null} />,
    );
    expect(screen.getByRole("status")).not.toHaveTextContent("+0");
  });

  it("keeps a stable encouragement across re-renders", () => {
    const { rerender } = render(
      <RewardReveal {...baseProps} reducedMotion autoReturnSeconds={null} />,
    );
    const first = screen.getByRole("status").textContent;
    rerender(<RewardReveal {...baseProps} reducedMotion autoReturnSeconds={null} />);
    expect(screen.getByRole("status").textContent).toBe(first);
  });

  it("Continue is operable immediately", async () => {
    const user = userEvent.setup();
    const onContinue = vi.fn();
    render(
      <RewardReveal
        {...baseProps}
        onContinue={onContinue}
        reducedMotion
        autoReturnSeconds={null}
      />,
    );
    await user.click(screen.getByRole("button", { name: "Continue" }));
    expect(onContinue).toHaveBeenCalledTimes(1);
  });

  it("omits the pet line for a puzzle with no pet reward", () => {
    render(
      <RewardReveal
        petId={null}
        petName={null}
        points={20}
        scoreReason="Nicely balanced"
        onContinue={vi.fn()}
        reducedMotion
        autoReturnSeconds={null}
      />,
    );
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(screen.getByRole("status")).not.toHaveTextContent(/freed/);
  });

  it("counts down and auto-returns to the given destination", () => {
    vi.useFakeTimers();
    const onContinue = vi.fn();
    render(
      <RewardReveal
        {...baseProps}
        onContinue={onContinue}
        reducedMotion
        destinationLabel="Light Laboratory"
        autoReturnSeconds={3}
      />,
    );

    expect(screen.getAllByText(/Returning to Light Laboratory/).length).toBeGreaterThan(0);
    expect(onContinue).not.toHaveBeenCalled();

    for (let i = 0; i < 3; i += 1) {
      act(() => {
        vi.advanceTimersByTime(1000);
      });
    }
    expect(onContinue).toHaveBeenCalledTimes(1);
  });

  it("is a labelled modal dialog and moves focus to the primary action", () => {
    render(<RewardReveal {...baseProps} reducedMotion autoReturnSeconds={null} />);
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(dialog).toHaveAccessibleName("Puzzle complete");
    expect(screen.getByRole("button", { name: "Continue" })).toHaveFocus();
  });

  it("Escape stops the countdown rather than navigating", () => {
    vi.useFakeTimers();
    const onContinue = vi.fn();
    render(
      <RewardReveal {...baseProps} onContinue={onContinue} reducedMotion autoReturnSeconds={3} />,
    );
    act(() => {
      screen.getByRole("dialog").dispatchEvent(
        new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
      );
    });
    act(() => {
      vi.advanceTimersByTime(10000);
    });
    expect(onContinue).not.toHaveBeenCalled();
  });

  it("'Stay here' cancels the countdown", () => {
    vi.useFakeTimers();
    const onContinue = vi.fn();
    render(
      <RewardReveal
        {...baseProps}
        onContinue={onContinue}
        reducedMotion
        autoReturnSeconds={3}
      />,
    );

    act(() => {
      screen.getByRole("button", { name: "Stay here" }).click();
    });
    act(() => {
      vi.advanceTimersByTime(10000);
    });
    expect(onContinue).not.toHaveBeenCalled();
    expect(screen.queryByRole("button", { name: "Stay here" })).not.toBeInTheDocument();
  });
});
