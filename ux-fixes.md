# UX fixes — handoff

A UX review of the web app (branch `001-react-refactor-redesign`) walked every
screen with Playwright at desktop (1440×900) and mobile (390×844), in fresh,
mid-progression, and 100%-complete states, including solving a puzzle, hitting a
failure, opening the app menu, and reaching the Grand Canvas.

This document is the fix list for a follow-up session. Items are ordered by
priority. Each has: what's wrong, where, how to reproduce, and a concrete
before/after. Definition of done per `EPCC.md` — `npm run build` always,
`npm test` for logic, `npm run lint` for style edits, `npm run test:e2e` for
UI/journey changes.

---

## P1 — looks broken

### 1.1 The `<h1>` renders as a full-width bordered box on every screen

**Where:** `src/web/app/App.tsx:62-68` moves focus to each screen's `<h1>` on
route change (sets `tabindex="-1"`, calls `.focus()`). Nothing suppresses the UA
focus outline. Because `<h1>` is `display:block`, the outline spans the full
content width and reads as a broken text input around the title. On mobile
(`src/web/screens/PuzzleScreen` etc.) it clips off both screen edges.

**Repro:** load any route (`#/studio`, `#/collection`, a puzzle). The title has a
rectangular outline the width of the content column.

**Fix:** `src/web/design-system/styles.css`, near `.ds-heading` (line ~184):

```css
/* Programmatic route-change focus is for assistive-tech context, not a
   visual target. Keep the ring only for real keyboard focus. */
.ds-heading:focus { outline: none; }
.ds-heading:focus-visible { outline: none; box-shadow: var(--focus-ring); }
```

Verify keyboard focus (Tab through the skip-link → nav → main) still shows a
visible ring where expected; the route-change focus should now be invisible.

---

### 1.2 The `⋮` app menu is MUI's default light theme in a dark app

**Where:** `src/web/design-system/Menu.tsx` renders `<MuiMenu>` / `<MuiMenuItem>`
with no `ThemeProvider` (per `CLAUDE.md`, "MUI does not theme the app").
`src/web/design-system/styles.css:393` `.ds-menu__paper` sets a dark
`background-color`, but MUI's `.MuiPaper-root { background:#fff }` ties on
specificity and wins on stylesheet source order.

**Repro:** dev server, open the `⋮` menu (top right). On mobile especially: white
panel, dark text, huge row spacing, and the panel is **clipped off the right
edge** so "Auto solve journey" is cut. It overlaps the `<h1>` and tab bar.
"Reset run" (destructive — wipes all progress) sits flush against "Replay intro"
with no divider or danger styling.

**Fix, three parts:**

1. Specificity bump — `src/web/design-system/styles.css`:

```css
.ds-menu__paper.MuiPaper-root {
  background-color: var(--surface-2);
  color: var(--text-primary);
  border: 1px solid var(--surface-border-strong);
  border-radius: var(--radius-md);
}
.ds-menu__paper .MuiMenuItem-root {
  font: inherit;
  min-height: var(--touch-min);
  padding: var(--space-xs) var(--space-md);
}
.ds-menu__paper .MuiMenuItem-root:hover,
.ds-menu__paper .MuiMenuItem-root.Mui-focusVisible {
  background-color: var(--surface-3);
}
```

2. Open inward on narrow screens — `src/web/design-system/Menu.tsx`, on
   `<MuiMenu>`:

```tsx
anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
transformOrigin={{ vertical: "top", horizontal: "right" }}
```

3. Destructive styling for "Reset run" — add an optional `tone: "danger"` (or
   `separatorBefore: true`) to `MenuItemSpec` in `Menu.tsx`, render it with
   `--state-failure` text and a top border, and set it in
   `src/web/components/AppMenu.tsx:27-34`. Also consider a confirm step before
   `actions.reset()` runs (see 5.2).

---

### 1.3 Solving a puzzle fires the full-screen overlay AND a stack of toasts

**Where:** `src/web/screens/PuzzleScreen.tsx:82-111` (`handleSolved`). On a real
(non-practice) solve it dispatches up to four success toasts via
`dispatch({ type: "SUBMIT_RESULT", toasts })` **and** calls
`setOutcome({ kind: "solved", result })`, which renders the new full-screen
`RewardReveal` overlay (`src/web/components/RewardReveal.tsx`, currently being
reworked into a `.reward-overlay` takeover).

