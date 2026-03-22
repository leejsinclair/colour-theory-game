/**
 * New Player Journey — end-to-end tests that walk through the complete app
 * experience from first load to Grand Canvas, mirroring what a real new
 * player would encounter in sequence.
 *
 * Organised into eight phases:
 *   1. Studio Lobby       – initial state on a fresh load
 *   2. Learning Gate      – intro card, quiz validation, failure, and retry
 *   3. First Puzzle Solve – solving puzzle-01 and seeing rewards
 *   4. Station Progression– sequential unlock within a station, station completion
 *   5. Navigation         – Back button, entering a second station
 *   6. Progress Persistence – quiz and solve state is saved across reloads
 *   7. Reset              – Reset Run wipes everything and restores initial state
 *   8. Game Completion    – all puzzles solved → Grand Canvas shown
 */

import { expect, test, Page } from "@playwright/test";

// ─── Shared helpers ──────────────────────────────────────────────────────────

/** Click an item in the Options HUD dropdown. */
async function clickHudOption(page: Page, option: "auto-solve" | "reset"): Promise<void> {
  const label = option === "auto-solve" ? "Auto Solve Journey" : "Reset Run";
  await page.getByRole("button", { name: "Options" }).click();
  await page.getByRole("menuitem", { name: label }).click();
}

/**
 * Inject a pre-built progress snapshot into localStorage, then reload so the
 * app restores from it.  Accepting both solved IDs and quiz-passed IDs lets
 * callers set up any mid-game state without driving through the full UI.
 */
async function injectProgress(
  page: Page,
  completedPuzzleIds: string[],
  quizPassedIds: string[] = [],
): Promise<void> {
  const learningProgressByPuzzle = Object.fromEntries(
    quizPassedIds.map((id) => [id, { quizPassed: true }]),
  );
  await page.evaluate(
    ({ ids, lp }) => {
      localStorage.setItem(
        "ctg:web-progress:v1",
        JSON.stringify({
          completedPuzzleIds: ids,
          activeStationId: null,
          practicePuzzleId: null,
          learningProgressByPuzzle: lp,
        }),
      );
    },
    { ids: completedPuzzleIds, lp: learningProgressByPuzzle },
  );
  await page.reload();
  await page.waitForSelector(".puzzle-item");
}

/**
 * Pass puzzle-01's learning quiz using the correct option text.
 * Idempotent — skips silently if the Start Quiz button is absent (already passed
 * or puzzle already solved).
 */
async function passQuizForPuzzle01(page: Page): Promise<void> {
  const puzzleCard = page.locator(".puzzle-item", {
    has: page.getByText("Create White Light"),
  });
  const startQuizButton = puzzleCard.getByRole("button", { name: "Start Quiz" });
  if (!(await startQuizButton.count())) {
    return;
  }
  await startQuizButton.click();
  await puzzleCard.locator('label.learning-option:has-text("Because emitted light wavelengths add to form other colors") input').check();
  await puzzleCard.locator('label.learning-option:has-text("It shifts toward green and may become lighter") input').check();
  await puzzleCard.getByRole("button", { name: "Submit Quiz" }).click();
}

// ─── Phase 1: Studio Lobby ────────────────────────────────────────────────────

test("fresh game: app loads with title, zero score, and 0/21 pets", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Color Studio Prototype" })).toBeVisible();
  await expect(page.locator("#hud-score-value")).toHaveText("0");
  await expect(page.locator("#hud-pets-value")).toHaveText("0/21");
  await expect(page.locator("#hud-streak-value")).toHaveText("0");
});

test("fresh game: only Light Laboratory has an Enter button — all others show Locked", async ({ page }) => {
  await page.goto("/");

  // Light Laboratory is the only station that starts unlocked
  await expect(
    page.locator(".puzzle-item", { hasText: "Light Laboratory" })
      .getByRole("button", { name: "Enter" }),
  ).toBeEnabled();

  // Every other station should be disabled
  for (const name of [
    "Value Sketchboard",
    "Color Wheel Table",
    "Optical Illusion Wall",
    "Window Landscape",
    "Paint Workbench",
    "Design Studio",
  ]) {
    await expect(
      page.locator(".puzzle-item", { hasText: name })
        .getByRole("button", { name: "Locked" }),
    ).toBeDisabled();
  }
});

