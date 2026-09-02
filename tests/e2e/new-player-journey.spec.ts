/**
 * New Player Journey (T035) — the complete React experience from a fresh
 * localStorage to the Grand Canvas, asserted against the accessible UI contract
 * (roles + names), not CSS. Covers: intro, studio orientation, learning gate,
 * a wrong then correct solve, pet reveal, station unlock and progression.
 */
import { expect, test } from "@playwright/test";
import {
  activateAllBeams,
  autoSolve,
  enterStudio,
  injectProgress,
  passPuzzle01Quiz,
} from "./support";

test.describe("new player journey", () => {
  test("fresh load shows the caretaker intro", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Welcome to the Studio", level: 1 })).toBeVisible();
    await expect(page.getByRole("button", { name: "Enter the Studio" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Skip" })).toBeVisible();
  });

  test("studio orients the player: progress, stations, recommended next", async ({ page }) => {
    await page.goto("/");
    await enterStudio(page);

    await expect(page.getByText("0 of 22 puzzles solved", { exact: false })).toBeVisible();
    await expect(page.getByRole("button", { name: /^Recommended:/ })).toBeVisible();
    await expect(page.getByRole("button", { name: "Enter Light Laboratory" })).toBeVisible();

    // Locked stations are communicated by text, not colour alone.
    const locked = page.getByText("Locked — finish previous stations");
    await expect(locked.first()).toBeVisible();
  });

  test("learning gate: puzzle body is hidden until the quiz passes at 100%", async ({ page }) => {
    await page.goto("/");
    await enterStudio(page);
    await page.getByRole("button", { name: "Enter Light Laboratory" }).click();
    await page.getByRole("button", { name: /^Play Create White Light/ }).click();

    await expect(page.getByRole("heading", { name: "Create White Light", level: 1 })).toBeVisible();
    await expect(page.getByRole("button", { name: "Check" })).toHaveCount(0);

    await page.getByRole("button", { name: "Start quiz" }).click();
    // Wrong answers first.
    await page.getByRole("radio", { name: "Because pigments reflect those three colors" }).check();
    await page.getByRole("radio", { name: "It becomes darker because colors cancel out" }).check();
    await page.getByRole("button", { name: "Submit quiz" }).click();
    await expect(
      page.getByRole("article", { name: /^Quiz:/ }).getByText(/You need 100%/),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "Check" })).toHaveCount(0);

    // Correct answers now open the gate.
    await page
      .getByRole("radio", { name: "Because emitted light wavelengths add to form other colors" })
      .check();
    await page.getByRole("radio", { name: "It shifts toward green and may become lighter" }).check();
    await page.getByRole("button", { name: "Submit quiz" }).click();
    await expect(page.getByRole("button", { name: "Check" })).toBeVisible();
  });

  test("wrong then correct solve: feedback, pet reveal, station progression", async ({ page }) => {
    await page.goto("/");
    await enterStudio(page);
    await page.getByRole("button", { name: "Enter Light Laboratory" }).click();
    await page.getByRole("button", { name: /^Play Create White Light/ }).click();
    await passPuzzle01Quiz(page);

    // Wrong: no beams.
    await page.getByRole("button", { name: "Check" }).click();
    const result = page.getByRole("alert");
    await expect(result).toContainText("Not quite");
    await page.getByRole("button", { name: "Try again" }).click();

    // Correct.
    await activateAllBeams(page);
    await page.getByRole("button", { name: "Check" }).click();

    await expect(page.getByRole("img", { name: "Glow Sprite collected" })).toBeVisible();
    await page.getByRole("button", { name: "Continue" }).click();

    // Back on the station — puzzle-01 solved, puzzle-02 now playable.
    await expect(page.getByRole("heading", { name: "Light Laboratory", level: 1 })).toBeVisible();
    await expect(page.getByRole("button", { name: /^Practice Create White Light/ })).toBeVisible();
    await expect(page.getByRole("button", { name: /^Play Printer Pigments/ })).toBeVisible();
  });

  test("completing a station unlocks the next and offers a CTA", async ({ page }) => {
    await injectProgress(page, ["puzzle-01", "puzzle-02", "puzzle-03"]);
    await page.goto("/");
    await enterStudio(page);

    await expect(page.getByRole("button", { name: "Enter Value Sketchboard" })).toBeVisible();

    await page.getByRole("button", { name: /^(Enter|Continue) Light Laboratory/ }).click();
    await expect(page.getByRole("button", { name: "Go to Value Sketchboard" })).toBeVisible();
    await page.getByRole("button", { name: "Go to Value Sketchboard" }).click();
    await expect(page.getByRole("heading", { name: "Value Sketchboard", level: 1 })).toBeVisible();
  });

  test("auto solve reaches the Grand Canvas with every pet", async ({ page }) => {
    await page.goto("/");
    await enterStudio(page);
    await autoSolve(page);

    await expect(page.getByText("Pets rescued: 22/22")).toBeVisible();
    await expect(page.getByRole("button", { name: "Return to Studio" })).toBeVisible();
    await page.getByRole("button", { name: "Return to Studio" }).click();
    await expect(page.getByRole("heading", { name: "Chromatic Mastery Studio", level: 1 })).toBeVisible();
    // All stations open for free revisiting.
    await expect(page.getByRole("button", { name: /Design Studio/ })).toBeEnabled();
  });

  test("the finale is distinct, keeps its stats, and its bonus is applied once", async ({ page }) => {
    await page.goto("/");
    await enterStudio(page);
    await autoSolve(page);

    // Reads as a finale, not a puzzle screen: hero heading + preserved stats.
    await expect(page.getByRole("heading", { name: "Grand Canvas", level: 1 })).toBeVisible();
    await expect(page.getByText("Puzzles solved: 22")).toBeVisible();
    await expect(page.getByText("Pets rescued: 22/22")).toBeVisible();
    await expect(page.getByText(/^Best streak: \d+$/)).toBeVisible();

    const scoreTile = page.getByRole("status").filter({ hasText: "Score" });
    const scoreAtUnlock = (await scoreTile.textContent())?.replace(/\D/g, "");

    // Leave and re-enter via the nav — the +200 finale bonus is not re-applied.
    await page.getByRole("button", { name: "Return to Studio" }).click();
    await expect(
      page.getByRole("heading", { name: "Chromatic Mastery Studio", level: 1 }),
    ).toBeVisible();
    await page
      .getByRole("navigation", { name: "Game navigation" })
      .getByRole("link", { name: "Grand Canvas" })
      .click();
    await expect(page.getByRole("heading", { name: "Grand Canvas", level: 1 })).toBeVisible();
    expect((await scoreTile.textContent())?.replace(/\D/g, "")).toBe(scoreAtUnlock);

    // Every station is unlocked for free revisiting / practice.
    await page.getByRole("button", { name: "Return to Studio" }).click();
    for (const station of ["Light Laboratory", "Value Sketchboard", "Design Studio"]) {
      await expect(
        page.getByRole("button", { name: new RegExp(`(Enter|Continue) ${station}`) }),
      ).toBeEnabled();
    }
  });
});
