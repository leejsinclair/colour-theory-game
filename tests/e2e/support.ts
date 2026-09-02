import { expect, type Page } from "@playwright/test";

/**
 * Shared helpers for the React UI e2e suite. Selectors follow
 * `specs/001-react-refactor-redesign/contracts/ui-contract.md` — roles and
 * accessible names, never CSS classes or DOM ids.
 */

export async function openMenuItem(page: Page, name: string): Promise<void> {
  await page.getByRole("button", { name: "Menu" }).click();
  await page.getByRole("menuitem", { name }).click();
}

/** Auto-solve the whole journey (dev/e2e menu item) and land on the Grand Canvas. */
export async function autoSolve(page: Page): Promise<void> {
  await openMenuItem(page, "Auto solve journey");
  await expect(page.getByRole("heading", { name: "Grand Canvas", level: 1 })).toBeVisible();
}

/** From the intro screen, enter the Studio. No-op if already past it. */
export async function enterStudio(page: Page): Promise<void> {
  const enter = page.getByRole("button", { name: "Enter the Studio" });
  if (await enter.count()) {
    await enter.click();
  }
  await expect(page.getByRole("heading", { name: "Chromatic Mastery Studio", level: 1 })).toBeVisible();
}

/** Pass puzzle-01's learning quiz (correct answers). Assumes the puzzle screen is open. */
export async function passPuzzle01Quiz(page: Page): Promise<void> {
  await page.getByRole("button", { name: "Start quiz" }).click();
  await page
    .getByRole("radio", { name: "Because emitted light wavelengths add to form other colors" })
    .check();
  await page.getByRole("radio", { name: "It shifts toward green and may become lighter" }).check();
  await page.getByRole("button", { name: "Submit quiz" }).click();
  await expect(page.getByRole("button", { name: "Check" })).toBeVisible();
}

/** Turn on all four RGB beams (puzzle-01's native React body). */
export async function activateAllBeams(page: Page): Promise<void> {
  for (const beam of ["Red Beam", "Green Beam", "Blue Beam", "Align Overlap"]) {
    await page.getByRole("button", { name: beam }).click();
  }
}

/**
 * Seed a mid-game `localStorage` snapshot, then reload so the app restores from
 * it. Navigates to `/` first if needed. Uses a one-shot `evaluate` (not
 * `addInitScript`) so a later Reset run is not re-seeded on the next reload.
 */
export async function injectProgress(
  page: Page,
  completedPuzzleIds: string[],
  quizPassedIds: string[] = [],
): Promise<void> {
  if (!page.url().startsWith("http")) {
    await page.goto("/");
  }
  const learningProgressByPuzzle = Object.fromEntries(
    quizPassedIds.map((id) => [id, { quizPassed: true }]),
  );
  await page.evaluate(
    ({ ids, lp }) => {
      window.localStorage.setItem(
        "ctg:web-progress:v1",
        JSON.stringify({
          completedPuzzleIds: ids,
          activeStationId: null,
          practicePuzzleId: null,
          learningProgressByPuzzle: lp,
          introSeen: true,
        }),
      );
    },
    { ids: completedPuzzleIds, lp: learningProgressByPuzzle },
  );
  await page.reload();
}