test("fresh game: studio shows Studio Exploration header on lobby screen", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Studio Exploration")).toBeVisible();
});

// ─── Phase 2: Learning Gate ───────────────────────────────────────────────────

test("learning gate: entering station shows intro card, not puzzle mechanics", async ({ page }) => {
  await page.goto("/");

  await page.locator(".puzzle-item", { hasText: "Light Laboratory" })
    .getByRole("button", { name: "Enter" }).click();

  const puzzleCard = page.locator(".puzzle-item", { has: page.getByText("Create White Light") });

  // Intro card elements must be visible
  await expect(puzzleCard.locator(".learning-card")).toBeVisible();
  await expect(puzzleCard.locator(".learning-title")).toContainText("RGB White Light");
  await expect(puzzleCard.locator(".learning-illustration")).toBeVisible();
  await expect(puzzleCard.locator(".learning-paragraph").first()).toBeVisible();

  // Puzzle mechanics must be absent
  await expect(puzzleCard.locator('.beam-btn[data-beam="red"]')).toHaveCount(0);
  await expect(puzzleCard.getByRole("button", { name: "Check" })).toHaveCount(0);
});

test("learning gate: submitting quiz without selecting answers shows a warning", async ({ page }) => {
  await page.goto("/");

  await page.locator(".puzzle-item", { hasText: "Light Laboratory" })
    .getByRole("button", { name: "Enter" }).click();

  const puzzleCard = page.locator(".puzzle-item", { has: page.getByText("Create White Light") });
  await puzzleCard.getByRole("button", { name: "Start Quiz" }).click();

  // Submit with nothing selected
  await puzzleCard.getByRole("button", { name: "Submit Quiz" }).click();

  await expect(puzzleCard.locator(".learning-feedback")).toContainText("Answer every question");

  // Puzzle mechanics must still be absent
  await expect(puzzleCard.locator('.beam-btn[data-beam="red"]')).toHaveCount(0);
});

test("learning gate: wrong answers show failure score and per-question explanation tips", async ({ page }) => {
  await page.goto("/");

  await page.locator(".puzzle-item", { hasText: "Light Laboratory" })
    .getByRole("button", { name: "Enter" }).click();

  const puzzleCard = page.locator(".puzzle-item", { has: page.getByText("Create White Light") });
  await puzzleCard.getByRole("button", { name: "Start Quiz" }).click();

  // Select the wrong options — "Because pigments reflect those three colors" and "It becomes darker because colors cancel out"
  await puzzleCard.locator('label.learning-option:has-text("Because pigments reflect those three colors") input').check();
  await puzzleCard.locator('label.learning-option:has-text("It becomes darker because colors cancel out") input').check();
  await puzzleCard.getByRole("button", { name: "Submit Quiz" }).click();

  // Failure feedback should mention the 100% requirement
  await expect(puzzleCard.locator(".learning-feedback")).toContainText("You need 100%");

  // One explanation tip per question must appear after a failed attempt
  const tips = puzzleCard.locator(".learning-explanation");
  await expect(tips).toHaveCount(2);
  await expect(tips.first()).toContainText("Tip:");

  // Puzzle mechanics still gated
  await expect(puzzleCard.locator('.beam-btn[data-beam="red"]')).toHaveCount(0);
});

