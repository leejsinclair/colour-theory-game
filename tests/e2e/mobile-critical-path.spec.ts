/**
 * T088 (US7) — the primary journey on a 320 px viewport: Studio → station →
 * learning gate → puzzle → Check → Continue → next station, with no horizontal
 * page scroll at any step and touch-operable controls (FR-052, FR-054, SC-007).
 */
import { expect, test, type Page } from "@playwright/test";
import { activateAllBeams, enterStudio, passPuzzle01Quiz } from "./support";

test.use({ viewport: { width: 320, height: 720 }, hasTouch: true });

async function expectNoHorizontalScroll(page: Page, where: string): Promise<void> {
  const overflow = await page.evaluate(() => {
    const el = document.scrollingElement ?? document.documentElement;
    return { scrollWidth: el.scrollWidth, clientWidth: el.clientWidth };
  });
  expect(
    overflow.scrollWidth,
    `${where}: page scrolls horizontally (${overflow.scrollWidth} > ${overflow.clientWidth})`,
  ).toBeLessThanOrEqual(overflow.clientWidth + 1);
}

test.describe("mobile critical path (320 px)", () => {
  test("plays Studio → puzzle → next station with no horizontal page scroll", async ({ page }) => {
    await page.goto("/");
    await enterStudio(page);
    await expectNoHorizontalScroll(page, "Studio");

    // Station cards stack; the first station is reachable by tap.
    await page.getByRole("button", { name: "Enter Light Laboratory" }).tap();
    await expect(page.getByRole("heading", { name: "Light Laboratory", level: 1 })).toBeVisible();
    await expectNoHorizontalScroll(page, "Station");

    await page.getByRole("button", { name: /^Play Create White Light/ }).tap();
    await expect(page.getByRole("heading", { name: "Create White Light", level: 1 })).toBeVisible();
    await expectNoHorizontalScroll(page, "Puzzle (learning gate)");

    await passPuzzle01Quiz(page);
    await expectNoHorizontalScroll(page, "Puzzle (solve)");

    // Puzzle controls are usable by touch.
    await activateAllBeams(page);
    await page.getByRole("button", { name: "Check" }).tap();

    await expect(page.getByRole("status").filter({ hasText: "✓" })).toBeVisible();
    await expectNoHorizontalScroll(page, "Puzzle (reward)");

    await page.getByRole("button", { name: "Continue" }).tap();
    await expect(page.getByRole("heading", { name: "Light Laboratory", level: 1 })).toBeVisible();
    await expectNoHorizontalScroll(page, "Station (after solve)");
  });

  test("every primary screen fits the viewport width", async ({ page }) => {
    await page.goto("/");
    await enterStudio(page);

    for (const [label, href] of [
      ["Studio", "#/studio"],
      ["Collection", "#/collection"],
    ] as const) {
      await page.goto(`/${href}`);
      await page.waitForLoadState("networkidle");
      await expectNoHorizontalScroll(page, label);
    }
  });
});
