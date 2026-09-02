import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

/**
 * Confirms the jsdom project transforms TSX + renders React (T002).
 * Real component suites replace the need for this once they exist.
 */
describe("component test harness", () => {
  it("renders JSX into jsdom", () => {
    render(<h1>Chromatic Mastery</h1>);
    expect(screen.getByRole("heading", { name: "Chromatic Mastery" })).toBeInTheDocument();
  });
});
