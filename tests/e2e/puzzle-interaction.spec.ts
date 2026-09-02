/**
 * T067 (US3) — puzzle bodies are native React components: their controls are
 * operable by pointer and by keyboard, and a wrong Check followed by a correct
 * one behaves across more than one station.
 */
import { expect, test } from "@playwright/test";
import { enterStudio, injectProgress } from "./support";

const solved = (upTo: number): string[] =>
  Array.from({ length: upTo }, (_, i) => `puzzle-${String(i + 1).padStart(2, "0")}`);

test.describe("puzzle interaction", () => {
  test("station 1 (pointer): wrong Check then a correct one on Create White Light", async ({ page }) => {
    await injectProgress(page, [], ["puzzle-01"]);
    await page.goto("/");
    await enterStudio(page);

    await page.getByRole("button", { name: "Enter Light Laboratory" }).click();
    await page.getByRole("button", { name: /^Play Create White Light/ }).click();

    // Wrong: submit with no beams active.
    await page.getByRole("button", { name: "Check" }).click();
    await expect(page.getByRole("alert")).toContainText("Not quite");
    await page.getByRole("button", { name: "Try again" }).click();

    // Correct: activate all four beams by clicking.
    for (const beam of ["Red Beam", "Green Beam", "Blue Beam", "Align Overlap"]) {
      await page.getByRole("button", { name: beam }).click();
    }
    await page.getByRole("button", { name: "Check" }).click();
    await expect(page.getByRole("button", { name: "Continue" })).toBeVisible();
  });

  test("station 3 (keyboard): a hue slider on Triadic Harmony responds to arrow keys", async ({ page }) => {
    await injectProgress(page, solved(7), ["puzzle-08"]);
    await page.goto("/");
    await enterStudio(page);

    await page.getByRole("button", { name: /^(Enter|Continue) Color Wheel Table/ }).click();
    await page.getByRole("button", { name: /^Play Triadic Harmony/ }).click();

    const firstSlider = page.getByRole("slider").first();
    await firstSlider.focus();
    const before = Number(await firstSlider.getAttribute("aria-valuenow"));
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("ArrowRight");
    const after = Number(await firstSlider.getAttribute("aria-valuenow"));
    expect(after).toBeGreaterThan(before);

    // Return to the default triad (0/120/240 is valid) and solve.
    await page.keyboard.press("ArrowLeft");
    await page.keyboard.press("ArrowLeft");
    await page.getByRole("button", { name: "Check" }).click();
    await expect(page.getByRole("button", { name: "Continue" })).toBeVisible();
  });

  test("station 6 (gated + pointer): wrong then correct pigments on Vibrant Green", async ({ page }) => {
    await injectProgress(page, solved(15), ["puzzle-16"]);
    await page.goto("/");
    await enterStudio(page);

    await page.getByRole("button", { name: "Enter Paint Workbench" }).click();
    await page.getByRole("button", { name: /^Play Vibrant Green/ }).click();

    // Learning gate already passed via injected quiz progress → Check is live.
    await expect(page.getByRole("button", { name: "Check" })).toBeVisible();

    // Wrong: two yellows.
    await page.getByRole("button", { name: "hansa yellow", exact: true }).click();
    await page.getByRole("button", { name: "cadmium lemon", exact: true }).click();
    await page.getByRole("button", { name: "Check" }).click();
    await expect(page.getByRole("alert")).toContainText("Not quite");
    await page.getByRole("button", { name: "Try again" }).click();

    // Correct: one clean yellow + one clean blue.
    await page.getByRole("button", { name: "hansa yellow", exact: true }).click();
    await page.getByRole("button", { name: "phthalo blue", exact: true }).click();
    await page.getByRole("button", { name: "Check" }).click();
    await expect(page.getByRole("img", { name: /Paint Slime collected/ })).toBeVisible();
  });
});
