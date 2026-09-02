/**
 * T084 (US4) — success is rewarding but never blocks, and failure explains the
 * specific colour-theory principle to reconsider. Under reduced motion the
 * celebration collapses to a static treatment.
 */
import { expect, test } from "@playwright/test";
import { activateAllBeams, enterStudio, injectProgress, passPuzzle01Quiz } from "./support";

async function openCreateWhiteLight(page: import("@playwright/test").Page): Promise<void> {
  await enterStudio(page);
  await page.getByRole("button", { name: "Enter Light Laboratory" }).click();
  await page.getByRole("button", { name: /^Play Create White Light/ }).click();
}

test.describe("feedback loop", () => {
  test("a correct solve celebrates without blocking the Continue action", async ({ page }) => {
    await injectProgress(page, [], ["puzzle-01"]);
    await page.goto("/");
    await openCreateWhiteLight(page);

    await activateAllBeams(page);
    await page.getByRole("button", { name: "Check" }).click();

    // The reward is a polite status region, and Continue works right away —
    // the celebration layer must not intercept the click.
    const reward = page.getByRole("status").filter({ hasText: "✓" });
    await expect(reward).toBeVisible();
    await expect(reward).toContainText("Glow Sprite freed");
    await page.getByRole("button", { name: "Continue" }).click();
    await expect(page.getByRole("heading", { name: "Light Laboratory", level: 1 })).toBeVisible();
  });

  test("a wrong answer names the specific principle to revisit", async ({ page }) => {
    await page.goto("/");
    await openCreateWhiteLight(page);
    await passPuzzle01Quiz(page);

    await page.getByRole("button", { name: "Check" }).click();

    const result = page.getByRole("alert");
    await expect(result).toContainText("Not quite");
    await expect(result).toContainText("Principle to revisit:");
    await expect(result).toContainText("Hue relationships");
    await expect(result).toContainText(/colour wheel/i);
  });

  test.describe("with reduced motion", () => {
    test("the celebration renders as a static cluster", async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await injectProgress(page, [], ["puzzle-01"]);
      await page.goto("/");
      await openCreateWhiteLight(page);

      await activateAllBeams(page);
      await page.getByRole("button", { name: "Check" }).click();

      await expect(page.getByRole("status").filter({ hasText: "✓" })).toBeVisible();
      await expect(page.locator(".ds-celebration")).toHaveClass(/ds-celebration--static/);
    });
  });
});
