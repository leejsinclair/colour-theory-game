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

## Priority backlog for cloud agents

1. Fix Paint Workbench gameplay so the art-station game reliably renders and is playable after entering the station (current blocker).
2. Add/expand Playwright coverage for Paint Workbench interaction (draw on pad, color select, clear, and state updates) to prevent regressions.
3. Final Canvas interaction system with pet-guided hinting.
4. Save/load persistence backend for browser mode.
5. Reward unlock loop (Free Paint Mode, decoration items, pet hats, advanced challenges).
6. Rich station-specific visual interactions beyond current prototype overlays.

## Stability constraints

- Do not break commands: `npm run play`, `npm run play:web`, `npm test`.
- Keep shared puzzle solution map in `src/content/demoSolutions.ts` aligned with puzzle validators.
- Keep `storyplan.md` implementation and cloud sections current when behavior changes.