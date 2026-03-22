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

  await vibrantCard.locator(".result-analysis").scrollIntoViewIfNeeded();
  await page.screenshot({ path: "/tmp/result-analysis.png", fullPage: false });
});

test("Result Analysis panel appears after wrong check on puzzle-02 (Printer Pigments)", async ({ page }) => {
  await page.goto("/");
  await page.setViewportSize({ width: 1100, height: 900 });

  await clickHudOption(page, "auto-solve");
  await page.getByRole("button", { name: "Return" }).click();

  await page.locator(".puzzle-item", {
    has: page.getByText("Light Laboratory"),
  }).getByRole("button", { name: "Enter" }).click();

  const printerCard = page.locator(".puzzle-item", {
    has: page.getByText("Printer Pigments"),
  });
  await printerCard.getByRole("button", { name: "Practice" }).click();

  // Sliders start at wrong values (default 0.1, 0.1, 0.1 vs target 0.4, 0.5, 0.2)
  await printerCard.getByRole("button", { name: "Check" }).click();

  await expect(printerCard.locator(".result-analysis")).toBeVisible();
  await expect(printerCard.locator(".result-analysis__title")).toHaveText("Result Analysis");
  const explanation = printerCard.locator(".result-analysis__item").first();
  await expect(explanation).toBeVisible();
  // Should be the unbalanced_mix explanation
  await expect(explanation).toContainText("ratio");

  await printerCard.locator(".result-analysis").scrollIntoViewIfNeeded();
  await page.screenshot({ path: "/tmp/puzzle-02-result-analysis.png", fullPage: false });
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

  await vibrantCard.getByRole("button", { name: "hansa yellow", exact: true }).click();
  await vibrantCard.getByRole("button", { name: "yellow ochre", exact: true }).click();
  await vibrantCard.getByRole("button", { name: "Check" }).click();
  await expect(vibrantCard.locator(".result-analysis")).toBeVisible();

  await vibrantCard.getByRole("button", { name: "hansa yellow", exact: true }).click();
  await vibrantCard.getByRole("button", { name: "phthalo blue", exact: true }).click();
  await expect(vibrantCard.getByText("Vibrant green achieved! ✓")).toBeVisible();
  await vibrantCard.getByRole("button", { name: "Check" }).click();

  await expect(vibrantCard.locator(".result-analysis")).toHaveCount(0);
});

test("Mud Monster passes when effective mud stays below threshold even with two red touches", async ({ page }) => {
  await page.goto("/");

  await clickHudOption(page, "auto-solve");
  await page.getByRole("button", { name: "Return" }).click();

  await page.locator(".puzzle-item", {
    has: page.getByText("Paint Workbench"),
  }).getByRole("button", { name: "Enter" }).click();

  const mudCard = page.locator(".puzzle-item", {
    has: page.getByText("Mud Monster"),
  });
  await mudCard.getByRole("button", { name: "Practice" }).click();

  await mudCard.getByRole("button", { name: "Reset Bowl" }).click();
  await mudCard.getByRole("button", { name: "Add warm yellow tint" }).click();
  await mudCard.getByRole("button", { name: "Add cool blue tint" }).click();
  await mudCard.getByRole("button", { name: "Add tiny complement neutralizer" }).click();
  await mudCard.getByRole("button", { name: "Add clean green stroke" }).click();
  await mudCard.getByRole("button", { name: "Add clean green stroke" }).click();
  await mudCard.getByRole("button", { name: "Add tiny complement neutralizer" }).click();

  await expect(mudCard.getByText("Mud level: 35% / 58% max")).toBeVisible();
  await mudCard.getByRole("button", { name: "Check" }).click();

  await expect(mudCard.getByRole("button", { name: "Practiced ✓" })).toBeVisible();
  await expect(mudCard.locator(".result-analysis")).toHaveCount(0);
});

test("Mud Monster shows Result Analysis when effective mud exceeds threshold", async ({ page }) => {
  await page.goto("/");

  await clickHudOption(page, "auto-solve");
  await page.getByRole("button", { name: "Return" }).click();

  await page.locator(".puzzle-item", {
    has: page.getByText("Paint Workbench"),
  }).getByRole("button", { name: "Enter" }).click();

  const mudCard = page.locator(".puzzle-item", {
    has: page.getByText("Mud Monster"),
  });
  await mudCard.getByRole("button", { name: "Practice" }).click();

  await mudCard.getByRole("button", { name: "Add orange contaminant" }).click();
  await mudCard.getByRole("button", { name: "Add purple contaminant" }).click();
  await mudCard.getByRole("button", { name: "Check" }).click();

  await expect(mudCard.locator(".result-analysis")).toBeVisible();
  await expect(mudCard.locator(".result-analysis__title")).toHaveText("Result Analysis");
  await expect(mudCard.locator(".result-analysis__item").first()).toBeVisible();
});
