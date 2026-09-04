# Quickstart: Validating the React Refactor & Visual Redesign

How to prove the feature works end to end. Run these at every migration
checkpoint (FR-063/FR-064) and as the final acceptance pass. Details of
components, state and schema live in `plan.md`, `data-model.md` and `contracts/`.

## Prerequisites

```bash
nvm use                 # Node from .nvmrc (24.x)
npm ci
npx playwright install  # first e2e run only
```

## Gate commands (must all pass — every checkpoint)

```bash
npm run build      # tsc strict typecheck — no new `any`/assertions (FR-059, SC-012)
npm test           # Vitest: unit (node) + component (jsdom) projects
npm run lint       # ESLint over src/ and tests/
npm run build:web  # Vite production build — must succeed (FR-062)
npm run test:e2e   # Playwright — required from the "shell flip" checkpoint onward
```

`npm run test:cloud` runs build + unit + e2e together (mirrors CI).

## Baseline capture (do this BEFORE any code change)

```bash
git switch main && npm ci && npm run build:web
# record gzip size of dist/assets/*.js  -> specs/001-.../baseline-bundle.txt
```
Final `build:web` bundle must be ≤ 115% of this (SC-013) or the overage is
justified in the PR.

## Manual smoke — full playthrough (SC-001, SC-002)

```bash
npm run play:web    # http://localhost:5173
```

1. **Fresh load** → first-run intro appears; "Skip" or "Enter the Studio" lands
   in the Studio. HUD shows 0 score / 0 pets / 0 streak. Only **Light
   Laboratory** is enterable. (US1-1, FR-030a)
2. **DevTools → Network / Sources**: confirm no `legacyGame` or `src/web/legacy/*`
   module is loaded. (SC-004)
3. Enter Light Laboratory → open the first puzzle → intro card shown, **no
   puzzle controls / Check button** until the quiz is passed 100%. (US1-2, FR-016)
4. Pass the quiz → controls + **Check button appear inside the puzzle panel**.
   Set a wrong answer → Check → specific diagnostic text, puzzle still unsolved,
   streak resets, retry available. (US1-4, FR-017, FR-034)
5. Set the correct answer → Check → brief celebration + pet reveal, score +100,
   pet +25, HUD updates. (US1-3, FR-033)
6. Solve every puzzle in the station → station marked complete, +50, next
   station unlocks, "Go to <next station>" CTA. (US1-5, FR-013/14)
7. Continue through all 7 stations / 22 puzzles → on the final solve with all 22
   pets, the **Grand Canvas** finale shows the certificate (puzzles solved, pets
   rescued, best streak, full pet roll) and +200 applied once. (US1-6, US6, FR-020)
8. **Reload** mid-game → solved puzzles, quiz passes and active station all
   restored, zero loss. (US1-7, SC-003)
9. Menu → **Reset run** → back to fresh state, intro shows again, only Light
   Laboratory unlocked. (US1-8, FR-021)

## Manual smoke — architecture correctness (SC-005)

Open any 2–3 puzzles across different stations and confirm in the source /
React DevTools:
- the puzzle's controls, Check button and result panel are one React subtree;
- no `persistedState` object, no `Object.assign` into a shared object, no
  `document.getElementById` / `querySelector` moving data to the Check action;
- the puzzle component's only output is `onChange`; it does not import `Game`.

## Persistence compatibility (SC-003, FR-049–FR-051)

```bash
npx vitest run tests/component/persistenceSync.test.ts
```
- Real pre-feature snapshot fixture (`tests/fixtures/legacy-save-v1.json`)
  restores with zero loss.
- Missing `introSeen` → treated as first run.
- Corrupt JSON → fresh game, existing blob not overwritten until progress.
- `localStorage` throwing → no visible error, gameplay continues.

Manual: paste a known-good v1 blob into `localStorage['ctg:web-progress:v1']`,
reload, confirm the exact solved set + pets appear.

## Accessibility & responsive (US7, SC-006/07/08/09)

- **Keyboard only** (no mouse): complete Studio → station → learning gate →
  puzzle → Check → Continue → next station → Grand Canvas. Visible focus ring at
  every stop.
- **Info modal**: opens with focus trapped, `Escape` closes, focus returns to
  the opener.
- **Screen reader** (VoiceOver/NVDA): solving, failing (with the reason),
  station unlock and pet collection are announced.
- **320 px viewport** (DevTools device toolbar): every screen — no horizontal
  page scroll; station cards stacked; puzzle controls usable by touch; HUD
  simplified (not shrunk).
- **Emulate `prefers-reduced-motion: reduce`**: no looping animation anywhere;
  celebration is a static treatment.
- Run an axe / Lighthouse a11y pass on Studio, Station, Puzzle, Collection,
  Grand Canvas — no AA contrast failures; fill the matrix in
  `contracts/ui-contract.md`.

## Visual identity check (SC-015, FR-042/43)

Show only the Studio screen to 3–5 people unprompted; they should call it a
colour / art game — not a dashboard, LMS, MUI demo or preschool app. Confirm:
dark studio ground, one self-hosted display font on headings only, custom
station cards (not MUI Cards), colourful CTAs, strong hover/focus, bounded
decoration.

## E2E coverage checklist (FR-057 — the suite must cover all of these)

initial load · Studio rendering · station lock state · entering a station ·
learning flow · puzzle interaction · successful completion · unsuccessful
attempt · pet collection · progression · persistence across reload · reset ·
Grand Canvas unlock · mobile/responsive critical path (320 px).

## CLI regression (FR-023, SC-002)

```bash
npm run play              # help / status / list
npm run play solve puzzle-01
npm run play auto         # solves the whole journey via demo solutions
```
All must behave exactly as before — the CLI shares the untouched domain layer.

## Done-when (maps to Success Criteria)

- [ ] Full fresh→Grand-Canvas playthrough, no broken/blank screen (SC-001)
- [ ] All stations/puzzles/pets/scoring/streaks/milestones identical to baseline (SC-002)
- [ ] Returning-player save: zero loss (SC-003)
- [ ] Zero `src/web/legacy/*` / `legacyGame.ts` in the browser flow; repo grep clean (SC-004)
- [ ] No puzzle uses a mutable bridge / DOM query for input→submit (SC-005)
- [ ] Whole primary journey keyboard-completable with visible focus (SC-006)
- [ ] No horizontal page scroll at 320 px / tablet / desktop (SC-007)
- [ ] WCAG AA contrast; no colour-only state (SC-008)
- [ ] Reduced-motion: no looping/blocking animation; static celebration (SC-009)
- [ ] Recommended next activity identifiable from Studio in < 10 s (SC-010)
- [ ] Unit + updated e2e suites pass; e2e covers the FR-057 list (SC-011)
- [ ] `build`, `build:web`, `lint` pass; no new type errors (SC-012)
- [ ] Bundle ≤ 115% of baseline, or justified (SC-013)
- [ ] Net-new runtime deps = 0; dev deps (jsdom + testing-library ×3) justified (SC-014)
- [ ] Studio reads as a colour game to unprompted reviewers (SC-015)
- [ ] `game-architecture.md` rewritten for the React architecture (SC-016, FR-060)
