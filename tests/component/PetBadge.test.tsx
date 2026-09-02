import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { PetBadge } from "../../src/web/components/PetBadge";

/**
 * T095 (US5) — the one reusable pet component: a locked silhouette that does not
 * reveal the design vs an unlocked pet with name + origin, a visible focus
 * target, and an accessible label per `contracts/ui-contract.md` §Collection.
 */
describe("PetBadge (US5)", () => {
  it("unlocked: shows the pet art, a name + origin label, and is a keyboard tab stop", () => {
    const { container } = render(
      <PetBadge petId="pet-01" name="Glow Sprite" collected origin="Light Laboratory" showLabel />,
    );

    const badge = screen.getByRole("img", { name: "Glow Sprite — from Light Laboratory" });
    expect(badge).toHaveAttribute("tabindex", "0");

    const sprite = container.querySelector(".pet-badge__sprite") as HTMLElement;
    expect(sprite.style.backgroundImage).toContain("pets.png");

    expect(screen.getByText("Glow Sprite")).toBeInTheDocument();
    expect(screen.getByText("from Light Laboratory")).toBeInTheDocument();
    expect(container.querySelector(".pet-badge__lock")).toBeNull();
    expect(container.querySelector(".pet-badge--collected")).not.toBeNull();
  });

  it("locked: a silhouette with a '?' and a reveal hint — the name stays hidden", () => {
    const { container } = render(
      <PetBadge
        petId="pet-07"
        name="Prism Fox"
        collected={false}
        origin="Color Wheel Table"
        showLabel
      />,
    );

    expect(
      screen.getByRole("img", {
        name: "Locked pet — solve a puzzle in Color Wheel Table to reveal",
      }),
    ).toBeInTheDocument();

    expect(screen.queryByText("Prism Fox")).not.toBeInTheDocument();
    expect(screen.getByText("???")).toBeInTheDocument();
    expect(container.querySelector(".pet-badge__lock")?.textContent).toBe("?");
    expect(container.querySelector(".pet-badge--locked")).not.toBeNull();
  });

  it("focusable={false} drops the tab stop and honours a label override", () => {
    render(
      <PetBadge
        petId="pet-01"
        name="Glow Sprite"
        collected
        focusable={false}
        label="Glow Sprite collected"
      />,
    );
    expect(screen.getByRole("img", { name: "Glow Sprite collected" })).not.toHaveAttribute(
      "tabindex",
    );
  });
});
