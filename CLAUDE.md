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

npm test              # Vitest — unit (tests/*.test.ts) + component (tests/component/**); not tests/e2e
npm run test:component # Vitest, component project only (jsdom)
npm run test:watch
npm run test:e2e      # Playwright; auto-starts a Vite server on 127.0.0.1:4173
npm run test:cloud    # build + test + test:e2e (mirrors CI)

npm run lint          # ESLint over src/ and tests/
npm run lint:fix
```

- **Run one unit test:** `npx vitest run tests/game.test.ts` or add `-t "test name substring"`.
- **Run one component test:** `npx vitest run tests/component/StudioScreen.test.tsx`.
- **Run one e2e spec:** `npx playwright test tests/e2e/studio.spec.ts` or `--grep "title"`.
- **First e2e run:** `npx playwright install` (and `sudo npx playwright install-deps` if Linux host deps are missing).
- Node version is pinned by `.nvmrc` (24.x) and used by CI via `node-version-file`; the README's "Node 18+" is stale.
- Husky: `pre-commit` runs lint + `npm test` (unit + component); `pre-push` runs e2e.

## Definition of done

`EPCC.md` is the authoritative completion rubric, elaborated in `AGENTS.md` and `.github/instructions/*.instructions.md`. In short: `npm run build` always; `npm test` for logic changes; `npm run lint` for style-sensitive edits; `npm run test:e2e` for UI/journey changes. Keep changes small and localized; don't disable failing tests.

## Architecture

### Two runtime surfaces, one domain core

- **CLI** (`src/index.ts`, `src/cli.ts`) and **web** both drive the same domain layer: `src/game/`, `src/systems/`, `src/entities/`.
- `src/game/Game.ts` is the single source of truth for progression (puzzles solved, pets, score, streaks, station unlocks). Systems: `PuzzleManager`, `PetManager`, `StationManager`, `ColorEngine`, `SaveSystem`.
- Keep game-rule decisions in the domain/systems layer, never in UI components.

### The web app is a React tree (see `game-architecture.md`)

`index.html` is just `<div id="root">`. `src/web/main.tsx` mounts
`<GameProvider><App /></GameProvider>` and React owns everything from there —
shell, nav, screens, HUD, puzzle lifecycle, feedback, collection. No static DOM
skeleton, no imperative orchestrator, no `createRoot`-per-puzzle.

- `src/web/app/App.tsx` — the shell (banner/nav, `main`, overlays, focus-to-`<h1>` on route change).
- `src/web/screens/*` — one `React.memo` component per view (`IntroScreen`, `StudioScreen`, `StationScreen`, `PuzzleScreen`, `CollectionScreen`, `GrandCanvasScreen`).
- `src/web/components/*` — shared feature components; `src/web/design-system/*` — reusable primitives + tokens (`tokens.css`, pulled in via the barrel's `styles.css`). A few primitives wrap MUI (`Dialog`, `Menu`, `Slider`, `Tooltip`) for a11y only; MUI does not theme the app.

**State** — three layers, no state library:
1. Domain: the mutable `Game` instance (shared with the CLI).
2. `src/web/state/gameStore.ts` — external store over `Game`; `getSnapshot()` is structurally shared, read via `useSyncExternalStore`. Field-slice hooks in `state/selectors.ts` (`useProgress`, `useStation(id)`, …) re-render per slice.
3. `src/web/state/sessionReducer.ts` — pure reducer for transient UI state (practice puzzle, open modal, toasts, intro-seen).

`src/web/state/actions.ts` is the only UI writer of domain state (`submitPuzzle` → `validatePuzzleInput` + `Game` → `notify()` once; idempotent re-submit). Exposed via three split contexts (`contexts.ts`), mounted by `GameProvider.tsx`. Persistence load/save is the single `state/persistenceSync.ts` bridge (key `ctg:web-progress:v1`).

**Navigation** — hash-based, `src/web/app/routes.ts` + `useHashRoute.ts`. `parseHash`/`serialiseRoute` pure; `resolveRoute` guards (unknown/locked → `studio`, `grand-canvas` before unlock → `studio`). No routing library.

### Per-puzzle views

Each playable puzzle N is one component: `src/web/puzzles/puzzle-NN-view.tsx`
(some have a companion `*-data.ts`). Registered in `src/web/puzzles/index.ts` as
**code-split `React.lazy`** chunks in the `puzzleComponents` map, keyed
`"puzzle-NN"` (zero-padded).

A puzzle view is a controlled component: `value` + `onChange` props from
`<PuzzlePlayer>`, which hosts it behind `<Suspense>` and owns the Check button
**inside the React tree**. No `persistedState`, no `inputFactory`, no external
button. Completion flows through the `submitPuzzle` action's typed `SubmitResult`.

**Adding a puzzle:** create `puzzle-NN-view.tsx`, register in `puzzles/index.ts`,
add a demo solution (`src/content/demoSolutions.ts`), learning content + quiz
(`src/content/puzzleLearningContent.ts`), a validation branch in
`src/web/puzzleValidation.ts`, and a `public/puzzle-info/puzzle-NN.md` card.
`puzzle-01`…`puzzle-21` are the core set; `puzzle-23` is a wired extra, `puzzle-22` is sprite-only.

### Validation, feedback, learning gate

- `src/web/puzzleValidation.ts` — `validatePuzzleInput`, `circularHueDistance`, `shuffleArray`, `isTriadValid` (unit-tested).
- `src/web/puzzles/diagnose.ts` + `failureReasons.ts` — turn a wrong answer into a specific explanation shown in `ResultPanel`.
- `src/web/components/LearningIntro.tsx` + `LearningQuiz.tsx` + `src/web/learning/evaluateLearningQuiz.ts` — intro card + quiz that must pass at 100% before a puzzle is playable.
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