**Repro:** seed one learning pass, solve puzzle 1 (toggle all four beam buttons,
Check). The full-screen "Puzzle complete +125" overlay appears with toasts piling
up bottom-right behind it, repeating the same content ("First Solve…",
"Pet freed: Glow Sprite").

**Fix:** the toasts predate the full-bleed reveal. On a real solve, drop the
visible toasts and keep only the composed AT announcement:

```tsx
// handleSolved, non-practice branch
const spoken: string[] = ["Correct — puzzle solved."];
if (result.petId) spoken.push(`${PET_NAMES[result.petId] ?? "A new pet"} freed.`);
if (result.stationCompleted) spoken.push("Station complete.");
if (result.grandCanvasUnlocked) spoken.push("The Grand Canvas is now unlocked.");
announce(spoken.join(" "));
setOutcome({ kind: "solved", result });
```

Remove the `toasts` array and the `SUBMIT_RESULT` dispatch from that path. Check
whether `SUBMIT_RESULT` does anything else in `sessionReducer.ts` besides pushing
toasts; if not, and no other caller uses it, remove the action. Update
`tests/component/*` and any e2e that asserts on solve toasts.

---

### 1.4 Failure diagnosis for puzzle 1 talks about the colour wheel

**Where:** `src/web/puzzles/diagnose.ts:67-82` (`diagnosePuzzle01`) returns
`incorrect_hue_selection` whenever a beam is missing;
`src/web/puzzles/failureReasons.ts:46` maps that to "Hue relationships" and
line 74 to "…check the colour wheel and adjust to the correct hue."

**Repro:** puzzle 1, turn on only the red beam, Check. Failure panel reads
*"PRINCIPLE TO REVISIT: Hue relationships — check the colour wheel and adjust to
the correct hue."* Puzzle 1 is additive RGB **light beams** — there is no colour
wheel or hue selection in it.

**Fix:** add a beam-specific reason code.

- `failureReasons.ts`: new code `missing_primary_beam` → principle "Additive
  light" (or similar), body: *"White light needs all three beams — red, green and
  blue — switched on and aligned. Turn on the ones that are still off."*
- `diagnose.ts:81`: return `["missing_primary_beam"]` instead of
  `["incorrect_hue_selection"]`.
- Add/adjust a unit test in `tests/` for `diagnosePuzzle01`.

While here, skim the other `diagnose.ts` branches for the same mismatch (a
generic hue/wheel fallback on a puzzle that has nothing to do with hue).

---

## P2 — consistency

### 2.1 Primary-action colour is ambiguous (pink vs teal)

Teal is the primary CTA in the Studio hero ("Recommended: …") and for "Practice
X"; pink is the primary CTA on station cards, plus "Continue", "Check", "Start
quiz". Two colours both read as "the main button."

**Fix:** pink = the one primary action per screen. Teal = "already solved /
optional review." Concretely:

- Studio hero "Recommended: …" — this is the single most important action on the
  screen; make it **pink**.
- "Practice X" on a solved puzzle (`StationScreen`) — **teal** (secondary
  intent), keep.
- Grep for `variant=` / button class usage across `src/web/screens/*` and
  `src/web/components/*` and normalise.

### 2.2 "Try again" on the failure panel is the success colour

**Where:** the failure `ResultPanel` action (`src/web/components/` — the panel
rendered from `PuzzleScreen` `outcome.kind === "failed"`). Button is teal/green.

**Fix:** neutral or `--state-failure`-tinted secondary button. Not the same green
used for "Solved" badges and "Practice".

### 2.3 Completed station cards still show a big pink "Continue"

**Where:** `src/web/screens/StudioScreen.tsx` station card, complete state.
After 100%, all 7 cards show a full-strength pink "Continue Light Laboratory"
etc. — looks like the next action; it's only review.

**Fix:** complete card → ghost/secondary "Review" button. Filled pink button only
on the one in-progress station.

### 2.4 Progress ring by the logo duplicates the text stat

**Where:** `src/web/components/` header/HUD. Shows a `21/22` ring **and**
"Pets collected: 21 of 22" a few cm away.

**Fix:** keep one. Recommend dropping the ring (see 3.1).

### 2.5 Two "How this works" buttons on the learning screen