test("learning gate: Back to Intro button restores the intro card after a failed quiz", async ({ page }) => {
  await page.goto("/");

  await page.locator(".puzzle-item", { hasText: "Light Laboratory" })
    .getByRole("button", { name: "Enter" }).click();

  const puzzleCard = page.locator(".puzzle-item", { has: page.getByText("Create White Light") });
  await puzzleCard.getByRole("button", { name: "Start Quiz" }).click();

  // Trigger the failure path by submitting without answers
  await puzzleCard.getByRole("button", { name: "Submit Quiz" }).click();

  // Navigate back to intro
  await puzzleCard.getByRole("button", { name: "Back to Intro" }).click();

  // Intro card restored
  await expect(puzzleCard.locator(".learning-title")).toContainText("RGB White Light");
  await expect(puzzleCard.locator(".learning-illustration")).toBeVisible();
  await expect(puzzleCard.getByRole("button", { name: "Start Quiz" })).toBeVisible();

  // Quiz form gone
  await expect(puzzleCard.locator(".learning-question")).toHaveCount(0);
});

test("learning gate: correct quiz answers unlock puzzle mechanics and show a toast", async ({ page }) => {
  await page.goto("/");

  await page.locator(".puzzle-item", { hasText: "Light Laboratory" })
    .getByRole("button", { name: "Enter" }).click();

  await passQuizForPuzzle01(page);

  // Beam buttons should now be present
  await expect(page.locator('.beam-btn[data-beam="red"]')).toBeVisible();
  await expect(page.locator('.beam-btn[data-beam="green"]')).toBeVisible();
  await expect(page.locator('.beam-btn[data-beam="blue"]')).toBeVisible();
  await expect(page.locator('.beam-btn[data-beam="overlap"]')).toBeVisible();

  // A quiz-pass toast should have appeared
  await expect(page.locator(".toast", { hasText: "Quiz passed" })).toBeVisible();

  // Review Introduction button should be appended outside the zone
  const puzzleCard = page.locator(".puzzle-item", { has: page.getByText("Create White Light") });
  await expect(puzzleCard.getByRole("button", { name: "Review Introduction" })).toBeVisible();
});

// ─── Phase 3: First Puzzle Solve ─────────────────────────────────────────────

test("solving puzzle-01: all beams on + Check → score earned, pet earned, HUD updates", async ({ page }) => {
  await page.goto("/");

  await page.locator(".puzzle-item", { hasText: "Light Laboratory" })
    .getByRole("button", { name: "Enter" }).click();
  await passQuizForPuzzle01(page);

  // Activate all four beams to create white light
  await page.locator('.beam-btn[data-beam="red"]').click();
  await page.locator('.beam-btn[data-beam="green"]').click();
  await page.locator('.beam-btn[data-beam="blue"]').click();
  await page.locator('.beam-btn[data-beam="overlap"]').click();

  await page.locator(".puzzle-item", { has: page.getByText("Create White Light") })
    .getByRole("button", { name: "Check" }).click();

  // Score toast must appear
  await expect(page.locator(".toast", { hasText: "+100" })).toBeVisible();

  // HUD: score above zero, pets 1/21
  const scoreText = await page.locator("#hud-score-value").textContent();
  expect(Number(scoreText)).toBeGreaterThan(0);
  await expect(page.locator("#hud-pets-value")).toHaveText("1/21");
});

test("solving puzzle-01: card shows Solved pill and Practice button after completion", async ({ page }) => {
  await page.goto("/");

  await page.locator(".puzzle-item", { hasText: "Light Laboratory" })
    .getByRole("button", { name: "Enter" }).click();
  await passQuizForPuzzle01(page);

  await page.locator('.beam-btn[data-beam="red"]').click();
  await page.locator('.beam-btn[data-beam="green"]').click();
  await page.locator('.beam-btn[data-beam="blue"]').click();
  await page.locator('.beam-btn[data-beam="overlap"]').click();

  await page.locator(".puzzle-item", { has: page.getByText("Create White Light") })
    .getByRole("button", { name: "Check" }).click();

  const puzzleCard = page.locator(".puzzle-item", { has: page.getByText("Create White Light") });
  await expect(puzzleCard.locator(".pill.solved")).toBeVisible();
  await expect(puzzleCard.getByRole("button", { name: "Practice" })).toBeVisible();
});

