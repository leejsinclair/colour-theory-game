import { expect, test } from "@playwright/test";

test("loads studio prototype and shows core controls", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Color Studio Prototype" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Auto Solve Journey" })).toBeVisible();
  await expect(page.locator("#progress")).toContainText("Solved Puzzles");
});

test("auto solve unlocks final canvas", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Auto Solve Journey" }).click();
  await expect(page.locator("#progress")).toContainText("Final Canvas   : Unlocked");
});

test("entering Paint Workbench shows art station mini game", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: "Auto Solve Journey" }).click();
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

  await page.getByRole("button", { name: "Auto Solve Journey" }).click();
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

  await page.getByRole("button", { name: "Auto Solve Journey" }).click();
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
