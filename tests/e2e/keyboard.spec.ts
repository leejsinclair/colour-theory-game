/**
 * T090 (US7) — the primary journey is completable with the keyboard alone, and
 * a visible focus ring is present at every stop (SC-006,
 * contracts/ui-contract.md §Behavioural guarantees / Keyboard).
 *
 * Focus is moved with real Tab presses (so `:focus-visible` engages the way it
 * does for a keyboard user) and controls are activated with Enter / Space.
 */
import { expect, test, type Locator, type Page } from "@playwright/test";
import { activateAllBeams, passPuzzle01Quiz } from "./support";

/** Press Tab until `target` is focused (bounded), then return it. */
async function tabTo(page: Page, target: Locator, max = 25): Promise<Locator> {
  for (let i = 0; i < max; i += 1) {
    if (await target.evaluate((el) => el === document.activeElement).catch(() => false)) {
      return target;
    }
    await page.keyboard.press("Tab");
  }
  await expect(target).toBeFocused(); // fail with a useful message
  return target;
}

async function expectFocusRing(control: Locator): Promise<void> {
  const ring = await control.evaluate((el) => {
    const s = getComputedStyle(el);
    return { boxShadow: s.boxShadow, outlineStyle: s.outlineStyle, outlineWidth: s.outlineWidth };
  });
  const hasRing =
    (ring.boxShadow !== "none" && ring.boxShadow !== "") ||
    (ring.outlineStyle !== "none" && parseFloat(ring.outlineWidth) > 0);
  expect(hasRing, `no visible focus ring: ${JSON.stringify(ring)}`).toBe(true);
}

test.describe("keyboard-only journey (SC-006)", () => {
  test("the skip link is the first focusable and reveals on focus", async ({ page }) => {
    await page.goto("/");
    // On load, focus is placed on the screen <h1> for screen-reader context.
    const heading = page.getByRole("heading", { name: "Welcome to the Studio", level: 1 });
    await expect(heading).toBeFocused();

    // The skip link is the focusable immediately before the main content.
    await page.keyboard.press("Shift+Tab");
    const skip = page.getByRole("link", { name: "Skip to main content" });
    await expect(skip).toBeFocused();
    // Revealed on focus (not left clipped) — a real on-screen target.
    await expect(skip).toBeInViewport();
    await expectFocusRing(skip);
  });

  test("Studio → station → learning gate → puzzle → Check → Continue by keyboard", async ({ page }) => {
    await page.goto("/");

    const enter = await tabTo(page, page.getByRole("button", { name: "Enter the Studio" }));
    await expectFocusRing(enter);
    await page.keyboard.press("Enter");
    await expect(page.getByRole("heading", { name: "Chromatic Mastery Studio", level: 1 })).toBeVisible();

    const station = await tabTo(page, page.getByRole("button", { name: "Enter Light Laboratory" }));
    await expectFocusRing(station);
    await page.keyboard.press("Enter");
    await expect(page.getByRole("heading", { name: "Light Laboratory", level: 1 })).toBeVisible();

    const play = await tabTo(page, page.getByRole("button", { name: /^Play Create White Light/ }));
    await expectFocusRing(play);
    await page.keyboard.press("Enter");
    await expect(page.getByRole("heading", { name: "Create White Light", level: 1 })).toBeVisible();

    // Learning gate (operates real radio + button controls).
    await passPuzzle01Quiz(page);

    // Puzzle body — the custom beam buttons take a visible ring under keyboard focus.
    const redBeam = await tabTo(page, page.getByRole("button", { name: "Red Beam" }));
    await expectFocusRing(redBeam);
    await activateAllBeams(page);

    const check = await tabTo(page, page.getByRole("button", { name: "Check" }));
    await expectFocusRing(check);
    await page.keyboard.press("Enter");

    const cont = await tabTo(page, page.getByRole("button", { name: "Continue" }));
    await expectFocusRing(cont);
    await page.keyboard.press("Enter");

    await expect(page.getByRole("heading", { name: "Light Laboratory", level: 1 })).toBeVisible();
  });
});
