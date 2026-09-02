# Chromatic Mastery Game Architecture

This document describes how the codebase is structured at runtime and where core
responsibilities live. It is architecture-focused and intentionally avoids
duplicating coding policy and completion checklists.

For coding standards and done criteria, use:
- [AGENTS.md](AGENTS.md)
- [.github/copilot-instructions.md](.github/copilot-instructions.md)
- [.github/instructions/coding-standards.instructions.md](.github/instructions/coding-standards.instructions.md)
- [.github/instructions/completion-criteria.instructions.md](.github/instructions/completion-criteria.instructions.md)
- [EPCC.md](EPCC.md)

## High-Level Runtime Model

The project has two runtime surfaces over one shared domain core:

- **CLI** ([src/index.ts](src/index.ts), [src/cli.ts](src/cli.ts)) — terminal
  gameplay and diagnostics.
- **Web** ([src/web](src/web)) — a React application. React owns the entire
  browser UI: the app shell, navigation, every screen, the HUD, the puzzle
  lifecycle, feedback, and the pet collection.

Both surfaces drive the same domain layer ([src/game](src/game),
[src/systems](src/systems), [src/entities](src/entities)) and never re-implement
game rules.

## Top-Level Code Areas

- [src/game](src/game): game orchestration and progression (`Game.ts`).
- [src/systems](src/systems): managers for puzzles, pets, stations, colour, and persistence.
- [src/entities](src/entities): domain entities and state containers.
- [src/puzzles](src/puzzles): puzzle logic classes used by core game flows.
- [src/web](src/web): the React application (shell, state adapter, screens, components, puzzle views).
- [src/content](src/content): puzzle learning content, quiz questions, and demo solutions.
- [src/types](src/types): shared type definitions.

## Core Domain Layer

The domain layer is the single source of truth for progression and rewards. It
is plain TypeScript with no React dependency.

Primary modules:
- [src/game/Game.ts](src/game/Game.ts): coordinates puzzle completion, rewards, streaks, and unlock flow.
- [src/systems/PuzzleManager.ts](src/systems/PuzzleManager.ts): puzzle lookup and solved-state management.
- [src/systems/PetManager.ts](src/systems/PetManager.ts): pet unlock state and collection data.
- [src/systems/StationManager.ts](src/systems/StationManager.ts): station metadata and completion status.
- [src/systems/SaveSystem.ts](src/systems/SaveSystem.ts): domain serialization and load/restore.
- [src/systems/ColorEngine.ts](src/systems/ColorEngine.ts): colour calculation helpers.

## Web Application Layer

`index.html` ships nothing but `<div id="root">`.
[src/web/main.tsx](src/web/main.tsx) mounts `<GameProvider><App /></GameProvider>`
and React renders everything from there. There is no static DOM skeleton, no
imperative orchestrator, and no `createRoot`-per-puzzle.

### Shell and screens

- [src/web/app/App.tsx](src/web/app/App.tsx): the shell — `banner` (HUD + nav),
  `main`, global overlays (`ToastHost`, `InfoModal`, `LiveRegion`), and it moves
  focus to the new screen's `<h1>` on every route change.
- [src/web/screens](src/web/screens): one component per view — `IntroScreen`,
  `StudioScreen`, `StationScreen`, `PuzzleScreen`, `CollectionScreen`,
  `GrandCanvasScreen`. Each is wrapped in `React.memo` so an unrelated
  HUD/progress change in the shell does not re-render the active screen.
- [src/web/components](src/web/components): shared feature components (`HUD`,
  `StationCard`, `PetBadge`, `PetGallery`, `PuzzlePlayer`, `LearningIntro`,
  `LearningQuiz`, `ResultPanel`, `RewardReveal`, `ToastHost`, `InfoModal`, …).
