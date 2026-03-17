import { expect, test, Page } from "@playwright/test";

async function clickHudOption(page: Page, option: "auto-solve" | "reset") {
  const label = option === "auto-solve" ? "Auto Solve Journey" : "Reset Run";
  await page.getByRole("button", { name: "Options" }).click();
  await page.getByRole("menuitem", { name: label }).click();
}

test("loads studio prototype and shows core controls", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Color Studio Prototype" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Options" })).toBeVisible();
  await expect(page.locator("#auto-solve")).toBeAttached();
  await expect(page.locator("#progress")).toHaveText("");
});

test("auto solve unlocks final canvas", async ({ page }) => {
  await page.goto("/");
  await clickHudOption(page, "auto-solve");
  await expect(page.locator(".puzzle-item", { hasText: "Grand Canvas Unlocked" })).toBeVisible();
});

test("entering Paint Workbench shows art station mini game", async ({ page }) => {
  await page.goto("/");

  await clickHudOption(page, "auto-solve");
  await page.getByRole("button", { name: "Return" }).click();

  const workbenchEnter = page.locator(".puzzle-item", {
    has: page.getByText("Paint Workbench"),
  }).getByRole("button", { name: "Enter" });

  await workbenchEnter.click();

  await expect(page.locator(".art-game-card")).toBeVisible();
  await expect(page.getByText("Art Station Mini Game")).toBeVisible();
});

test("Paint Workbench art mini-game: select color, draw, and clear", async ({ page }) => {
  await page.goto("/");

  await clickHudOption(page, "auto-solve");
  await page.getByRole("button", { name: "Return" }).click();

  const workbenchEnter = page.locator(".puzzle-item", {
    has: page.getByText("Paint Workbench"),
  }).getByRole("button", { name: "Enter" });

  await workbenchEnter.click();
  await expect(page.locator(".art-game-card")).toBeVisible();

  // First swatch is selected by default
  await expect(page.locator(".swatch").nth(0)).toHaveClass(/is-active/);

  // Select the second color swatch
  await page.locator(".swatch").nth(1).click();
  await expect(page.locator(".swatch").nth(1)).toHaveClass(/is-active/);
  await expect(page.locator(".swatch").nth(0)).not.toHaveClass(/is-active/);

  // Draw on the paint pad
  const pad = page.locator(".paint-pad");
  await pad.click({ position: { x: 20, y: 20 } });

  // Threshold 200 cleanly separates painted cells (all palette colors have at least one
  // channel <=193) from the semi-transparent grid lines drawn over white (channels ≈228-242).
  const hasPaintedPixel = await pad.evaluate((el: HTMLCanvasElement) => {
    const ctx = el.getContext("2d");
    if (!ctx) {
      return false;
    }
    const data = ctx.getImageData(0, 0, el.width, el.height).data;
    for (let i = 0; i < data.length; i += 4) {
      if (data[i] < 200 || data[i + 1] < 200 || data[i + 2] < 200) {
        return true;
      }
    }
    return false;
  });
  expect(hasPaintedPixel).toBe(true);

  // Clear the pad and verify all pixels return to white (grid lines over white give ≈228-242,
  // well above 200, so the threshold still passes for the cleared state).
  await page.getByRole("button", { name: "Clear Pad" }).click();

  const isCleared = await page.locator(".paint-pad").evaluate((el: HTMLCanvasElement) => {
    const ctx = el.getContext("2d");
    if (!ctx) {
      return false;
    }
    const data = ctx.getImageData(0, 0, el.width, el.height).data;
    for (let i = 0; i < data.length; i += 4) {
      if (data[i] < 200 || data[i + 1] < 200 || data[i + 2] < 200) {
        return false;
      }
    }
    return true;
  });
  expect(isCleared).toBe(true);
});