test("solving puzzle-01: pet unlock toast confirms Glow Sprite is freed", async ({ page }) => {
  await page.goto("/");

  await page.locator(".puzzle-item", { hasText: "Light Laboratory" })
    .getByRole("button", { name: "Enter" }).click();
  await passQuizForPuzzle01(page);

  await page.locator('.beam-btn[data-beam="red"]').click();
  await page.locator('.beam-btn[data-beam="green"]').click();
  await page.locator('.beam-btn[data-beam="blue"]').click();
  await page.locator('.beam-btn[data-beam="overlap"]').click();

  await page.locator(".puzzle-item", { has: page.getByText("Create White Light") })
    .getByRole("button", { name: "Check" }).click();

  // Pet toast naming the Glow Sprite pet
  await expect(page.locator(".toast", { hasText: "Glow Sprite" })).toBeVisible();
});

// ─── Phase 4: Station Progression ────────────────────────────────────────────

test("station progression: after puzzle-01 solved, puzzle-02 shows learning gate not a Locked pill", async ({ page }) => {
  await page.goto("/");
  await injectProgress(page, ["puzzle-01"]);

  await page.locator(".puzzle-item", { hasText: "Light Laboratory" })
    .getByRole("button", { name: "Enter" }).click();

  // puzzle-01 is solved — should display Solved pill
  const puzzle01 = page.locator(".puzzle-item", { has: page.getByText("Create White Light") });
  await expect(puzzle01.locator(".pill.solved")).toBeVisible();

  // puzzle-02 (Printer Pigments) must show the learning intro gate, not a Locked pill
  const puzzle02 = page.locator(".puzzle-item", { has: page.getByText("Printer Pigments") });
  await expect(puzzle02.getByRole("button", { name: "Start Quiz" })).toBeVisible();
  await expect(puzzle02.locator(".pill.locked")).toHaveCount(0);
});

test("station progression: completing station-01 unlocks Value Sketchboard in lobby", async ({ page }) => {
  await page.goto("/");
  // Pre-solve all three Light Lab puzzles; the game restores them in order which
  // triggers the station-completion unlock of station-02.
  await injectProgress(page, ["puzzle-01", "puzzle-02", "puzzle-03"]);

  // Value Sketchboard should now be available
  await expect(
    page.locator(".puzzle-item", { hasText: "Value Sketchboard" })
      .getByRole("button", { name: "Enter" }),
  ).toBeEnabled();

  // Stations further down the chain should still be locked
  await expect(
    page.locator(".puzzle-item", { hasText: "Color Wheel Table" })
      .getByRole("button", { name: "Locked" }),
  ).toBeDisabled();
});

test("station progression: station-01 completion notice shows 3/3 solved in lobby", async ({ page }) => {
  await page.goto("/");
  await injectProgress(page, ["puzzle-01", "puzzle-02", "puzzle-03"]);

  // The station card for Light Laboratory should show 3/3 solved in its meta
  await expect(
    page.locator(".puzzle-item", { hasText: "Light Laboratory" }),
  ).toContainText("3/3 solved");
});

test("station progression: completed station shows a prominent next-station CTA", async ({ page }) => {
  await page.goto("/");
  await injectProgress(page, ["puzzle-01", "puzzle-02", "puzzle-03"]);

  await page.locator(".puzzle-item", { hasText: "Light Laboratory" })
    .getByRole("button", { name: "Enter" }).click();

  const completionCta = page.locator(".station-complete-cta");
  await expect(completionCta).toBeVisible();
  await expect(completionCta).toContainText("You’ve completed all puzzles in this station.");
  await expect(
    completionCta.getByRole("button", { name: "Station Complete! Go to Next Station →" }),
  ).toBeVisible();
  await expect(completionCta).toContainText("Next station: Value Sketchboard");
});

// ─── Phase 5: Navigation ─────────────────────────────────────────────────────

