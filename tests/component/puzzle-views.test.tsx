import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ComponentType } from "react";
import type { PuzzleComponentProps } from "../../src/web/puzzles/types";
import { initialInputFor } from "../../src/web/puzzles";

import Puzzle01 from "../../src/web/puzzles/puzzle-01-view";
import Puzzle04 from "../../src/web/puzzles/puzzle-04-view";
import Puzzle08 from "../../src/web/puzzles/puzzle-08-view";
import Puzzle11 from "../../src/web/puzzles/puzzle-11-view";
import Puzzle13 from "../../src/web/puzzles/puzzle-13-view";
import Puzzle16 from "../../src/web/puzzles/puzzle-16-view";
import Puzzle19 from "../../src/web/puzzles/puzzle-19-view";
import ArtStationPad from "../../src/web/puzzles/ArtStationPad";

/**
 * T066 (US3) — a representative puzzle per station plus the special apparatus:
 * each renders from `value`, reports answers through `onChange` in the shape the
 * domain validator expects, and reaches for no side channel (no `document`
 * query, no `createRoot`, no module-global, no `Game`).
 */

type Sample = {
  puzzleId: string;
  Component: ComponentType<PuzzleComponentProps>;
  /** Operate the first obvious control and return the keys onChange must carry. */
  interact: (user: ReturnType<typeof userEvent.setup>) => Promise<void>;
  expectedKeys: string[];
};

const SAMPLES: Sample[] = [
  {
    puzzleId: "puzzle-01",
    Component: Puzzle01 as ComponentType<PuzzleComponentProps>,
    interact: (user) => user.click(screen.getByRole("button", { name: "Red Beam" })),
    expectedKeys: ["redBeam", "greenBeam", "blueBeam", "overlap"],
  },
  {
    puzzleId: "puzzle-04",
    Component: Puzzle04 as ComponentType<PuzzleComponentProps>,
    interact: (user) => user.click(screen.getAllByRole("button", { name: /^Tone / })[0]),
    expectedKeys: ["usesOnlyBlackAndWhite", "blurReadability"],
  },
  {
    puzzleId: "puzzle-08",
    Component: Puzzle08 as ComponentType<PuzzleComponentProps>,
    interact: async (user) => {
      screen.getAllByRole("slider")[0].focus();
      await user.keyboard("{ArrowRight}");
    },
    expectedKeys: ["hueAngles"],
  },
  {
    puzzleId: "puzzle-11",
    Component: Puzzle11 as ComponentType<PuzzleComponentProps>,
    interact: async (user) => {
      screen.getAllByRole("slider")[0].focus();
      await user.keyboard("{ArrowRight}");
    },
    expectedKeys: ["usedOrangeSurroundings", "greySquareChanged"],
  },
  {
    puzzleId: "puzzle-13",
    Component: Puzzle13 as ComponentType<PuzzleComponentProps>,
    interact: async (user) => {
      screen.getAllByRole("slider")[0].focus();
      await user.keyboard("{ArrowRight}");
    },
    expectedKeys: ["edgeSharpnessDropsWithDistance", "saturationDropsWithDistance", "hueShiftsCoolerWithDistance"],
  },
  {
    puzzleId: "puzzle-16",
    Component: Puzzle16 as ComponentType<PuzzleComponentProps>,
    interact: (user) => user.click(screen.getByRole("button", { name: "hansa yellow" })),
    expectedKeys: ["pigments", "mudLevel"],
  },
  {
    puzzleId: "puzzle-19",
    Component: Puzzle19 as ComponentType<PuzzleComponentProps>,
    interact: async (user) => {
      // Sliders 0–2 are hue (local state); slider 3 is the primary-percentage.
      screen.getAllByRole("slider")[3].focus();
      await user.keyboard("{ArrowRight}");
    },
    expectedKeys: ["primaryPct", "secondaryPct", "accentPct"],
  },
  {
    puzzleId: "puzzle-18",
    Component: ArtStationPad as ComponentType<PuzzleComponentProps>,
    interact: (user) => user.click(screen.getAllByRole("gridcell")[0]),
    expectedKeys: ["usedPureDots", "mixedOnPalette", "opticalBlendVisible"],
  },
];

describe("puzzle views satisfy the PuzzleComponent contract", () => {
  for (const sample of SAMPLES) {
    it(`${sample.puzzleId}: renders from value and reports the right onChange shape`, async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const getById = vi.spyOn(document, "getElementById");
      const querySelector = vi.spyOn(document, "querySelector");

      const { unmount } = render(
        <sample.Component
          value={initialInputFor(sample.puzzleId)}
          onChange={onChange}
          disabled={false}
          announce={vi.fn()}
          reducedMotion={false}
        />,
      );

      await sample.interact(user);

      expect(onChange).toHaveBeenCalled();
      const payload = onChange.mock.calls.at(-1)?.[0] as Record<string, unknown>;
      for (const key of sample.expectedKeys) {
        expect(payload).toHaveProperty(key);
      }

      expect(getById).not.toHaveBeenCalled();
      expect(querySelector).not.toHaveBeenCalled();

      getById.mockRestore();
      querySelector.mockRestore();
      unmount();
    });

    it(`${sample.puzzleId}: is disabled-aware (no onChange while disabled)`, async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <sample.Component
          value={initialInputFor(sample.puzzleId)}
          onChange={onChange}
          disabled
          announce={vi.fn()}
          reducedMotion={false}
        />,
      );
      await sample.interact(user).catch(() => {
        /* a disabled control may not be focusable — that is fine */
      });
      expect(onChange).not.toHaveBeenCalled();
    });
  }
});

describe("puzzle view modules use no side channels (static scan)", () => {
  const dir = path.join(process.cwd(), "src/web/puzzles");
  const files = readdirSync(dir).filter(
    (name) => name.endsWith("-view.tsx") || name === "ArtStationPad.tsx",
  );

  it("covers every registered playable puzzle", () => {
    // 21 numbered views (puzzle-18 is ArtStationPad) + puzzle-23-view.
    expect(files.length).toBe(22);
  });

  for (const file of files) {
    it(`${file}: no persistedState / createRoot / domain import`, () => {
      const source = readFileSync(path.join(dir, file), "utf8");
      expect(source).not.toMatch(/persistedState/);
      expect(source).not.toMatch(/createRoot/);
      expect(source).not.toMatch(/react-dom\/client/);
      expect(source).not.toMatch(/from ["'][^"']*(?:\/|\.\.\/)(?:game|systems|entities)\//);
      expect(source).not.toMatch(/getElementById|querySelector/);
    });
  }
});
