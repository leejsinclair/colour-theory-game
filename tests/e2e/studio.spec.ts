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
