/**
 * Practising a solved puzzle keeps the Check action available (T036) — the
 * Check button lives inside the React puzzle subtree (FR-006).
 */
import { expect, test } from "@playwright/test";
import { autoSolve, enterStudio } from "./support";

test("a solved Design Studio puzzle can be practised with Check present", async ({ page }) => {
  await page.goto("/");
  await enterStudio(page);
  await autoSolve(page);
  await page.getByRole("button", { name: "Return to Studio" }).click();

  await page.getByRole("button", { name: /Design Studio/ }).click();
  await expect(page.getByRole("heading", { name: "Design Studio", level: 1 })).toBeVisible();

  await page.getByRole("button", { name: /^Practice Color Balance/ }).click();
  await expect(page.getByRole("button", { name: "Check" })).toBeVisible();
  // Legacy composition body still renders through the adapter.
  await expect(page.locator(".balance-composition")).toBeVisible();
});