test("Light Laboratory: RGB beam buttons are present and toggle on click", async ({ page }) => {
  await page.goto("/");

  // Fresh game — only station-01 (Light Laboratory) is unlocked
  const labEnter = page.locator(".puzzle-item", {
    has: page.getByText("Light Laboratory"),
  }).getByRole("button", { name: "Enter" });

  await labEnter.click();

  // All four beam buttons must be visible for puzzle-01
  await expect(page.locator('.beam-btn[data-beam="red"]')).toBeVisible();
  await expect(page.locator('.beam-btn[data-beam="green"]')).toBeVisible();
  await expect(page.locator('.beam-btn[data-beam="blue"]')).toBeVisible();
  await expect(page.locator('.beam-btn[data-beam="overlap"]')).toBeVisible();

  // Initially no beams are on
  await expect(page.locator('.beam-btn[data-beam="red"]')).not.toHaveClass(/--on/);

  // Toggle Red Beam — should become active
  await page.locator('.beam-btn[data-beam="red"]').click();
  await expect(page.locator('.beam-btn[data-beam="red"]')).toHaveClass(/--on/);

  // Color preview swatch should be visible
  await expect(page.locator(".color-preview-swatch").first()).toBeVisible();

  // Toggle Red Beam again — should deactivate
  await page.locator('.beam-btn[data-beam="red"]').click();
  await expect(page.locator('.beam-btn[data-beam="red"]')).not.toHaveClass(/--on/);
});

test("Paint Workbench: coverage bar is visible and updates when drawing", async ({ page }) => {
  await page.goto("/");

  await clickHudOption(page, "auto-solve");
  await page.getByRole("button", { name: "Return" }).click();

  const workbenchEnter = page.locator(".puzzle-item", {
    has: page.getByText("Paint Workbench"),
  }).getByRole("button", { name: "Enter" });

  await workbenchEnter.click();
  await expect(page.locator(".art-game-card")).toBeVisible();

  // Coverage bar and label must be present
  await expect(page.locator(".coverage-bar-label")).toBeVisible();
  await expect(page.locator(".coverage-bar-track")).toBeVisible();

  // Initial coverage should be 0%
  await expect(page.locator(".coverage-bar-label")).toContainText("0%");

  // Draw enough cells to raise coverage above 0%
  const pad = page.locator(".paint-pad");
  for (let i = 0; i < 6; i++) {
    await pad.click({ position: { x: 10 + i * 55, y: 20 } });
    await pad.click({ position: { x: 10 + i * 55, y: 60 } });
    await pad.click({ position: { x: 10 + i * 55, y: 100 } });
  }

  // Coverage label should show a positive percentage (≥1%)
  const labelText = await page.locator(".coverage-bar-label").textContent();
  expect(labelText).toMatch(/Coverage: [1-9]\d*%/);
});

test("Vibrant Green puzzle supports richer two-pigment mixing and clean green outcome", async ({ page }) => {
  await page.goto("/");

  await clickHudOption(page, "auto-solve");
  await page.getByRole("button", { name: "Return" }).click();

  const workbenchEnter = page.locator(".puzzle-item", {
    has: page.getByText("Paint Workbench"),
  }).getByRole("button", { name: "Enter" });
  await workbenchEnter.click();

  const vibrantCard = page.locator(".puzzle-item", {
    has: page.getByText("Vibrant Green"),
  });

  await vibrantCard.getByRole("button", { name: "Practice" }).click();

  await expect(vibrantCard.getByText(/Pick 2 pigments.*0\/2/)).toBeVisible();

  // Swapping yellows should replace the existing yellow instead of requiring a deselect first.
  await vibrantCard.getByRole("button", { name: "hansa yellow" }).click();
  await vibrantCard.getByRole("button", { name: "yellow ochre" }).click();
  await expect(vibrantCard.getByText("Selected: yellow ochre")).toBeVisible();

  // Swap to a clean yellow + clean blue pair.
  await vibrantCard.getByRole("button", { name: "hansa yellow",  exact: true }).click();
  await vibrantCard.getByRole("button", { name: "phthalo blue",  exact: true }).click();

  await expect(vibrantCard.getByText("Vibrant green achieved! ✓")).toBeVisible();

  const checkButton = vibrantCard.getByRole("button", { name: "Check" });
  await checkButton.click();
  await expect(vibrantCard.getByRole("button", { name: "Practiced ✓" })).toBeVisible();
});

