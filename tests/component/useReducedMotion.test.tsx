import { describe, expect, it } from "vitest";
import { render, waitFor } from "@testing-library/react";
import { useReducedMotion } from "../../src/web/state/useReducedMotion";

function ReducedMotionProbe(): null {
  useReducedMotion();
  return null;
}

describe("useReducedMotion", () => {
  it("syncs the reduced-motion dataset attribute after commit", async () => {
    const original = window.matchMedia;
    window.matchMedia = ((query: string) => ({
      matches: query.includes("reduce"),
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    })) as typeof window.matchMedia;

    try {
      render(<ReducedMotionProbe />);
      await waitFor(() => {
        expect(document.documentElement.dataset.reducedMotion).toBe("true");
      });
    } finally {
      window.matchMedia = original;
      delete document.documentElement.dataset.reducedMotion;
    }
  });
});