**Where:** puzzle learning card (`src/web/components/LearningIntro.tsx` +
`PuzzleScreen` nav row). One in the nav row, one at the card foot, both next to
"Start quiz".

**Fix:** keep the nav-row one, remove the card-foot one.

### 2.6 Grand Canvas stat labels repeat the number

**Where:** `src/web/screens/GrandCanvasScreen.tsx`. Big `22` above label
"Puzzles solved: 22".

**Fix:** label = "Puzzles solved", value = "22". Same for the other two stats.

---

## P3 — visual hierarchy

### 3.1 Header is overloaded, badly on mobile

**Where:** app shell header/HUD + nav (`src/web/app/App.tsx`,
`src/web/components/` HUD, nav component).

Mobile stacks: logo row → ring + Score + Pets + Streak → achievement pills (up to
3) → an **orphaned `⋮` on its own right-aligned line** → tab bar. ~5 bands, ~40%
of a 390×844 viewport before content. Desktop also floats the `⋮` alone on a line
between the stat row and the tabs.

**Fix:**
- Move `⋮` into the top row, far right, aligned with the logo.
- Collapse Score / Pets / Streak into one compact line
  (e.g. `2925 · 21/22 pets · streak 21`), details in a popover — or move them off
  the persistent header entirely (glance-once info, not per-screen).
- Achievement pills: show the newest, "+2" for the rest, expand on tap.

### 3.2 The puzzle stage is thin and unframed

**Where:** `src/web/components/PuzzlePlayer.tsx` + per-puzzle views
(`src/web/puzzles/puzzle-NN-view.tsx`). Example: `puzzle-01-view.tsx` renders
four beam buttons and a **32px** preview swatch (`.color-preview-swatch`) in the
top-left quarter of a 1440px screen; the rest is empty. The learning card that
precedes it has a large framed illustration, so the actual puzzle looks like a
debug view.

**Fix:** give `PuzzlePlayer` a centered "stage" wrapper with the same max-width
and framing as the learning illustration. Enlarge result previews to ≥160px
(`.color-preview-swatch` and equivalents). Center the control group under the
stage. This is layout in `app.css` / `PuzzlePlayer` mostly, not per-puzzle, but
spot-check a few puzzle views for hard-coded small sizes.

### 3.3 Learning card is a wall of inline-bold text, in the wrong order

**Where:** `src/web/components/LearningIntro.tsx` +
`src/content/puzzleLearningContent.ts`.

Five stacked paragraphs (`Demonstrates… / Learn how… / **How to win:** … /
**Why this fails:** … / **Key terms:** …`) with uneven vertical gaps.
**"Why this fails" is shown before the player has attempted anything.**

**Fix:**
- Structure: one-line "What you'll learn" → a compact **Goal** line → Key terms
  as a small `<dl>`.
- Move "Why this fails" out of the intro — into the failure panel (close to what
  `failureReasons` already shows) or a "Hint" `<details>` inside the puzzle.
- The illustration card is the only pure-white surface in the app. Soften it
  (`--surface-1` container with a lighter inner plate) so it doesn't blow out
  night vision. Check `.learning-intro__illustration` (or similar) in
  `app.css`.

### 3.4 Collection grid has ragged vertical rhythm

**Where:** `src/web/screens/CollectionScreen.tsx` + grid styles in `app.css`.
Pet names wrap to 1–3 lines and "from Value Sketchboard" wraps independently, so
rows don't align.

**Fix:** fixed `min-height` on the card, reserve two lines for the name
(`min-height` on the name element or `-webkit-line-clamp`).

---

## P4 — accessibility

### 4.1 The reward overlay is not a dialog

**Where:** `src/web/components/RewardReveal.tsx` — renders a plain
`<div className="reward-overlay">` covering the viewport. No `role="dialog"` /
`aria-modal`, focus isn't moved in, focus isn't trapped, Escape doesn't dismiss.
A keyboard/AT user can Tab "behind" it to the still-present puzzle.

**Fix:**
- `role="dialog" aria-modal="true"` on `.reward-overlay__card`, with
  `aria-labelledby` pointing at the "Puzzle complete" eyebrow.
- On mount, move focus to the "Continue" button.
- Trap Tab within the card; restore focus to the triggering element on close.
- Close on Escape (equivalent to "Continue" for practice / "Stay here"
  otherwise).
