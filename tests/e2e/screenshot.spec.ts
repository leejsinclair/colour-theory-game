/**
 * Result Analysis feedback (T036) — a wrong Check surfaces the specific
 * diagnosis in an `alert` region starting "Not quite"; it clears on the next
 * attempt (FR-017, FR-034).
 */
import { expect, test } from "@playwright/test";
import { autoSolve, enterStudio } from "./support";

test("wrong pigments on Vibrant Green show a specific Result Analysis", async ({ page }) => {
  await page.goto("/");
  await enterStudio(page);
  await autoSolve(page);
  await page.getByRole("button", { name: "Return to Studio" }).click();

  await page.getByRole("button", { name: /Paint Workbench/ }).click();
  await page.getByRole("button", { name: /^Practice Vibrant Green/ }).click();

  await page.getByRole("button", { name: "hansa yellow", exact: true }).click();
  await page.getByRole("button", { name: "yellow ochre", exact: true }).click();
  await page.getByRole("button", { name: "Check" }).click();

  const alert = page.getByRole("alert");
  await expect(alert).toContainText("Not quite");
  await expect(alert).toContainText(/pigment|hue|mud|chroma|bias/i);

  // Retry clears it.
  await page.getByRole("button", { name: "Try again" }).click();
  await expect(page.getByRole("alert")).toHaveCount(0);
});
