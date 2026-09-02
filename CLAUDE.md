# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**Chromatic Mastery** — a browser puzzle game that teaches colour theory through 21 puzzles across 7 stations (plus a Grand Canvas finale). TypeScript (strict) + React 19 + MUI + Emotion, built with Vite, deployed to GitHub Pages.

## Commands

```bash
npm run play:web      # Vite dev server (the game) — http://localhost:5173
npm run play          # CLI prototype (src/cli.ts): help / status / list / solve <id> / auto

npm run build         # tsc typecheck gate (CommonJS, emits dist/) — required before "done"
npm run build:web     # Vite production build → dist/ (this is what Pages deploys)

npm test              # Vitest, runs tests/*.test.ts (unit only, not tests/e2e)
npm run test:watch
npm run test:e2e      # Playwright; auto-starts a Vite server on 127.0.0.1:4173
npm run test:cloud    # build + test + test:e2e (mirrors CI)

npm run lint          # ESLint over src/ and tests/
npm run lint:fix
```

- **Run one unit test:** `npx vitest run tests/game.test.ts` or add `-t "test name substring"`.
- **Run one e2e spec:** `npx playwright test tests/e2e/studio.spec.ts` or `--grep "title"`.
- **First e2e run:** `npx playwright install` (and `sudo npx playwright install-deps` if Linux host deps are missing).
- Node version is pinned by `.nvmrc` (24.x) and used by CI via `node-version-file`; the README's "Node 18+" is stale.
- Husky: `pre-commit` runs lint + unit tests; `pre-push` runs e2e.

## Definition of done

`EPCC.md` is the authoritative completion rubric, elaborated in `AGENTS.md` and `.github/instructions/*.instructions.md`. In short: `npm run build` always; `npm test` for logic changes; `npm run lint` for style-sensitive edits; `npm run test:e2e` for UI/journey changes. Keep changes small and localized; don't disable failing tests.

## Architecture

### Two runtime surfaces, one domain core

- **CLI** (`src/index.ts`, `src/cli.ts`) and **web** both drive the same domain layer: `src/game/`, `src/systems/`, `src/entities/`.
- `src/game/Game.ts` is the single source of truth for progression (puzzles solved, pets, score, streaks, station unlocks). Systems: `PuzzleManager`, `PetManager`, `StationManager`, `ColorEngine`, `SaveSystem`.
- Keep game-rule decisions in the domain/systems layer, never in UI components.

### Web shell is intentionally *not* a React tree

`index.html` ships a static DOM skeleton. `src/web/main.tsx` mounts `AppShell.tsx` (React, layout/chrome only), then dynamically imports `src/web/legacyGame.ts` — an imperative DOM orchestrator (~800 lines) that wires gameplay, progression, HUD, modals, and the learning gate. Extracted sub-modules live in `src/web/legacy/` (`infoModal`, `learningFlow`, `resultFeedback`, `artStationMiniGame`); prefer adding to those over growing `legacyGame.ts`.

`game-architecture.md` documents the deliberate two-layer state model and why no state library is used. `legacyGame.ts` module-level `let` variables are the transient UI-navigation state and are all reset by `resetSessionState()` in `initializeGame()`.

### Per-puzzle module pairs

Each puzzle N has a pair in `src/web/puzzles/`:
- `puzzle-NN.ts` — entry (often just re-exports the view; some hold logic)
- `puzzle-NN-view.tsx` — the React mini-game component, mounted into a DOM zone via `createRoot`

All renderers are registered in `src/web/puzzles/index.ts` (`puzzleRenderers` map, keyed `"puzzle-NN"`, zero-padded). A renderer receives a `PuzzleRenderDeps` helper bag (`src/web/puzzles/types.ts`): sliders/selects/checkboxes, `ensureState`, `addCheckButton`, hue helpers, etc.

**persistedState bridge:** the Check button lives outside the React tree, so a puzzle view keeps a local `useState` copy for rendering and mirrors it into a shared plain object that the button reads via an `inputFactory` callback. This is the main seam to fix if the shell is ever ported to React.

**Adding a puzzle:** create the `puzzle-NN.ts` / `puzzle-NN-view.tsx` pair, register in `puzzles/index.ts`, add a demo solution (`src/content/demoSolutions.ts`), learning content + quiz (`src/content/puzzleLearningContent.ts`), and a `public/puzzle-info/puzzle-NN.md` card. Note: puzzle-22/23 exist as extras beyond the core 21 (23 is wired; 22 is sprite-only).

### Validation, feedback, learning gate

- `src/web/puzzleValidation.ts` — `validatePuzzleInput`, `circularHueDistance`, `shuffleArray`, `isTriadValid` (unit-tested).
- `src/web/puzzles/diagnose.ts` + `failureReasons.ts` — turn a wrong answer into a specific explanation shown in the Result Analysis panel.
- `src/web/legacy/learningFlow.ts` — intro card + quiz that must pass before a puzzle is playable.
- Demo solutions (`getDemoSolution`) back both the CLI `solve`/`auto` commands and the web "Auto Solve Journey".

### Persistence

- Web: `localStorage` via `src/web/localProgress.ts` (solved state + `learningProgressByPuzzle`). Keep schema changes additive and backward-safe.
- Domain: `src/systems/SaveSystem.ts`.

### Content

`src/content/` holds learning copy, quiz questions, and demo solutions. `public/puzzle-info/puzzle-NN.md` are markdown learning cards fetched at runtime (rendered with `marked`).

## CI / deploy

- `.github/workflows/cloud-ci.yml` — build + unit + e2e on PRs and pushes to `main`.
- `.github/workflows/deploy.yml` — `npm run build:web` → GitHub Pages on push to `main`.
- `vite.config.ts` sets `base: '/colour-theory-game/'` for production (Pages subpath), `/` for dev.
