/**
 * Persistence & reset (T037) — solved state, quiz passes and the current route
 * survive a reload; Reset run wipes everything (FR-049–FR-051, SC-003).
 */
import { expect, test } from "@playwright/test";
import {
  activateAllBeams,
  enterStudio,
  injectProgress,
  openMenuItem,
  passPuzzle01Quiz,
} from "./support";

test("a solved puzzle and quiz pass survive a reload", async ({ page }) => {
  await page.goto("/");
  await enterStudio(page);
  await page.getByRole("button", { name: "Enter Light Laboratory" }).click();
  await page.getByRole("button", { name: /^Play Create White Light/ }).click();
  await passPuzzle01Quiz(page);
  await activateAllBeams(page);
  await page.getByRole("button", { name: "Check" }).click();
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.getByRole("button", { name: /^Practice Create White Light/ })).toBeVisible();

  await page.reload();

  // Restored into the station; puzzle-01 still solved, puzzle-02 not re-gated.
  await expect(page.getByRole("heading", { name: "Light Laboratory", level: 1 })).toBeVisible();
  await expect(page.getByRole("button", { name: /^Practice Create White Light/ })).toBeVisible();
  await page.getByRole("button", { name: /^Play Printer Pigments/ }).click();
  await expect(page.getByRole("button", { name: "Start quiz" })).toBeVisible();
});

test("mid-game route is restored on reload", async ({ page }) => {
  await injectProgress(page, ["puzzle-01", "puzzle-02", "puzzle-03"]);
  await enterStudio(page);
  await page.getByRole("button", { name: "Enter Value Sketchboard" }).click();
  await expect(page).toHaveURL(/#\/station\/station-02/);
  await expect(page.getByRole("heading", { name: "Value Sketchboard", level: 1 })).toBeVisible();
  // Let the debounced persistence write flush.
  await page.waitForTimeout(400);

  await page.reload();
  await expect(page.getByRole("heading", { name: "Value Sketchboard", level: 1 })).toBeVisible();
});

test("reset run clears the save and returns to a fresh game", async ({ page }) => {
  await injectProgress(page, ["puzzle-01", "puzzle-02", "puzzle-03"]);
  await enterStudio(page);
  await expect(page.getByRole("button", { name: "Enter Value Sketchboard" })).toBeVisible();

  await openMenuItem(page, "Reset run");
  await expect(page.getByText("0 of 22 puzzles solved", { exact: false })).toBeVisible();
  await expect(page.getByRole("button", { name: "Enter Value Sketchboard" })).toHaveCount(0);

  // A reset is a full fresh start — reload shows the caretaker intro again.
  await page.reload();
  await expect(page.getByRole("heading", { name: "Welcome to the Studio", level: 1 })).toBeVisible();
  await enterStudio(page);
  await expect(page.getByText("0 of 22 puzzles solved", { exact: false })).toBeVisible();
});
