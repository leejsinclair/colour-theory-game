import { expect, test, Page } from "@playwright/test";

async function clickHudOption(page: Page, option: "auto-solve" | "reset") {
  const label = option === "auto-solve" ? "Auto Solve Journey" : "Reset Run";
  await page.getByRole("button", { name: "Options" }).click();
  await page.getByRole("menuitem", { name: label }).click();
}

test("Result Analysis panel appears after wrong check on puzzle-16", async ({ page }) => {
  await page.goto("/");
  await page.setViewportSize({ width: 1100, height: 900 });

  await clickHudOption(page, "auto-solve");
  await page.getByRole("button", { name: "Return" }).click();

  await page.locator(".puzzle-item", {
    has: page.getByText("Paint Workbench"),
  }).getByRole("button", { name: "Enter" }).click();

  const vibrantCard = page.locator(".puzzle-item", {
    has: page.getByText("Vibrant Green"),
  });
  await vibrantCard.getByRole("button", { name: "Practice" }).click();
  await expect(vibrantCard.getByText(/Pick 2 pigments/)).toBeVisible();

  // Wrong: two yellows
  await vibrantCard.getByRole("button", { name: "hansa yellow", exact: true }).click();
  await vibrantCard.getByRole("button", { name: "yellow ochre", exact: true }).click();
  await vibrantCard.getByRole("button", { name: "Check" }).click();

  await expect(vibrantCard.locator(".result-analysis")).toBeVisible();
  await expect(vibrantCard.locator(".result-analysis__title")).toHaveText("Result Analysis");
  await expect(vibrantCard.locator(".result-analysis__item").first()).toBeVisible();

  // Scroll panel into view and screenshot
  await vibrantCard.locator(".result-analysis").scrollIntoViewIfNeeded();
  await page.screenshot({ path: "/tmp/result-analysis.png", fullPage: false });
});

test("Result Analysis panel clears on next attempt", async ({ page }) => {
  await page.goto("/");

  await clickHudOption(page, "auto-solve");
  await page.getByRole("button", { name: "Return" }).click();

  await page.locator(".puzzle-item", {
    has: page.getByText("Paint Workbench"),
  }).getByRole("button", { name: "Enter" }).click();

  const vibrantCard = page.locator(".puzzle-item", {
    has: page.getByText("Vibrant Green"),
  });
  await vibrantCard.getByRole("button", { name: "Practice" }).click();

  // Wrong attempt
  await vibrantCard.getByRole("button", { name: "hansa yellow", exact: true }).click();
  await vibrantCard.getByRole("button", { name: "yellow ochre", exact: true }).click();
  await vibrantCard.getByRole("button", { name: "Check" }).click();
  await expect(vibrantCard.locator(".result-analysis")).toBeVisible();

  // Correct attempt — hansa yellow replaces yellow ochre, then add phthalo blue
  await vibrantCard.getByRole("button", { name: "hansa yellow", exact: true }).click();
  await vibrantCard.getByRole("button", { name: "phthalo blue", exact: true }).click();
  await expect(vibrantCard.getByText("Vibrant green achieved! ✓")).toBeVisible();
  await vibrantCard.getByRole("button", { name: "Check" }).click();

  await expect(vibrantCard.locator(".result-analysis")).toHaveCount(0);
});
