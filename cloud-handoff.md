# Cloud Handoff Contract

This file defines the minimum execution contract for GitHub cloud automation and remote contributors.

## Objective

Finish gameplay tasks incrementally while keeping architecture stable and tests green.

## Mandatory checks

1. Install dependencies: `npm ci`
2. Typecheck/build: `npm run build`
3. Unit tests: `npm test`
4. Install browser for e2e: `npx playwright install --with-deps chromium`
5. End-to-end tests: `npm run test:e2e`

## Required artifacts for failed runs

- Upload `playwright-report/`
- Upload `test-results/`
- Include failed scenario name and first failing assertion in CI summary

## Feature completion policy

- Every gameplay change must update either:
  - `tests/game.test.ts` (logic)
  - `tests/e2e/*.spec.ts` (experience)
  - or both for high-risk flow changes

## Gamification Implementation Instructions (Points + Pets)

Use this section as the execution contract for adding progression rewards beyond puzzle unlocks.

### Scoring rules (required)

- Award points only for meaningful actions:
  - `+100` first-time puzzle solve
  - `+25` first-time pet rescue (on puzzle completion reward)
  - `+10` valid practice completion after already solved
  - `+50` station completion bonus (all 3 puzzles solved)
  - `+200` final canvas unlock bonus
- Prevent farming:
  - First-time rewards must be idempotent (granted once per puzzle/pet/station milestone).
  - Practice points can be granted repeatedly but cap at `+30` per puzzle per session.
- Track combo streak (optional but recommended in same PR):
  - Consecutive successful checks without a failed check increments streak.
  - Streak multiplier applies only to practice points, not milestone rewards.

### Pet collection gamification behavior (required)

- Keep existing pet unlock logic, then add reward hooks:
  - On new pet collected: emit "pet rescued" event, grant points, and show a short in-UI toast.
  - On duplicate rescue attempts: no additional pet reward points.
- Add collection milestones:
  - `6 pets`: unlock badge "Color Apprentice"
  - `12 pets`: unlock badge "Palette Keeper"
  - `18 pets`: unlock badge "Chromatic Master"
- Milestones must be visible in browser UI and included in save snapshots.

### Data model updates (required)

- Extend progress/save snapshot shape with:
  - `score: number`
  - `practiceScoreByPuzzle: Record<string, number>`
  - `petMilestonesUnlocked: string[]`
  - `currentStreak: number`
  - `bestStreak: number`
- Keep backward compatibility:
  - Loading older saves without these fields must default safely (zero score/empty maps).

### UI requirements (required)

- Browser mode (`npm run play:web`):
  - Add persistent HUD summary showing `Score`, `Pets`, and `Best Streak`.
  - Add a pet milestone panel entry in the progress area.
  - Show short reasoned reward feedback (example: `+100 First Solve: Triadic Harmony`).
- CLI mode (`npm run play`):
  - Include score and pet milestone lines in printed status/progress output.

### Testing contract (required)

- Unit tests (`tests/game.test.ts`) must cover:
  - First-time solve scoring and idempotency
  - Pet reward scoring and duplicate protection
  - Milestone unlock thresholds (6/12/18)
  - Save/load compatibility with new gamification fields
- Playwright tests (`tests/e2e/*.spec.ts`) must cover:
  - Score HUD updates after solving at least one puzzle
  - Pet count/milestone UI visibility after auto-solve flow
  - Reward feedback text appears after a successful check

### Definition of done for gamification PRs

- `npm run build`, `npm test`, and `npm run test:e2e` all pass.
- Score cannot be inflated by repeatedly submitting already-earned first-time rewards.
- Pet milestones unlock at exact thresholds and persist across reload/save-load.
- `storyplan.md` reflects implemented gamification status and any changed reward loop behavior.

## Priority backlog for cloud agents

## Current Progress Snapshot (March 2026)

- Core quality gate status:
  - `npm run build` passing
  - `npm test` passing (18 unit tests: progression, save-load, gamification scoring, pet milestones)
  - `npm run test:e2e` passing (12 Playwright scenarios)
- Gameplay UX progress now completed in browser prototype:
  - Station puzzle cards include objective text and improved failure feedback
  - Puzzle-01: RGB beam button interaction + live additive preview
  - Puzzle-02: CMY slider mixing + live target/current swatches
  - Puzzle-03: Chromatic black bowl interaction + luminous-shadow feedback
  - Puzzle-07: complement drill with quick chip selection and streak feedback
  - Puzzle-09: mood palette board with inferred tag feedback
  - Puzzle-10/11/12: relativity mini-boards with visual context/perception feedback
  - Puzzle-13/14: atmospheric depth/scattering scene interactions
  - Puzzle-15: golden-hour reliability updates (dual meters, checklist, reset cycle) **+ usability improvements (phase badge, step guide, accent CTA, context-sensitive button visibility)**
  - Puzzle-16: contaminant-based mud model replacing confusing direct mud control
  - Puzzle-17: Mud Monster board with color swatches, effective mud meter, and complement-touch penalty readout
  - Puzzle-18: paint-pad coverage meter plus tiled optical blend distance preview
- **Gamification reward loop implemented** (completed):
  - Scoring: +100 first solve, +25 pet rescue, +50 station complete, +200 final canvas, +10 practice (cap 30/puzzle)
  - Streak tracking: currentStreak / bestStreak
  - Pet milestones: Color Apprentice (6), Palette Keeper (12), Chromatic Master (18)
  - HUD: Score / Pets / Best Streak tiles always visible
  - Pet milestone badges rendered in Progress card
  - Reward toast on every successful Check
  - Save snapshot extended with all gamification fields (backward compatible)

## Priority backlog for cloud agents

1. ~~Fix Paint Workbench gameplay so the art-station game reliably renders and is playable after entering the station (current blocker).~~ ✓ Done
2. ~~Add/expand Playwright coverage for Paint Workbench interaction (draw on pad, color select, clear, and state updates) to prevent regressions.~~ ✓ Done (6 e2e tests passing)
3. ~~Rich station-specific visual interactions beyond current prototype overlays~~ ✓ Done (all stations now have interactive mini-game patterns; continue polish/testing).
4. ~~Gamification reward loop (scoring, streaks, pet milestones, HUD, toast feedback)~~ ✓ Done (12 e2e tests + 18 unit tests passing)
5. ~~Improve Golden Hour (puzzle-15) usability~~ ✓ Done (phase indicator, step guide, accent CTA, context-sensitive buttons)
6. Expand Playwright coverage for upgraded puzzle interactions (especially puzzle-03, 07, 09, 13, 14, 17, 18 tiled preview).
7. Final Canvas interaction system with pet-guided hinting.
8. Save/load persistence backend for browser mode.
9. Reward unlock loop (Free Paint Mode, decoration items, pet hats, advanced challenges).

## Stability constraints

- Do not break commands: `npm run play`, `npm run play:web`, `npm test`.
- Keep shared puzzle solution map in `src/content/demoSolutions.ts` aligned with puzzle validators.
- Keep `storyplan.md` implementation and cloud sections current when behavior changes.