test("navigation: Back button exits station and returns to studio lobby", async ({ page }) => {
  await page.goto("/");

  await page.locator(".puzzle-item", { hasText: "Light Laboratory" })
    .getByRole("button", { name: "Enter" }).click();

  // Studio Exploration heading is not present when inside a station
  await expect(page.getByText("Studio Exploration")).not.toBeVisible();

  // Back button navigates back to lobby
  await page.getByRole("button", { name: "Back" }).click();

  // Studio Exploration heading and Light Lab Enter button should be visible again
  await expect(page.getByText("Studio Exploration")).toBeVisible();
  await expect(
    page.locator(".puzzle-item", { hasText: "Light Laboratory" })
      .getByRole("button", { name: "Enter" }),
  ).toBeVisible();
});

test("second station: entering Value Sketchboard shows puzzle-04 learning intro", async ({ page }) => {
  await page.goto("/");
  await injectProgress(page, ["puzzle-01", "puzzle-02", "puzzle-03"]);

  await page.locator(".puzzle-item", { hasText: "Value Sketchboard" })
    .getByRole("button", { name: "Enter" }).click();

  // puzzle-04 (Squint Test) should present the learning gate
  const puzzle04 = page.locator(".puzzle-item", { has: page.getByText("Squint Test") });
  await expect(puzzle04.locator(".learning-card")).toBeVisible();
  await expect(puzzle04.locator(".learning-title")).toContainText("Value and Squint Readability");
  await expect(puzzle04.getByRole("button", { name: "Start Quiz" })).toBeVisible();
});

test("navigation: station-complete CTA button enters the next station without using Back", async ({ page }) => {
  await page.goto("/");
  await injectProgress(page, ["puzzle-01", "puzzle-02", "puzzle-03"]);

  await page.locator(".puzzle-item", { hasText: "Light Laboratory" })
    .getByRole("button", { name: "Enter" }).click();

  await page.getByRole("button", { name: "Station Complete! Go to Next Station →" }).click();

  await expect(page.getByText("Studio Exploration")).not.toBeVisible();

  const stationHeader = page.locator(".puzzle-item").first();
  await expect(stationHeader).toContainText("Value Sketchboard");

  const puzzle04 = page.locator(".puzzle-item", { has: page.getByText("Squint Test") });
  await expect(puzzle04.locator(".learning-card")).toBeVisible();
  await expect(puzzle04.getByRole("button", { name: "Start Quiz" })).toBeVisible();
});

test("second station: Value Sketchboard Back button returns to lobby", async ({ page }) => {
  await page.goto("/");
  await injectProgress(page, ["puzzle-01", "puzzle-02", "puzzle-03"]);

  await page.locator(".puzzle-item", { hasText: "Value Sketchboard" })
    .getByRole("button", { name: "Enter" }).click();

  await page.getByRole("button", { name: "Back" }).click();

  await expect(page.getByText("Studio Exploration")).toBeVisible();
});

// ─── Phase 6: Progress Persistence ───────────────────────────────────────────

test("progress persistence: quiz pass saved and restored after reload — beams stay accessible", async ({ page }) => {
  await page.goto("/");

  await page.locator(".puzzle-item", { hasText: "Light Laboratory" })
    .getByRole("button", { name: "Enter" }).click();

  // Pass the quiz so the puzzle unlocks
  await passQuizForPuzzle01(page);
  await expect(page.locator('.beam-btn[data-beam="red"]')).toBeVisible();

  // Reload — restoreLocalProgress fires and reads the snapshot (which includes
  // activeStationId="station-01" since we were inside the station when we saved,
  // so the app restores directly into the PuzzleScene, no need to click Enter).
  await page.reload();
  await page.waitForSelector(".puzzle-item");

  // Beam buttons must be visible immediately (quiz pass was persisted)
  await expect(page.locator('.beam-btn[data-beam="red"]')).toBeVisible();

  // Start Quiz button must be absent — the gate no longer applies
  await expect(
    page.locator(".puzzle-item", { has: page.getByText("Create White Light") })
      .getByRole("button", { name: "Start Quiz" }),
  ).toHaveCount(0);
});

