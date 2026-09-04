import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Slider } from "../../src/web/design-system";

describe("Slider", () => {
  it("keeps an accessible name when the visible label is shown", () => {
    render(<Slider label="Hue" value={50} min={0} max={100} onChange={() => {}} />);
    expect(screen.getByRole("slider", { name: "Hue" })).toBeInTheDocument();
  });
});