test("HUD shows Score, Pets, Best Streak tiles on load", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("#hud-score-value")).toBeVisible();
  await expect(page.locator("#hud-pets-value")).toBeVisible();
  await expect(page.locator("#hud-streak-value")).toBeVisible();
  // Initial values
  await expect(page.locator("#hud-score-value")).toHaveText("0");
  await expect(page.locator("#hud-pets-value")).toHaveText("0/21");
});

test("HUD score and pets update after auto solve", async ({ page }) => {
  await page.goto("/");
  await clickHudOption(page, "auto-solve");

  // Score should be well above 0 (at minimum 18 * 125 = 2250 with bonuses)
  const scoreText = await page.locator("#hud-score-value").textContent();
  expect(Number(scoreText)).toBeGreaterThan(0);

  // Pets should show 21/21
  await expect(page.locator("#hud-pets-value")).toHaveText("21/21");

  // Best streak should be > 0
  const streakText = await page.locator("#hud-streak-value").textContent();
  expect(Number(streakText)).toBeGreaterThan(0);
});

test("pet milestones appear in HUD after auto solve", async ({ page }) => {
  await page.goto("/");
  await clickHudOption(page, "auto-solve");

  // All three milestones should be visible
  await expect(page.locator("#milestone-badges")).toContainText("Color Apprentice");
  await expect(page.locator("#milestone-badges")).toContainText("Palette Keeper");
  await expect(page.locator("#milestone-badges")).toContainText("Chromatic Master");
});

test("reward feedback toast appears after solving a puzzle via Check button", async ({ page }) => {
  await page.goto("/");

  // Enter Light Laboratory (station-01, puzzle-01 is available from the start)
  const labEnter = page.locator(".puzzle-item", {
    has: page.getByText("Light Laboratory"),
  }).getByRole("button", { name: "Enter" });
  await labEnter.click();

  // Turn on all beams so validation passes
  await page.locator('.beam-btn[data-beam="red"]').click();
  await page.locator('.beam-btn[data-beam="green"]').click();
  await page.locator('.beam-btn[data-beam="blue"]').click();
  await page.locator('.beam-btn[data-beam="overlap"]').click();

  // Click Check — use the puzzle-item containing the "Create White Light" puzzle title
  await page.locator(".puzzle-item", {
    has: page.getByText("Create White Light"),
  }).getByRole("button", { name: "Check" }).click();

  // A score toast should appear with "+100" in it
  await expect(page.locator(".toast", { hasText: "+100" })).toBeVisible();
});

test("progress panel is intentionally empty", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("#progress")).toHaveText("");
});

test("Chromatic Mastery puzzle shows stage indicator and palette cards on entry", async ({ page }) => {
  await page.goto("/");

  // Auto-solve all puzzles so station-05 is available
  await clickHudOption(page, "auto-solve");
  await page.getByRole("button", { name: "Return" }).click();

  // Enter Window Landscape station (puzzle-15)
  const landscapeEnter = page.locator(".puzzle-item", {
    has: page.getByText("Window Landscape"),
  }).getByRole("button", { name: "Enter" });
  await landscapeEnter.click();

  // Enter puzzle-15 via Practice (it was solved by auto-solve)
  const chromaticPractice = page.locator(".puzzle-item", {
    has: page.getByText("Chromatic Mastery"),
  }).getByRole("button", { name: "Practice" });
  await chromaticPractice.click();

  // Stage indicator must be visible showing Stage 1
  await expect(page.locator(".phase-indicator")).toBeVisible();
  await expect(page.locator(".phase-indicator")).toContainText("Stage 1");

  // Palette buttons should be visible (4 palettes: A, B, C, D)
  await expect(page.locator(".tod-palette-btn")).toHaveCount(4);

  // Time-of-day slots should be visible
  await expect(page.locator(".tod-slot")).toHaveCount(4);
});

