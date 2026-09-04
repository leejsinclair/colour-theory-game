import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ResultPanel } from "../../src/web/components/ResultPanel";
import { diagnoseFailure } from "../../src/web/puzzles/diagnose";
import { FAILURE_EXPLANATIONS, FAILURE_PRINCIPLE } from "../../src/web/puzzles/failureReasons";
import type { FailureDiagnosis } from "../../src/web/state/actions";

/**
 * T082 (US4) — the Result Analysis panel renders the specific `diagnose.ts`
 * reason and names the colour-theory principle to revisit; failure state is
 * carried by role + text (not colour); "Try again" is wired to retry.
 */

function diagnosisFor(puzzleId: string, input: unknown): FailureDiagnosis {
  const codes = diagnoseFailure(puzzleId, input);
  const primaryCode = codes[0] ?? null;
  return {
    codes,
    primaryCode,
    principle: primaryCode ? FAILURE_PRINCIPLE[primaryCode] : null,
    explanations: codes.map((code) => FAILURE_EXPLANATIONS[code]).filter(Boolean),
  };
}

describe("ResultPanel", () => {
  it("shows the specific diagnosis reason and the principle to revisit", () => {
    // puzzle-01 with no beams → missing_primary_beam → "Additive light".
    const diagnosis = diagnosisFor("puzzle-01", {});
    render(<ResultPanel diagnosis={diagnosis} onRetry={vi.fn()} />);

    const region = screen.getByRole("alert");
    expect(region).toHaveTextContent("Not quite");
    expect(region).toHaveTextContent("Principle to revisit:");
    expect(region).toHaveTextContent("Additive light");
    expect(region).toHaveTextContent(FAILURE_EXPLANATIONS.missing_primary_beam);
  });

  it("names a different principle for a different failure family", () => {
    // puzzle-05 → incorrect_value_structure → "Value structure".
    const diagnosis = diagnosisFor("puzzle-05", {});
    render(<ResultPanel diagnosis={diagnosis} onRetry={vi.fn()} />);
    expect(screen.getByRole("alert")).toHaveTextContent("Value structure");
  });

  it("communicates the failure state without relying on colour", () => {
    const diagnosis = diagnosisFor("puzzle-01", {});
    const { container } = render(<ResultPanel diagnosis={diagnosis} onRetry={vi.fn()} />);
    // The leading word plus the ✗ glyph carry the state — not just the tone class.
    const heading = container.querySelector(".result-panel__heading");
    expect(heading?.textContent).toContain("✗");
    expect(heading?.textContent).toContain("Not quite");
  });

  it("still renders a fallback line when there is no specific diagnosis", () => {
    const diagnosis: FailureDiagnosis = {
      codes: [],
      primaryCode: null,
      principle: null,
      explanations: [],
    };
    render(<ResultPanel diagnosis={diagnosis} onRetry={vi.fn()} />);
    expect(screen.getByRole("alert")).toHaveTextContent(/adjust your answer/i);
    expect(screen.queryByText("Principle to revisit:")).not.toBeInTheDocument();
  });

  it("fires onRetry from the Try again button", async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    render(<ResultPanel diagnosis={diagnosisFor("puzzle-01", {})} onRetry={onRetry} />);
    await user.click(screen.getByRole("button", { name: "Try again" }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