test("progress persistence: solved puzzle remains solved after page reload", async ({ page }) => {
  await page.goto("/");
  // Pre-solve puzzle-01 via localStorage
  await injectProgress(page, ["puzzle-01"]);

  await page.locator(".puzzle-item", { hasText: "Light Laboratory" })
    .getByRole("button", { name: "Enter" }).click();

  // Even after a reload the solved state should be restored
  await expect(
    page.locator(".puzzle-item", { has: page.getByText("Create White Light") })
      .locator(".pill.solved"),
  ).toBeVisible();
});

// ─── Phase 7: Reset ───────────────────────────────────────────────────────────

test("reset run: clears all progress and returns to fresh initial state", async ({ page }) => {
  await page.goto("/");

  // Build up progress with auto-solve
  await clickHudOption(page, "auto-solve");
  await page.getByRole("button", { name: "Return" }).click();

  // Confirm multiple stations are unlocked before reset
  await expect(
    page.locator(".puzzle-item", { hasText: "Value Sketchboard" })
      .getByRole("button", { name: "Enter" }),
  ).toBeEnabled();

  // Fire the reset
  await clickHudOption(page, "reset");

  // HUD is back to zero
  await expect(page.locator("#hud-score-value")).toHaveText("0");
  await expect(page.locator("#hud-pets-value")).toHaveText("0/21");

  // Only Light Lab is available
  await expect(
    page.locator(".puzzle-item", { hasText: "Light Laboratory" })
      .getByRole("button", { name: "Enter" }),
  ).toBeEnabled();
  await expect(
    page.locator(".puzzle-item", { hasText: "Value Sketchboard" })
      .getByRole("button", { name: "Locked" }),
  ).toBeDisabled();
});

test("reset run: after reset the first puzzle shows learning intro again", async ({ page }) => {
  await page.goto("/");

  // Reach a state where puzzle-01 is solved (no quiz gate)
  await injectProgress(page, ["puzzle-01"]);
  await page.locator(".puzzle-item", { hasText: "Light Laboratory" })
    .getByRole("button", { name: "Enter" }).click();
  const puzzleCard = page.locator(".puzzle-item", { has: page.getByText("Create White Light") });
  await expect(puzzleCard.locator(".pill.solved")).toBeVisible();

  // Return to lobby
  await page.getByRole("button", { name: "Back" }).click();

  // Reset
  await clickHudOption(page, "reset");

  // Enter the station again — learning gate must show
  await page.locator(".puzzle-item", { hasText: "Light Laboratory" })
    .getByRole("button", { name: "Enter" }).click();

  await expect(
    page.locator(".puzzle-item", { has: page.getByText("Create White Light") })
      .locator(".learning-title"),
  ).toContainText("RGB White Light");
});

// ─── Phase 8: Game Completion ─────────────────────────────────────────────────

test("game completion: auto-solving all puzzles unlocks Grand Canvas", async ({ page }) => {
  await page.goto("/");

  await clickHudOption(page, "auto-solve");

  await expect(page.locator(".puzzle-item", { hasText: "Grand Canvas Unlocked" })).toBeVisible();
  await expect(
    page.locator(".puzzle-item", { hasText: "Explore Unlocked Studio" }),
  ).toBeVisible();
});

test("game completion: all 21 pets collected after solving all puzzles", async ({ page }) => {
  await page.goto("/");

  await clickHudOption(page, "auto-solve");

  await expect(page.locator("#hud-pets-value")).toHaveText("21/21");
});

test("game completion: Return from Grand Canvas lets player explore solved stations", async ({ page }) => {
  await page.goto("/");

  await clickHudOption(page, "auto-solve");
  await page.getByRole("button", { name: "Return" }).click();

  // Back in lobby — all stations should now be unlocked
  await expect(page.getByText("Studio Exploration")).toBeVisible();

  for (const name of [
    "Light Laboratory",
    "Value Sketchboard",
    "Color Wheel Table",
    "Optical Illusion Wall",
    "Window Landscape",
    "Paint Workbench",
    "Design Studio",
  ]) {
    await expect(
      page.locator(".puzzle-item", { hasText: name }).getByRole("button", { name: "Enter" }),
    ).toBeEnabled();
  }
});