- [src/web/design-system](src/web/design-system): the reusable primitive layer
  (`Button`, `Card`, `Panel`, `Heading`, `Dialog`, `Slider`, `Select`,
  `Checkbox`, `ProgressRing`, `CelebrationBurst`, `StudioBackdrop`, …) plus the
  design tokens. `tokens.css` + `fonts.css` are pulled in via `styles.css`, which
  the barrel [index.ts](src/web/design-system/index.ts) imports, so every screen
  gets the tokens. A few primitives wrap MUI (`Dialog`, `Menu`, `Slider`,
  `Tooltip`) purely for accessibility behaviour; MUI does not theme the app.

### State ownership — three layers

1. **Domain state** — the mutable `Game` instance. Authority for solved puzzles,
   pets, score, streaks, and unlocks. Shared with the CLI.
2. **Store adapter** — [src/web/state/gameStore.ts](src/web/state/gameStore.ts)
   is an external store (`subscribe` / `getSnapshot`) over `Game`. `getSnapshot()`
   returns a **referentially-stable** `GameSnapshot` that only changes identity
   for the fields that actually changed (structural sharing). React reads it
   through `useSyncExternalStore`; the field-slice selector hooks in
   [selectors.ts](src/web/state/selectors.ts) (`useProgress`, `useStation(id)`,
   `usePuzzle(id)`, `usePets`, …) each subscribe to one slice, so a component
   re-renders only when its slice changes.
3. **Session/UI state** — [src/web/state/sessionReducer.ts](src/web/state/sessionReducer.ts),
   a pure, unit-tested reducer holding transient UI state that is neither domain
   state nor derivable from the route (active practice puzzle, open modal,
   toasts, intro-seen-this-session). This replaces the module-level `let`
   variables of the retired imperative shell.

[src/web/state/actions.ts](src/web/state/actions.ts) is the only writer of domain
state from the UI: `submitPuzzle` / `practiceSubmit` call
`validatePuzzleInput` + `Game` methods, then `notify()` once so score, pets,
unlocks and the reward animation update together. It never mutates
`Puzzle.solved` or pet state directly, and a re-submit of a solved puzzle is
idempotent (`delta: 0`, no duplicate pet).

The three pieces are exposed through **split contexts**
([contexts.ts](src/web/state/contexts.ts)): `GameStoreContext` (snapshot source),
`GameActionsContext` (stable identities), `SessionContext` (state + dispatch), so
an action-only consumer is not re-rendered by a snapshot change. All three are
mounted by [GameProvider.tsx](src/web/state/GameProvider.tsx).

No external state-management library is used or needed: `useSyncExternalStore` +
structural sharing gives per-slice subscriptions, and the session reducer covers
the rest.

### Navigation

Hash-based, in [src/web/app/routes.ts](src/web/app/routes.ts) +
[useHashRoute.ts](src/web/app/useHashRoute.ts). `parseHash` / `serialiseRoute`
are pure and total; `resolveRoute` applies guards (unknown/locked station or
puzzle → `studio`; `grand-canvas` before unlock → `studio`; intro already seen →
`studio`). `useHashRoute()` returns the guard-resolved `route` and a stable
`navigate(route)` that sets `location.hash`. No routing library.

### Puzzle views

Each playable puzzle N is a single React component in
[src/web/puzzles](src/web/puzzles): `puzzle-NN-view.tsx` (a few have a companion
`*-data.ts`). They are registered in
[src/web/puzzles/index.ts](src/web/puzzles/index.ts) as **code-split**
`React.lazy` chunks in the `puzzleComponents` map, keyed `"puzzle-NN"`
(zero-padded).

A puzzle view is a normal controlled component: it takes `value` + `onChange`
props from [`<PuzzlePlayer>`](src/web/components/PuzzlePlayer.tsx), which hosts it
behind `<Suspense>` and owns the Check button **inside the React tree**. There is
no `persistedState` bridge, no `inputFactory`, and no external Check button.
Completion is reported through the `submitPuzzle` action, which returns a typed
`SubmitResult` the `PuzzleScreen` uses to drive feedback and the reward reveal.

