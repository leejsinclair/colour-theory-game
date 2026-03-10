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
  await page.waitForTimeout(2600);
  await workbenchEnter.click();

  await expect(page.locator(".art-game-card")).toBeVisible();
  await expect(page.getByText("Art Station Mini Game")).toBeVisible();
});