- There's an existing MUI `Dialog` primitive (`src/web/design-system/Dialog.tsx`)
  used elsewhere for a11y — consider building the reveal on top of it rather than
  hand-rolling focus management.

### 4.2 Timed auto-navigation

**Where:** `RewardReveal.tsx` — `autoReturnSeconds = 5` default (set from
`PuzzleScreen.tsx:213`). Navigates away after 5s; the only opt-out ("Stay here")
is inside the overlay.

**Fix:** WCAG 2.2.1 — acceptable *if* the dialog holds focus (4.1) so "Stay here"
is discoverable. Bump to 8–10s. After "Stay here", dismiss the overlay rather
than leaving it as a dead layer over the puzzle with just "Continue". Ensure the
"Returning to X in N seconds" text lands in the `role="status"` region at least
once (the ring is `aria-hidden`).

### 4.3 Quiz controls are very low contrast

**Where:** `src/web/components/LearningQuiz.tsx` + control styles. Radio buttons
render as faint olive-grey circles; the per-question group borders are
near-invisible.

**Fix:** control border → `--surface-border-strong`; give each question group a
visible container (`--surface-2` panel or a real `1px` border). Check the
`:checked` state has adequate contrast too.

### 4.4 Sticky header is translucent with no backdrop

**Where:** header styles in `src/web/app/app.css`. On scroll, page content (the
Collection intro paragraph, the `<h1>`) is readable *through* the header.

**Fix:** opaque background, or `backdrop-filter: blur(8px)` plus a background at
≥0.85 alpha.

---

## P5 — expectation gaps

### 5.1 Grand Canvas doesn't deliver on its name  *(design pass, not a one-liner)*

**Where:** `src/web/screens/GrandCanvasScreen.tsx`.

The whole game builds toward it ("Rescue every pet and the Grand Canvas opens").
What renders: the **Collection pet grid again**, with a gold-bordered stats box on
top (three near-identical gold numbers: `22`, `22/22`, `22`). A player expects a
*canvas* — a generated artwork / mural assembled from their solved puzzles, the
pets populating a scene, something visual that exists only here.

**Fix:** needs a design decision before implementation. Options, cheapest first:
- A composed scene: the 22 pets arranged in a painted studio backdrop (not a
  uniform grid), each linking to its puzzle.
- A generated "palette mural" built from the dominant colours of each solved
  puzzle.
- Keep the grid but make the hero a real visual payoff (large animated
  CelebrationBurst-style piece, the studio "relit").

At minimum: collapse the three redundant stats into one line and lead with
something that isn't a number.

### 5.2 "Reset run" wipes everything with no confirmation

**Where:** `src/web/components/AppMenu.tsx:27-34` → `actions.reset()`.
One tap from "Replay intro" in the menu.

**Fix:** confirm step (reuse `Dialog` primitive) — "Reset all progress? This
frees no pets back." / "Reset" / "Cancel". Pairs with 1.2 destructive styling.

### 5.3 Intro "Skip" leads to the same place as "Enter the Studio"

**Where:** `src/web/screens/IntroScreen.tsx`. Both buttons → Studio. "Skip"
implies skipping something that doesn't exist as a separate step.

**Fix:** if the intro is a single screen, drop "Skip" (or relabel the pair to
"Enter the Studio" primary + nothing, since the nav is always available).

### 5.4 Puzzle preview declares victory before Check

**Where:** `src/web/puzzles/puzzle-01-view.tsx:43-49` — `previewLabel` shows
"White light! ✓ All beams aligned" as soon as the inputs are right, before the
player presses Check, making Check feel redundant.

**Fix:** soften the in-progress preview (drop the "✓" and "White light!" until
validated), or pulse the Check button when the input looks complete. Check other
puzzle views for the same pattern.

---

## Screenshots

Not committed. Re-generate with a Playwright script that seeds
`localStorage["ctg:web-progress:v1"]` (schema in `src/web/localProgress.ts`:
`completedPuzzleIds`, `learningProgressByPuzzle`, `introSeen`) then `page.reload()`
before navigating — hash navigation alone won't re-read persistence. Grand Canvas
needs all 22 puzzles solved: `puzzle-01`…`puzzle-21` + `puzzle-23` (there is no
`puzzle-22` in the core set).

## Suggested order

1.1 → 1.2 → 1.3 → 1.4 → 3.1 → 3.2 / 3.3 → 4.1 / 4.2 → 5.1 (design review).
