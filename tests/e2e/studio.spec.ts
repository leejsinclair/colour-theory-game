/**
 * Studio, HUD, navigation and the info modal (T036) — role/name selectors per
 * the accessible UI contract.
 */
import { expect, test } from "@playwright/test";
import { autoSolve, enterStudio, injectProgress, openMenuItem } from "./support";

test.describe("studio & shell", () => {
  test("HUD shows score, pets and Grand-Canvas progress", async ({ page }) => {
    await page.goto("/");
    await enterStudio(page);

    await expect(page.getByText("Score")).toBeVisible();
    await expect(page.getByText("Pets collected: 0 of 22")).toBeVisible();
    await expect(
      page.getByRole("progressbar", { name: /Grand Canvas progress: 0 of 22/ }),
    ).toBeVisible();
    // Streak tile is hidden when there is no streak.
    await expect(page.getByText(/^Streak:/)).toHaveCount(0);
  });

  test("the app menu exposes reset / replay / feedback", async ({ page }) => {
    await page.goto("/");
    await enterStudio(page);
    await page.getByRole("button", { name: "Menu" }).click();
    await expect(page.getByRole("menuitem", { name: "Reset run" })).toBeVisible();
    await expect(page.getByRole("menuitem", { name: "Replay intro" })).toBeVisible();
    await expect(page.getByRole("menuitem", { name: "Feedback" })).toBeVisible();
    await expect(page.getByRole("menuitem", { name: "Auto solve journey" })).toBeVisible();
  });

  test("navigation between studio and collection", async ({ page }) => {
    await page.goto("/");
    await enterStudio(page);
    await page.getByRole("navigation", { name: "Game navigation" }).getByRole("link", { name: "Collection" }).click();
    await expect(
      page.getByRole("heading", { name: "Chromatic Pet Collection", level: 1 }),
    ).toBeVisible();
    await page.getByRole("navigation", { name: "Game navigation" }).getByRole("link", { name: "Studio" }).click();
    await expect(page.getByRole("heading", { name: "Chromatic Mastery Studio", level: 1 })).toBeVisible();
  });

  test("locked stations are not enterable and say why", async ({ page }) => {
    await page.goto("/");
    await enterStudio(page);
    await expect(page.getByRole("button", { name: "Enter Value Sketchboard" })).toHaveCount(0);
    await expect(page.getByText("Locked — finish previous stations").first()).toBeVisible();
  });

  test("station cards carry identity and a non-colour-only lock state", async ({ page }) => {
    await page.goto("/");
    await enterStudio(page);

    const lightLab = page.getByRole("article", { name: "Light Laboratory" });
    await expect(lightLab.getByRole("heading", { name: "Light Laboratory" })).toBeVisible();
    await expect(lightLab.getByText("3 puzzles")).toBeVisible();
    await expect(lightLab.getByText(/0 of 3 solved/)).toBeVisible();
    await expect(lightLab.getByRole("button", { name: "Enter Light Laboratory" })).toBeVisible();

    // A locked card: icon + text, and no way to enter.
    const sketchboard = page.getByRole("article", { name: "Value Sketchboard" });
    await expect(sketchboard.getByText("Locked — finish previous stations")).toBeVisible();
    await expect(sketchboard.getByText("Locked").first()).toBeVisible();
    await expect(sketchboard.getByRole("button")).toHaveCount(0);

    // The recommended-next affordance is present on load.
    await expect(page.getByRole("button", { name: /^Recommended:/ })).toBeVisible();
  });

  test("info modal opens for a puzzle and closes on Escape", async ({ page }) => {
    await page.goto("/");
    await enterStudio(page);
    await page.getByRole("button", { name: "Enter Light Laboratory" }).click();
    await page.getByRole("button", { name: /^Play Create White Light/ }).click();
    await page.getByRole("button", { name: "How this works" }).first().click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText(/White Light/i);
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toHaveCount(0);
  });

  test("collection: unlocked pets show name + origin after solving", async ({ page }) => {
    await injectProgress(page, ["puzzle-01"]);
    await page.goto("/");
    await enterStudio(page);
    await page.getByRole("navigation", { name: "Game navigation" }).getByRole("link", { name: "Collection" }).click();
    await expect(page.getByRole("img", { name: /Glow Sprite — from Light Laboratory/ })).toBeVisible();
    await expect(page.getByRole("img", { name: /Locked pet/ }).first()).toBeVisible();
  });

  test("reset run wipes progress and returns to a fresh Studio", async ({ page }) => {
    await page.goto("/");
    await enterStudio(page);
    await autoSolve(page);
    await openMenuItem(page, "Reset run");

    await expect(page.getByRole("heading", { name: "Chromatic Mastery Studio", level: 1 })).toBeVisible();
    await expect(page.getByText("0 of 22 puzzles solved", { exact: false })).toBeVisible();
    await expect(page.getByRole("button", { name: "Enter Value Sketchboard" })).toHaveCount(0);
  });
});
