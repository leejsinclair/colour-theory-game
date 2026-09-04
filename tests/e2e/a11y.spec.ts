/**
 * T094 (US7) — an automated axe-core pass over every primary screen: Studio,
 * Station, Puzzle, Collection, Grand Canvas. Gate on WCAG 2.1 A/AA, with
 * colour-contrast called out explicitly (SC-008,
 * quickstart.md §Accessibility & responsive).
 */
import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { autoSolve, enterStudio, passPuzzle01Quiz } from "./support";

const TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];

async function scan(page: Page, context?: string) {
  const builder = new AxeBuilder({ page }).withTags(TAGS);
  return context ? builder.include(context).analyze() : builder.analyze();
}

test.describe("accessibility audit (axe-core)", () => {
  test("Studio has no WCAG A/AA violations", async ({ page }) => {
    await page.goto("/");
    await enterStudio(page);
    const results = await scan(page);
    expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);
  });

  test("Collection has no WCAG A/AA violations", async ({ page }) => {
    await page.goto("/");
    await enterStudio(page);
    await page.goto("/#/collection");
    await expect(page.getByRole("heading", { name: "Chromatic Pet Collection", level: 1 })).toBeVisible();
    const results = await scan(page);
    expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);
  });

  test("Station and Puzzle have no WCAG A/AA violations", async ({ page }) => {
    await page.goto("/");
    await enterStudio(page);
    await page.getByRole("button", { name: "Enter Light Laboratory" }).click();
    await expect(page.getByRole("heading", { name: "Light Laboratory", level: 1 })).toBeVisible();
    let results = await scan(page);
    expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);

    await page.getByRole("button", { name: /^Play Create White Light/ }).click();
    await passPuzzle01Quiz(page);
    results = await scan(page);
    expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);
  });

  test("Grand Canvas has no WCAG A/AA violations", async ({ page }) => {
    await page.goto("/");
    await enterStudio(page);
    await autoSolve(page);
    const results = await scan(page);
    expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);
  });
});