**Adding a puzzle:** create `puzzle-NN-view.tsx`, register it in
`puzzles/index.ts`, add a demo solution
([src/content/demoSolutions.ts](src/content/demoSolutions.ts)), learning content +
quiz ([src/content/puzzleLearningContent.ts](src/content/puzzleLearningContent.ts)),
a validation branch in
[src/web/puzzleValidation.ts](src/web/puzzleValidation.ts), and a
`public/puzzle-info/puzzle-NN.md` card. Note: `puzzle-01`…`puzzle-21` are the
core set; `puzzle-23` is a wired extra, `puzzle-22` is sprite-only.

### Validation, feedback, learning gate

- [src/web/puzzleValidation.ts](src/web/puzzleValidation.ts) — `validatePuzzleInput`,
  `circularHueDistance`, `shuffleArray`, `isTriadValid` (unit-tested).
- [src/web/puzzles/diagnose.ts](src/web/puzzles/diagnose.ts) +
  [failureReasons.ts](src/web/puzzles/failureReasons.ts) — turn a wrong answer
  into a specific explanation shown in `ResultPanel`.
- [src/web/components/LearningIntro.tsx](src/web/components/LearningIntro.tsx) +
  [LearningQuiz.tsx](src/web/components/LearningQuiz.tsx) +
  [src/web/learning/evaluateLearningQuiz.ts](src/web/learning/evaluateLearningQuiz.ts)
  — the intro card + quiz that must pass at 100% before a puzzle is playable.
- Demo solutions (`getDemoSolution`) back both the CLI `solve` / `auto` commands
  and the web "Auto Solve Journey" (`actions.autoSolveJourney()`).

## Persistence

- Web: `localStorage` via
  [src/web/localProgress.ts](src/web/localProgress.ts) — key
  `ctg:web-progress:v1`, holding `completedPuzzleIds`,
  `learningProgressByPuzzle`, `introSeen`, and `lastRoute`. Keep schema changes
  **additive and backward-safe**.
- [src/web/state/persistenceSync.ts](src/web/state/persistenceSync.ts) is the
  single load/save bridge: on mount it replays `completedPuzzleIds` through the
  domain and restores learning + route; on change it debounces
  `saveLocalProgress()`. It never writes before first progress on a fresh run and
  swallows storage errors.
- Domain: [src/systems/SaveSystem.ts](src/systems/SaveSystem.ts) (CLI).

## Content and Learning Layer

- [src/content/puzzleLearningContent.ts](src/content/puzzleLearningContent.ts)
- [src/content/gameContent.ts](src/content/gameContent.ts)
- [src/content/demoSolutions.ts](src/content/demoSolutions.ts)
- [public/puzzle-info](public/puzzle-info): per-puzzle markdown cards fetched at
  runtime and rendered with `marked`.

## Validation and Testing Architecture

- **Unit** — `tests/*.test.ts`, node environment: domain, validation, reducers,
  pure helpers.
- **Component** — `tests/component/**/*.test.{ts,tsx}`, jsdom environment:
  React components and interaction flows, rendered inside a real `<GameProvider>`
  via `tests/component/helpers.tsx`.
- **End-to-end** — `tests/e2e`, Playwright, asserted against accessible roles and
  names (the UI contract), not CSS.

`npm test` runs the unit **and** component projects (both gate the Husky
pre-commit hook). `npm run test:e2e` runs Playwright (gates pre-push).

Standard validation commands: `npm run build`, `npm test`, `npm run lint`,
`npm run build:web`, and `npm run test:e2e` for UI / user-journey changes.

## Cross-Cutting Rules

- Keep game-rule decisions in the domain/systems layer, never in UI components.
- Keep puzzle behaviour localized to its `puzzle-NN-view.tsx` and validation branch.
- Style from design tokens; do not hard-code colours or spacing in a screen.
- Keep persistence-compatible schema updates additive and backward-safe.

## Evolution Notes

If architecture changes materially, update this document and the related
planning docs:
- [storyplan.md](storyplan.md)
- [cloud-handoff.md](cloud-handoff.md)

The full design record for the React migration is under
[specs/001-react-refactor-redesign](specs/001-react-refactor-redesign)
(`plan.md`, `research.md`, `data-model.md`, `contracts/`).
