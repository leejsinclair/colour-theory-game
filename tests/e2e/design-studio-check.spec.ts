import { test, expect } from "@playwright/test";

test("Design Studio puzzle-19 is accessible after auto-solve", async ({ page }) => {
  await page.goto("/");
  await page.waitForTimeout(500);

  // Auto-solve all 18 puzzles – this unlocks station-07 and transitions to FinalCanvasScene
  await page.getByRole("button", { name: "Options" }).click();
  await page.getByRole("menuitem", { name: "Auto Solve Journey" }).click();
  await page.waitForTimeout(1500);

  // After auto-solve the game is at FinalCanvasScene; click the MUI-upgraded "Return" button
  // (the first rendered visible button with that label)
  await page.getByRole("button", { name: "Return" }).first().click();
  await page.waitForTimeout(500);

  // Design Studio should now appear in the station list
  await expect(page.locator("text=Design Studio")).toBeVisible();

  // Enter the Design Studio – it is the last station, so the last Enter button in the list
  const enterButtons = page.getByRole("button", { name: "Enter" });
  const count = await enterButtons.count();
  await enterButtons.nth(count - 1).click();
  await page.waitForTimeout(500);

  // The Color Balance puzzle card should be visible (already solved after auto-solve)
  await expect(page.locator("text=Color Balance 60/30/10")).toBeVisible();

  // Click Practice to enter interactive mode for the solved puzzle
  await page.locator(".puzzle-item", {
    has: page.getByText("Color Balance 60/30/10"),
  }).getByRole("button", { name: "Practice" }).click();

  // The interactive composition bar should now be present
  await expect(page.locator(".balance-composition")).toBeVisible();

  // The Check button should be available for submission in practice mode
  await expect(page.getByRole("button", { name: "Check" })).toBeVisible();
});
