/**
 * T096 (US5) — the Chromatic Pet collection at fresh / partial / complete
 * progress: locked pets are silhouettes with a reveal hint, a freed pet shows
 * its name + origin station, and every tile is reachable by keyboard
 * (FR-038, FR-039, contracts/ui-contract.md §Collection).
 */
import { expect, test, type Page } from "@playwright/test";
import { enterStudio, injectProgress } from "./support";

const ALL_PLAYABLE = [
  ...Array.from({ length: 21 }, (_, i) => `puzzle-${String(i + 1).padStart(2, "0")}`),
  "puzzle-23",
];

async function openCollection(page: Page): Promise<void> {
  await enterStudio(page);
  await page.getByRole("link", { name: /^View pet collection:/ }).click();
  await expect(
    page.getByRole("heading", { name: "Chromatic Pet Collection", level: 1 }),
  ).toBeVisible();
}

test.describe("Chromatic Pet collection (US5)", () => {
  test("fresh: every pet is a locked silhouette with a reveal hint", async ({ page }) => {
    await page.goto("/");
    await openCollection(page);

    await expect(page.getByText("0 of 22 freed")).toBeVisible();
    await expect(page.getByRole("img", { name: /^Locked pet — solve/ })).toHaveCount(22);
  });

  test("partial: a solved puzzle frees exactly its pet; the rest stay locked", async ({ page }) => {
    await injectProgress(page, ["puzzle-01"]);
    await page.goto("/");
    await openCollection(page);

    await expect(page.getByText("1 of 22 freed")).toBeVisible();
    await expect(
      page.getByRole("img", { name: "Glow Sprite — from Light Laboratory" }),
    ).toBeVisible();
    await expect(page.getByRole("img", { name: /^Locked pet — solve/ })).toHaveCount(21);
  });

  test("a freed pet tile is reachable by keyboard with its label", async ({ page }) => {
    await injectProgress(page, ["puzzle-01"]);
    await page.goto("/");
    await openCollection(page);

    const pet = page.getByRole("img", { name: "Glow Sprite — from Light Laboratory" });
    await pet.focus();
    await expect(pet).toBeFocused();
  });

  test("complete: the whole roll is freed, nothing left locked", async ({ page }) => {
    await injectProgress(page, ALL_PLAYABLE);
    await page.goto("/");
    // A finished game boots to the finale; reach the collection via the HUD pet strip.
    await expect(page.getByRole("heading", { name: "Grand Canvas", level: 1 })).toBeVisible();
    await page.getByRole("link", { name: /^View pet collection:/ }).click();
    await expect(
      page.getByRole("heading", { name: "Chromatic Pet Collection", level: 1 }),
    ).toBeVisible();

    await expect(page.getByText("22 of 22 freed")).toBeVisible();
    await expect(page.getByRole("img", { name: /Locked pet/ })).toHaveCount(0);
  });
});