test("info button is present on puzzle cards", async ({ page }) => {
  await page.goto("/");

  // Enter Light Laboratory to see puzzle cards
  const labEnter = page.locator(".puzzle-item", {
    has: page.getByText("Light Laboratory"),
  }).getByRole("button", { name: "Enter" });
  await labEnter.click();

  // The first puzzle card (RGB Light) should have an info button
  const infoBtns = page.locator(".info-btn");
  await expect(infoBtns.first()).toBeVisible();
  await expect(infoBtns.first()).toHaveAttribute("aria-label", /Learn about/);
});

test("info button opens modal with concept explanation and closes on button click", async ({ page }) => {
  await page.goto("/");

  // Enter Light Laboratory
  const labEnter = page.locator(".puzzle-item", {
    has: page.getByText("Light Laboratory"),
  }).getByRole("button", { name: "Enter" });
  await labEnter.click();

  // Modal should be hidden initially
  await expect(page.locator("#info-modal")).toBeHidden();

  // Click the first info button (RGB Light puzzle)
  await page.locator(".info-btn").first().click();

  // Modal should now be visible with content
  await expect(page.locator("#info-modal")).toBeVisible();
  await expect(page.locator("#info-modal-title")).not.toBeEmpty();
  await expect(page.locator("#info-modal-body")).not.toBeEmpty();

  // Close via the close button
  await page.locator("#info-modal-close").click();
  await expect(page.locator("#info-modal")).toBeHidden();
});

test("info modal closes on backdrop click", async ({ page }) => {
  await page.goto("/");

  // Enter Light Laboratory
  const labEnter = page.locator(".puzzle-item", {
    has: page.getByText("Light Laboratory"),
  }).getByRole("button", { name: "Enter" });
  await labEnter.click();

  // Open modal
  await page.locator(".info-btn").first().click();
  await expect(page.locator("#info-modal")).toBeVisible();

  // Click the overlay backdrop (outside the card)
  await page.locator("#info-modal").click({ position: { x: 5, y: 5 } });
  await expect(page.locator("#info-modal")).toBeHidden();
});

test("info modal closes on Escape key", async ({ page }) => {
  await page.goto("/");

  // Enter Light Laboratory
  const labEnter = page.locator(".puzzle-item", {
    has: page.getByText("Light Laboratory"),
  }).getByRole("button", { name: "Enter" });
  await labEnter.click();

  // Open modal
  await page.locator(".info-btn").first().click();
  await expect(page.locator("#info-modal")).toBeVisible();

  // Press Escape
  await page.keyboard.press("Escape");
  await expect(page.locator("#info-modal")).toBeHidden();
});

test("info modal shows Chroma Tree concept when info button clicked for puzzle-06", async ({ page }) => {
  await page.goto("/");

  // Solve first station so Value Sketchboard is unlocked
  await clickHudOption(page, "auto-solve");
  await page.getByRole("button", { name: "Return" }).click();

  // Enter Value Sketchboard
  const sketchEnter = page.locator(".puzzle-item", {
    has: page.getByText("Value Sketchboard"),
  }).getByRole("button", { name: "Enter" });
  await sketchEnter.click();

  // Find the Chroma Tree puzzle card and click its info button
  const chromaCard = page.locator(".puzzle-item", {
    has: page.getByText("Chroma Tree"),
  });
  await chromaCard.locator(".info-btn").click();

  // Modal title should mention Chroma Tree
  await expect(page.locator("#info-modal-title")).toContainText("Chroma Tree");
  await expect(page.locator("#info-modal-body")).toContainText("chroma");
});
