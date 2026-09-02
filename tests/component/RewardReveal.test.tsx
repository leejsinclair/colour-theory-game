import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RewardReveal } from "../../src/web/components/RewardReveal";

/**
 * T083 (US4) — the success celebration is brief and non-blocking: under reduced
 * motion the colour burst is a static cluster (no travelling animation), the
 * freed pet and an encouraging line are shown, and Continue is operable at once.
 */

const baseProps = {
  petId: "pet-01",
  petName: "Glow Sprite",
  scoreReason: "Solved in one try",
  onContinue: vi.fn(),
};

describe("RewardReveal", () => {
  it("renders a static burst (no animation) under reduced motion", () => {
    const { container } = render(<RewardReveal {...baseProps} reducedMotion />);
    const burst = container.querySelector(".ds-celebration");
    expect(burst).not.toBeNull();
    expect(burst?.className).toContain("ds-celebration--static");
  });

  it("renders the animated burst when motion is allowed", () => {
    const { container } = render(<RewardReveal {...baseProps} reducedMotion={false} />);
    const burst = container.querySelector(".ds-celebration");
    expect(burst?.className).not.toContain("ds-celebration--static");
  });

  it("shows a static success treatment: status role, tick, encouragement, pet, score", () => {
    render(<RewardReveal {...baseProps} reducedMotion message="Beautifully done." />);
    const region = screen.getByRole("status");
    expect(region).toHaveTextContent("✓");
    expect(region).toHaveTextContent("Beautifully done.");
    expect(region).toHaveTextContent("Solved in one try");
    expect(screen.getByRole("img", { name: "Glow Sprite collected" })).toBeInTheDocument();
    expect(region).toHaveTextContent(/Glow Sprite freed/);
  });

  it("keeps a stable encouragement across re-renders", () => {
    const { rerender } = render(<RewardReveal {...baseProps} reducedMotion />);
    const first = screen.getByRole("status").textContent;
    rerender(<RewardReveal {...baseProps} reducedMotion />);
    expect(screen.getByRole("status").textContent).toBe(first);
  });

  it("Continue is operable immediately", async () => {
    const user = userEvent.setup();
    const onContinue = vi.fn();
    render(<RewardReveal {...baseProps} onContinue={onContinue} reducedMotion />);
    await user.click(screen.getByRole("button", { name: "Continue" }));
    expect(onContinue).toHaveBeenCalledTimes(1);
  });

  it("omits the pet line for a puzzle with no pet reward", () => {
    render(
      <RewardReveal
        petId={null}
        petName={null}
        scoreReason="Nicely balanced"
        onContinue={vi.fn()}
        reducedMotion
      />,
    );
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(screen.getByRole("status")).not.toHaveTextContent(/freed/);
  });
});
