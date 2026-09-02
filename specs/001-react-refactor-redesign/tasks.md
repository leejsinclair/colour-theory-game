---
description: "Task list for React Architecture Refactor & Visual Redesign"
---

# Tasks: React Architecture Refactor & Visual Redesign

**Input**: Design documents from `/specs/001-react-refactor-redesign/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/ (app-state, puzzle-component, persistence, ui-contract), quickstart.md

**Tests**: REQUIRED for this feature. The constitution makes testing non-negotiable and FR-056/FR-057/FR-058 explicitly mandate preserved unit tests, a rewritten Playwright suite, and new component/interaction tests. Test tasks are therefore included in every phase.

**Organization**: Tasks are grouped by user story. Each story is an independently testable increment. The migration follows a strangler-fig pattern (research.md R5/R6): the React shell flips once early, and un-migrated puzzles keep working through a temporary `LegacyPuzzleAdapter` so `main` stays playable at every checkpoint (FR-064).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependency on an incomplete task)
- **[Story]**: US1–US7 for user-story phases; no label for Setup / Foundational / Polish

## Path Conventions

Single repository. Web SPA under `src/web/`, domain core under `src/game/ src/systems/ src/entities/ src/puzzles/ src/content/` (untouched), tests under `tests/`.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Test tooling, design-system scaffold, and baselines needed before any migration work.

- [X] T001 [P] Add dev dependencies `jsdom`, `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event` to `package.json` (devDependencies only — runtime deps unchanged, SC-014) and run `npm install`
- [X] T002 Create `vitest.config.mts` at repo root (`.mts` — package.json is CommonJS) with two projects — `unit` (node env, `tests/*.test.ts`) and `component` (jsdom env, `tests/component/**/*.test.{ts,tsx}` + setup file `tests/component/setup.ts` importing `@testing-library/jest-dom/vitest`). Vite 8 (oxc) transforms TSX automatically; `passWithNoTests` so an empty component project is green until suites land.
- [X] T003 Update `package.json` scripts: `test` runs BOTH Vitest projects (`vitest run`) so the Husky `pre-commit` hook gates component tests (Principle II, research.md R10, quickstart.md); `test:component` = `vitest run --project component`; `test:watch` = `vitest --project unit`; `test:cloud` chains `test` unchanged
- [X] T004 [P] Create `src/web/design-system/tokens.css` with the CSS custom-property scaffold from research.md R8 (`--bg-*`, `--surface-*`, `--text-*`, `--accent-*`, `--station-01..07`, `--state-success/failure/locked`, `--space-*`, `--radius-*`, `--shadow-*`/`--glow-*`, `--font-display`/`--font-body`, `--motion-*`, `[data-reduced-motion]` mirror) — values provisional, filled during US7 contrast work
- [X] T005 [P] Add one SIL OFL display font (Space Grotesk, Latin-subset WOFF2 ~22 KB) under `src/web/design-system/fonts/` + `src/web/design-system/fonts.css` `@font-face` (`font-display: swap`, `unicode-range` Latin, system fallback via `--font-display`) and the upstream `OFL.txt` (FR-046)
- [X] T006 [P] Capture the pre-feature bundle baseline via `git worktree` on `main` + `npm ci` + `npm run build:web`; gzip sizes recorded to `specs/001-react-refactor-redesign/baseline-bundle.txt` (JS gzip baseline 219.01 kB; SC-013 ceiling ~251.9 kB)
- [X] T007 [P] Add `tests/fixtures/legacy-save-v1.json` — a mid-game `ctg:web-progress:v1` snapshot (10 `completedPuzzleIds` through `puzzle-10`, `activeStationId: station-04`, 11 `learningProgressByPuzzle` entries incl. a passed-but-unsolved `puzzle-11`) for persistence compatibility tests (SC-003)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: The state, navigation, persistence, shell, and design-system plumbing that every screen and every user story depends on. Per `contracts/app-state.md`, `contracts/persistence.md`, `contracts/puzzle-component.md`.

**⚠️ CRITICAL**: No user-story phase can begin until this phase is complete.

### State core

- [X] T008 [P] Create `src/web/state/gameStore.ts` — `subscribe(cb)` / `getSnapshot()` adapter over the mutable `Game` instance with a structurally-memoised stable `GameSnapshot` (research.md R1, `contracts/app-state.md` §GameSnapshot)
- [X] T009 Create `src/web/state/selectors.ts` — memoised selector hooks `useProgress`, `useStations`, `useStation(id)`, `usePuzzle(id)`, `useRecommendedNext`, `usePets`, each passing a slice selector to `useSyncExternalStore` (data-model.md §3e)
- [X] T010 Create `src/web/state/sessionReducer.ts` — `SessionState` + `SessionAction` union (`SUBMIT_RESULT`, `ENTER_PRACTICE`, `EXIT_PRACTICE`, `OPEN_INFO`, `CLOSE_MODAL`, `PUSH_TOAST`, `EXPIRE_TOAST`, `DISMISS_INTRO`, `RESET`), pure (data-model.md §3b)
- [X] T011 [P] Create `tests/component/sessionReducer.test.ts` — pure reducer coverage for every action incl. `RESET` clearing session state
- [X] T012 Create `src/web/state/actions.ts` (or co-locate in provider) — `GameActions`: `submitPuzzle`, `practiceSubmit`, `recordQuizPass`, `reset`, `markIntroSeen`, `autoSolveJourney`; each delegates to the domain (`Game.completePuzzle` / `Game.practiceComplete` / `validatePuzzleInput`), returns `SubmitResult`, is idempotent for already-solved puzzles, batches one store notification on success (`contracts/app-state.md` §GameActions)
- [X] T013 Create `src/web/state/GameProvider.tsx` — mounts the store, `useReducer(sessionReducer)`, and the three split contexts `GameStoreContext` / `GameActionsContext` / `SessionContext` (research.md R3, `contracts/app-state.md` §Contexts)
- [X] T014 [P] Create `src/web/state/useReducedMotion.ts` — `matchMedia('(prefers-reduced-motion: reduce)')` hook (FR-047)

### Navigation

- [X] T015 [P] Create `src/web/app/routes.ts` — `Route` union (`intro | studio | station | puzzle | collection | grand-canvas`), pure total `parseHash(hash)` and `serialiseRoute(route)`, plus the guard-resolution table (locked/unknown → `studio`; `grand-canvas` without unlock → `studio`) from `contracts/app-state.md` §Guard rules
- [X] T016 [P] Create `tests/component/useHashRoute.test.ts` — `parseHash` round-trips, unparseable → `studio`, every guard-rule row
- [X] T017 Create `src/web/app/useHashRoute.ts` — hook returning guard-resolved `route` + `navigate(route)` (sets `location.hash`), driven by `hashchange` and the current `GameSnapshot` (research.md R2)

### Persistence

- [X] T018 Extend `src/web/localProgress.ts` — add optional `introSeen?: boolean` and `lastRoute?: string` to `LocalProgressSnapshot`, with tolerant per-field parsing (wrong type → dropped, never throws) per `contracts/persistence.md` §Read contract; keep key `ctg:web-progress:v1`
- [X] T019 [P] Update `tests/localProgress.test.ts` — new-field parsing, unknown extra keys ignored, corrupt JSON → `null`, `setItem` throw swallowed
- [X] T020 Create `src/web/state/persistenceSync.ts` — on mount `readLocalProgress()` → rebuild `Game` by replaying `completedPuzzleIds` through the domain restore path → restore `learningProgressByPuzzle` / `activeStationId` / `practicePuzzleId` / `introSeen`; on first mount resolve and set the initial `location.hash` per `contracts/persistence.md` §4 (`lastRoute` if it passes `parseHash` + guards, else `activeStationId` → that station, else `studio`; `intro` only when `introSeen !== true` and no progress); debounced (≥250 ms) `saveLocalProgress()` on snapshot/session change; never writes before first progress on a fresh run (`skipNextPersist`); swallows storage errors (`contracts/persistence.md` §Load/restore sequence, FR-049–FR-051)
- [X] T021 [P] Create `tests/component/persistenceSync.test.ts` — `tests/fixtures/legacy-save-v1.json` restores with zero loss; missing `introSeen` → first run; corrupt JSON → fresh game, blob not overwritten until progress; `localStorage` throw → session continues; reset then reload → fresh state; initial-route resolution (valid `lastRoute` honoured; invalid `lastRoute` falls back to `activeStationId`; no progress + no `introSeen` → `intro`) (`contracts/persistence.md` §Compatibility tests)

### Design-system primitives

- [X] T022 [P] Create `src/web/design-system/` core primitives: `Button.tsx`, `IconButton.tsx`, `Card.tsx`, `Panel.tsx`, `Heading.tsx`, `Badge.tsx`, `Tag.tsx` — custom-styled from tokens, semantic HTML, `:focus-visible` ring (FR-048, FR-053). Shared class styles in `design-system/styles.css`; barrel `design-system/index.ts` (imports `styles.css` → `tokens.css` + `fonts.css`).
- [X] T023 [P] Create `src/web/design-system/` MUI-backed primitives: `Dialog.tsx`, `Menu.tsx`, `Slider.tsx`, `Tooltip.tsx` — thin custom-skinned wrappers over `@mui/material` (the only four MUI components retained, research.md R7)
- [X] T024 [P] Create `src/web/design-system/` a11y + progress primitives: `LiveRegion.tsx` (single app-level polite `aria-live` with an `announce()` API, research.md R14), `VisuallyHidden.tsx`, `ProgressRing.tsx`, `ProgressBar.tsx`
- [X] T025 [P] Create `src/web/design-system/CelebrationBurst.tsx` and `src/web/design-system/StudioBackdrop.tsx` — CSS/SVG only, reduced-motion aware (FR-045, FR-047)
- [X] T026 [P] Replace the 5 `@mui/icons-material` icons with inline SVG components in `src/web/design-system/icons.tsx`; remove `@mui/icons-material` from `package.json` (research.md R7). The 5 legacy call sites (`AppShell.tsx`, `muiControls.tsx`) re-aliased to the new icons so `main` stays green until they are deleted in Phase 3.

### Shell + adapter

- [X] T027 Create `src/web/app/App.tsx` — renders `banner` / `navigation` / `main` landmarks, switches on `useHashRoute().route`, mounts one `LiveRegion`, and moves focus to the new screen's `<h1>` on every route change (FR-009, FR-053, research.md R14, `contracts/ui-contract.md` §Landmarks). HUD (T038), `AppMenu` (T039) and `ToastHost` (T047a) are placeholders until US1; not yet wired into `main.tsx` (that is the T052 shell flip).
- [X] T028 Create screen shells under `src/web/screens/` — `IntroScreen.tsx`, `StudioScreen.tsx`, `StationScreen.tsx`, `PuzzleScreen.tsx`, `CollectionScreen.tsx`, `GrandCanvasScreen.tsx` — each renders its landmark `<h1>` (names per `contracts/ui-contract.md`) and is wired to selector hooks; content filled in later phases
- [X] T029 [P] Create `src/web/components/LegacyPuzzleAdapter.tsx` — TEMPORARY: hosts the existing `renderPuzzleById(puzzleId, deps)` inside a React container with a synthetic `PuzzleRenderDeps`; the legacy `addCheckButton` no longer builds a DOM button — its `inputFactory` is forwarded up via `onInputFactory` so `<PuzzlePlayer>` (T045) renders the real design-system Check button in the React tree (research.md R5). Deleted in Phase 5 (T080).
- [X] T030 [P] Add a React-friendly `getPetSprite(id, collected)` descriptor export to `src/web/petSprites.ts` (background style props + `ariaLabel` for `<PetBadge>`) without removing the existing DOM builder yet (data-model.md §1)

**Checkpoint**: State, navigation, persistence, design-system primitives, and an empty routed shell all build and unit-test green. `legacyGame.ts` still active — not yet wired in.

---

## Phase 3: User Story 1 - The full game plays end to end in a React-driven UI (Priority: P1) 🎯 MVP

**Goal**: The entire journey — Intro → Studio → Station → learning gate → Puzzle → feedback → reward → next station → Grand Canvas — runs through the React tree with every existing mechanic intact. `legacyGame.ts` and `src/web/legacy/{infoModal,learningFlow,resultFeedback}.ts` are removed from the browser flow (puzzle internals still run through `LegacyPuzzleAdapter` until US3).

**Independent Test**: From a fresh `localStorage`, play to the Grand Canvas — every puzzle solves, every pet unlocks, score/streak/milestones match baseline, reload restores progress, reset returns to fresh state — and DevTools shows no `legacyGame`/`src/web/legacy/*` module loaded (SC-004, quickstart.md §Manual smoke).

### Tests for User Story 1

- [X] T031 [P] [US1] Create `tests/component/HUD.test.tsx` — fresh readouts, score/pets/streak update after a solve, milestone badge (icon + label) after 6 pets. Narrow-width simplification is CSS-only (verified in the mobile e2e spec, US7).
- [X] T032 [P] [US1] Create `tests/component/LearningGate.test.tsx` — `<PuzzleScreen>`: Check absent through intro + a failed quiz (tips shown), appears once the quiz passes at 100%.
- [X] T033 [P] [US1] Create `tests/component/PuzzlePlayer.test.tsx` — real Check button in `.puzzle-stage__play`, wrong → `onFailed` w/ diagnosis, correct (via legacy beam buttons) → `onSolved`, second click idempotent, no submit while `disabled`.
- [X] T034 [P] [US1] Create `tests/component/InfoModal.test.tsx` — opens as a `dialog`, focus moves inside, `Escape` closes and restores focus to the opener (`fetch` stubbed → inline learning-content fallback).
- [X] T035 [US1] Rewrite `tests/e2e/new-player-journey.spec.ts` against `contracts/ui-contract.md` roles/names — intro, studio, learning gate, wrong then correct solve, pet reveal, station unlock, progression to Grand Canvas.
- [X] T036 [P] [US1] Rewrite `tests/e2e/studio.spec.ts` + `tests/e2e/design-studio-check.spec.ts` to role/name selectors; `tests/e2e/screenshot.spec.ts` retargeted to the `ResultPanel` alert.
- [X] T037 [US1] Persistence + reset e2e coverage in `tests/e2e/persistence.spec.ts` — reload mid-game restores solved set / quiz pass / route; menu → Reset run → fresh Studio + intro again.

### Implementation for User Story 1

- [X] T038 [P] [US1] Build `src/web/components/HUD.tsx` — brand + Grand-Canvas `ProgressRing`, Score / "Pets collected: N of 22" / "Streak: N" `status` readouts, milestone `Badge`s (icon + label), `AppMenu`. CSS simplifies (not shrinks) at ≤640 px.
- [X] T039 [P] [US1] Build `src/web/components/AppMenu.tsx` — design-system `Menu` (trigger "Menu"): "Reset run", "Replay intro", "Feedback"; "Auto solve journey" gated to a localhost/127.0.0.1 host (CommonJS-safe; `import.meta.env` unavailable under `module: CommonJS`).
- [X] T040 [P] [US1] Build `src/web/screens/IntroScreen.tsx` — 3 caretaker lines + "Enter the Studio" / "Skip", both `markIntroSeen()` → studio. First-run routing to `#/intro` added in `persistenceSync` (was a Phase 2 gap); `useHashRoute` reconciliation effect now guards against clobbering a hash another effect just changed.
- [X] T041 [US1] Fill `src/web/screens/StudioScreen.tsx` — `Card` grid from `useStations`, Enter/Continue nav, "Recommended: …" from `useRecommendedNext`, pet summary, "View pet collection".
- [X] T042 [US1] Fill `src/web/screens/StationScreen.tsx` — puzzle list, "Back to Studio", Play/Practice per puzzle (dispatches ENTER/EXIT_PRACTICE), "Go to <next station>" when complete.
- [X] T043 [P] [US1] Build `src/web/components/LearningIntro.tsx` + `LearningQuiz.tsx` — ported from `legacy/learningFlow.ts`; the pure scorer moved to `src/web/learning/evaluateLearningQuiz.ts`; 100%-pass gate; `onPass` → `actions.recordQuizPass`.
- [X] T044 [US1] Fill `src/web/screens/PuzzleScreen.tsx` — `useReducer` stage (`intro|quiz|solve`, initial `solve` when not gated/practice), `LearningIntro`→`LearningQuiz`→`PuzzlePlayer`, `ResultPanel`/`RewardReveal`, toasts + announcements, Continue routes to next station / Grand Canvas / back, "How this works" → OPEN_INFO.
- [X] T045 [US1] Build `src/web/components/PuzzlePlayer.tsx` + `CheckButton.tsx` — hosts `LegacyPuzzleAdapter`, real Check button in-subtree; `submit()` → `actions.submitPuzzle` / `practiceSubmit`; microtask double-submit guard. (Adapter fixed to append its wrapper unless the renderer self-appended.)
- [X] T046 [P] [US1] Build `src/web/components/ResultPanel.tsx` — `role="alert"` failure `Panel`, "✗ Not quite" + ordered `diagnosis.explanations`, "Try again", `announce()`.
- [X] T047 [P] [US1] Build `src/web/components/RewardReveal.tsx` — `CelebrationBurst` + pet `img` "<name> collected" + score reason + "Continue"; `role="status"` success `Panel`.
- [X] T047a [P] [US1] Build `src/web/components/ToastHost.tsx` — renders the `sessionReducer` toast queue, per-toast `setTimeout` → `EXPIRE_TOAST`; mounted once in `App.tsx`.
- [X] T048 [US1] Build `src/web/components/InfoModal.tsx` — `marked`-rendered `puzzle-info/*.md` (→ learning content → `puzzleConcepts` fallback) in design-system `Dialog`; "Open Chroma Tree explorer" mounts `ChromaTreeExplorer` for puzzle-06; driven by `session.modal`.
- [X] T049 [US1] Fill `src/web/screens/GrandCanvasScreen.tsx` — reuses `CompletionCertificate` (stats + full pet roll + Return / Review & practice). +200 applied once by the domain at unlock.
- [X] T050 [US1] Fill `src/web/screens/CollectionScreen.tsx` — `getPetSprite` grid; unlocked "<name> — from <station>", locked greyed silhouette + reveal hint.
- [X] T051 [US1] `actions.autoSolveJourney()` already implemented in Phase 2 (drives `submitPuzzle` + `recordQuizPass` with demo solutions); `AppMenu` now surfaces it on a dev host.
- [X] T052 [US1] Rewrite `src/web/main.tsx` — mounts `<GameProvider><App/></GameProvider>` into `#root`; `void import("./legacyGame")` removed (the shell flip).
- [X] T053 [US1] `index.html` reduced to `<div id="root"></div>` + the module script; static gameplay skeleton, `#auto-solve`/`#reset` hooks and `ctg:ready` gone.
- [X] T054 [US1] Deleted `src/web/legacyGame.ts`, `AppShell.tsx`, `legacy/{infoModal,learningFlow,resultFeedback}.ts`; `legacy/artStationMiniGame.ts` kept for Phase 5; `tests/learningFlow.test.ts` import repointed. `muiTheme.ts` now orphaned (T105).
- [X] T055 [US1] CLI regression — `git diff` confirms `src/game` / `src/systems` / `src/entities` / `src/cli.ts` / `src/content` untouched; `list` shows 22 puzzles, `solve puzzle-01` → "Solved puzzle-01."; 168 domain unit tests green.
- [X] T056 [US1] Checkpoint gate green — `npm run build` (tsc), `npm test` (177 unit + component), `npm run lint`, `npm run build:web` (JS gzip 207.7 kB vs 219.0 baseline; SC-013 OK), `npm run test:e2e` (18 passed). Grep: only comment references to `legacyGame` remain (in the temporary `LegacyPuzzleAdapter`, deleted T080); zero to `AppShell` / retired `legacy/*` modules.

**Checkpoint**: MVP — the full game is playable end to end in React, `legacyGame.ts` is retired, persistence and reset verified. Deployable. ✅

**Navigation fixes made in this phase** (Phase 2 `useHashRoute` / `persistenceSync` had a first-paint race): `src/web/app/navReady.ts` one-shot flag; `useHashRoute`'s URL-reconciliation effect is gated on it and re-resolves from the live store snapshot (not the stale `route` memo) so `persistenceSync`'s restore can set `#/station/...` / `#/intro` without being clobbered.

---

## Phase 4: User Story 2 - The Studio is a game hub that tells me what to do next (Priority: P2)

**Goal**: The Studio orients a player in seconds — premise, overall progress, per-station identity/lock/complete state, pet summary, and one recommended next activity — with stations as distinctive game-world cards.

**Independent Test**: Load the Studio at fresh / mid-game / all-complete states and confirm each station card shows identity + description + colour theme + puzzle count + progress + lock state, the HUD summarises progress, and "recommended next" points to the correct target within 10 s (SC-010).

### Tests for User Story 2

- [ ] T057 [P] [US2] Create `tests/component/StudioScreen.test.tsx` — fresh/mid/complete snapshots: card states distinct, `useRecommendedNext` target correct (earliest unlocked incomplete station or its next unsolved puzzle)
- [ ] T058 [P] [US2] Extend `tests/e2e/studio.spec.ts` — station-card identity, locked-station treatment communicated by more than colour, recommended-next affordance present on load

### Implementation for User Story 2

- [ ] T059 [P] [US2] Build `src/web/components/StationCard.tsx` — title, short description, per-station colour token, puzzle count, `ProgressRing`/`ProgressBar`, `locked | available | in-progress | complete` treatment (icon + text, not colour alone), "Enter <station>" / "Continue <station>" action; locked card states the reason (FR-029, FR-035, US2-3, US2-4)
- [ ] T060 [P] [US2] Build `src/web/components/RecommendedNext.tsx` — consumes `useRecommendedNext`; links to station / puzzle / Grand Canvas (US2-2, SC-010)
- [ ] T061 [US2] Redesign `src/web/screens/StudioScreen.tsx` — game title, premise line, overall completion, pet-collection summary, `StationCard` grid (`repeat(auto-fill, minmax(min(100%,16rem),1fr))`, research.md R15), `RecommendedNext`, "View pet collection" link (FR-028)
- [ ] T062 [US2] Apply `StudioBackdrop` + design tokens to the Studio so it reads unmistakably as a colour game — dark studio ground, custom cards, colourful CTAs (FR-042, FR-043; formal review in Polish)

**Checkpoint**: Studio is a proper hub. US1 journey still passes.

---

## Phase 5: User Story 3 - Each puzzle is a self-contained React experience (Priority: P2)

**Goal**: Every playable puzzle is a controlled React component satisfying `contracts/puzzle-component.md` — no `persistedState`, no `createRoot`-per-puzzle, no DOM queries, no domain imports. `LegacyPuzzleAdapter` and the `PuzzleRenderDeps` machinery are deleted.

**Independent Test**: For a puzzle in each of the 7 stations, drive the learning gate, operate controls by keyboard and pointer, submit wrong (specific feedback) then correct (reward), and confirm via source/React DevTools that input reaches Check through React state only (SC-005, quickstart.md §Architecture correctness).

### Tests for User Story 3

- [ ] T063 [P] [US3] Create `src/web/puzzles/types.ts` (new) — `PuzzleComponentProps<TInput>` = `{ value, onChange, disabled, announce, reducedMotion }` and `PuzzleComponent<TInput>` (`contracts/puzzle-component.md` §Signature)
- [ ] T064 [P] [US3] Rewrite `tests/artStationMiniGame.test.ts` → `tests/artStationCoverage.test.ts` — pure coverage/optical math for the extracted module
- [ ] T065 [P] [US3] Rewrite `tests/learningFlow.test.ts` → `tests/component/LearningQuiz.test.tsx` — component test of the quiz gate
- [ ] T066 [P] [US3] Add `tests/component/puzzle-views.test.tsx` — representative sample (one per station) + special apparatus: renders from `value`, emits correct `onChange` shape, asserts no `document`/`createRoot`/module-global/`Game` access
- [ ] T067 [P] [US3] Add `tests/e2e/puzzle-interaction.spec.ts` — keyboard + pointer control operation and wrong-then-right submission across ≥3 stations

### Implementation for User Story 3

- [ ] T068 [US3] Create `src/web/puzzles/index.ts` (new shape) — `puzzleComponents` `React.lazy` map keyed `puzzle-01..21`, `puzzle-23`, plus `initialInputFor(puzzleId)` (`contracts/puzzle-component.md` §Registration, research.md R13)
- [ ] T069 [P] [US3] Add design-system puzzle controls if not already covered by T022/T023 — labelled `Slider` / `Select` / `Checkbox` wrappers giving every puzzle one interaction vocabulary (Principle III, `contracts/puzzle-component.md` rule 3)
- [ ] T070 [P] [US3] Create `src/web/puzzles/artStationCoverage.ts` — pure, unit-tested coverage/optical math extracted from `src/web/legacy/artStationMiniGame.ts` (research.md R4)
- [ ] T071 [US3] Create `src/web/puzzles/ArtStationPad.tsx` — React rewrite of the Art Station paint pad satisfying `PuzzleComponentProps`; internal pad state local; selected colour is local state (was `legacyGame` `selectedArtColor`) (data-model.md §4, US3-4)
- [ ] T072 [P] [US3] Migrate **station-01** puzzle views — `src/web/puzzles/puzzle-0{1,2,3}-view.tsx` to the `PuzzleComponent` contract (drop local `useState` copy + `Object.assign(persistedState,…)`, drop `renderPuzzle0N`, `export default`, add `initialInputFor` case) per `contracts/puzzle-component.md` §Migration checklist
- [ ] T073 [P] [US3] Migrate **station-02** puzzle views — `puzzle-0{4,5,6}-view.tsx`; puzzle-06 keeps/uses `ChromaTreeExplorer.tsx`
- [ ] T074 [P] [US3] Migrate **station-03** puzzle views — `puzzle-0{7,8,9}-view.tsx`
- [ ] T075 [P] [US3] Migrate **station-04** puzzle views — `puzzle-1{0,1,2}-view.tsx`
- [ ] T076 [P] [US3] Migrate **station-05** puzzle views — `puzzle-1{3,4,5}-view.tsx`
- [ ] T077 [P] [US3] Migrate **station-06** puzzle views — `puzzle-1{6,7}-view.tsx` + `puzzle-18-view.tsx` (uses `ArtStationPad`)
- [ ] T078 [P] [US3] Migrate **station-07** puzzle views — `puzzle-{19,20,21}-view.tsx` + `puzzle-23-view.tsx` (keeps `puzzle-23-data.ts`)
- [ ] T079 [US3] Switch `src/web/components/PuzzlePlayer.tsx` from `LegacyPuzzleAdapter` to `<Suspense fallback={<PuzzleSkeleton/>}><PuzzleComponent value onChange disabled announce reducedMotion/></Suspense>` (`contracts/puzzle-component.md` §PuzzlePlayer)
- [ ] T080 [US3] Delete legacy puzzle machinery — `src/web/components/LegacyPuzzleAdapter.tsx`, `src/web/puzzles/puzzle-0*.ts`/`puzzle-1*.ts`/`puzzle-2*.ts` entry re-exports, `src/web/puzzles/puzzle-01.tsx` (dead duplicate), the old `renderPuzzleById`/`puzzleRenderers`/`PuzzleRenderDeps`, `src/web/puzzles/muiPuzzleControls.tsx`, `src/web/muiControls.tsx`, `src/web/legacy/artStationMiniGame.ts`; delete the now-empty `src/web/legacy/` directory (FR-003, SC-004, SC-005)
- [ ] T081 [US3] Run the checkpoint gate (build / test / test:component / lint / build:web / test:e2e); grep confirms zero `persistedState` / `PuzzleRenderDeps` / `src/web/legacy` references remain (SC-005)

**Checkpoint**: All 22 puzzles are native React components; the mutable bridge is gone.

---

## Phase 6: User Story 4 - Success feels rewarding and failure is instructive (Priority: P2)

**Goal**: Correct solves get a brief, non-blocking celebration + pet reveal + encouraging message; wrong attempts get a calm, specific, principle-level explanation. Both respect reduced motion and never rely on colour alone.

**Independent Test**: Trigger success and failure on several puzzles — celebration is brief and non-blocking, failure text names the specific issue and principle, `prefers-reduced-motion` swaps to a static equivalent, state carries icon/text not just colour (SC-008, SC-009).

### Tests for User Story 4

- [ ] T082 [P] [US4] Create `tests/component/ResultPanel.test.tsx` — renders the specific `diagnose.ts` reason + principle; state exposed by role/text not colour; retry works
- [ ] T083 [P] [US4] Create `tests/component/RewardReveal.test.tsx` — with `prefers-reduced-motion` mocked, no looping animation; static success treatment present
- [ ] T084 [P] [US4] Add `tests/e2e/feedback.spec.ts` — success celebration non-blocking; failure explanation specific; reduced-motion emulation → static

### Implementation for User Story 4

- [ ] T085 [US4] Polish `src/web/components/RewardReveal.tsx` + `src/web/design-system/CelebrationBurst.tsx` — colour burst / sparkle via CSS/SVG, encouraging copy, pet reveal, HUD update; interaction unblocked within a moment; static branch under reduced motion (FR-033, FR-047, US4-1, US4-2)
- [ ] T086 [US4] Polish `src/web/components/ResultPanel.tsx` — surface the colour-theory principle to reconsider from the existing diagnostic content; icon + text + shape for every state (FR-034, FR-035, US4-3, US4-4)
- [ ] T087 [US4] Route live-region announcements for solve, failure (with reason), station unlock and pet collection through the app `LiveRegion` (FR-036, `contracts/ui-contract.md` §Live region)

**Checkpoint**: Feedback loop is polished. Journey + puzzle tests still pass.

---

## Phase 7: User Story 7 - The game works and is accessible on any device (Priority: P2)

**Goal**: Purpose-built layouts for mobile / tablet / desktop, full keyboard operability with visible focus, accessible dialogs, WCAG AA contrast, non-colour-only state, no horizontal page scroll.

**Independent Test**: Run the primary journeys at 320 px / tablet / desktop, keyboard-only, and with a screen reader — no body horizontal scroll, adequate touch targets, visible focus at every step, correct semantics, AA contrast (SC-006, SC-007, SC-008).

### Tests for User Story 7

- [ ] T088 [US7] Create `tests/e2e/mobile-critical-path.spec.ts` — 320 px viewport: Studio → station → learning gate → puzzle → Check → Continue → next station with no horizontal page scroll and touch-operable controls (FR-054, SC-007)
- [ ] T089 [P] [US7] Add `tests/component/focus-management.test.tsx` — route change moves focus to `<h1>`; `InfoModal` traps focus, `Escape` closes, focus returns to opener; `LiveRegion.announce` produces a polite update
- [ ] T090 [P] [US7] Add a keyboard-only pass to `tests/e2e/new-player-journey.spec.ts` (or a `keyboard.spec.ts`) — whole primary journey via Tab/Shift+Tab/Enter/Space/arrows with a visible focus ring assertion (SC-006)

### Implementation for User Story 7

- [ ] T091 [US7] Responsive layout pass across all screens — mobile-first CSS, `clamp()` fluid tokens, stacking station grid, HUD as bottom bar on mobile / top rail on desktop (simplified not shrunk), ≥44 px touch targets, wide strips in `overflow-x:auto` containers; verify 320 / 768 / 1280 (FR-052, FR-054, research.md R15)
- [ ] T092 [US7] Accessibility pass — semantic landmarks confirmed, one `<h1>` per screen, `:focus-visible` token ring on every interactive element, real buttons / labelled controls / accessible `Dialog` (FR-053, `contracts/ui-contract.md`)
- [ ] T093 [US7] Fill the WCAG AA contrast matrix in `contracts/ui-contract.md`; adjust `tokens.css` values until every pair passes; ensure locked/solved/success/failure each carry icon + text (FR-035, FR-055, SC-008)
- [ ] T094 [US7] Run an axe / Lighthouse a11y pass on Studio, Station, Puzzle, Collection, Grand Canvas — zero AA contrast failures, no critical violations (quickstart.md §Accessibility & responsive)

**Checkpoint**: Responsive + accessible across devices, verified by the mobile e2e spec.

---

## Phase 8: User Story 5 - The Chromatic Pet collection feels like an achievement (Priority: P3)

**Goal**: One reusable pet component used everywhere; a game-like gallery with intriguing locked silhouettes, names, and source attribution; strong focus/hover.

**Independent Test**: Open the collection at several progress states — locked silhouettes don't reveal the design, unlocked pets show name + origin, every pet is keyboard-focusable with a label, and the same component renders pets in the HUD, collection and Grand Canvas (FR-038, US5).

### Tests for User Story 5

- [ ] T095 [P] [US5] Create `tests/component/PetBadge.test.tsx` — locked silhouette vs unlocked (name + origin), visible focus state, accessible label per `contracts/ui-contract.md` §Collection
- [ ] T096 [P] [US5] Add `tests/e2e/collection.spec.ts` — collection at fresh / partial / complete progress; locked vs unlocked treatment

### Implementation for User Story 5

- [ ] T097 [P] [US5] Build `src/web/components/PetBadge.tsx` — THE reusable pet component: locked silhouette / unlocked art (via `getPetSprite`), hover/focus, name, origin puzzle+station, `size` + `showLabel` props (FR-038)
- [ ] T098 [US5] Build `src/web/components/PetGallery.tsx` and redesign `src/web/screens/CollectionScreen.tsx` — game-like gallery, silhouettes that don't reveal the full design, "<pet> — from <station>" labels (FR-039, US5-1, US5-2)
- [ ] T099 [US5] Replace ad-hoc pet rendering in `HUD.tsx`, `RewardReveal.tsx` and `GrandCanvasScreen.tsx` with `PetBadge`; remove the legacy DOM builder from `src/web/petSprites.ts` if now unused (FR-038, US5-4)

**Checkpoint**: Pets are a cohesive collectible surface everywhere.

---

## Phase 9: User Story 6 - The Grand Canvas is a distinctive finale (Priority: P3)

**Goal**: A finale that reads as a genuine reward — visually distinct from puzzle screens, same design system — preserving stats, full pet roll, return + review/practice, and free revisiting of every station.

**Independent Test**: Complete the game (or inject a completed save) — finale shows preserved stats + pet roll, offers return + review/practice, looks clearly different from a puzzle screen, and reduces motion to a static treatment (US6, FR-040).

### Tests for User Story 6

- [ ] T100 [P] [US6] Create `tests/component/GrandCanvasScreen.test.tsx` — stats (puzzles solved / pets rescued / best streak) + full pet roll via `PetBadge`; "Return to Studio" and "Review & practise puzzles" present; reduced-motion static branch
- [ ] T101 [P] [US6] Add Grand Canvas coverage to `tests/e2e/new-player-journey.spec.ts` — unlock on final solve, +200 once, Return lands in an all-unlocked Studio (US6-2, Edge Cases)

### Implementation for User Story 6

- [ ] T102 [US6] Redesign `src/web/screens/GrandCanvasScreen.tsx` — distinctive finale layout on the shared design system: certificate treatment, stats, full pet roll, saved-progress reassurance, "Return to Studio" + "Review & practise puzzles" (FR-020, FR-040)
- [ ] T103 [US6] Reduced-motion static treatment for the finale celebration (FR-047, SC-009, US6-3); confirm Return unlocks all stations for free revisit/practice

**Checkpoint**: All user stories complete.

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Consistency, cleanup, performance verification, documentation, and final acceptance.

- [ ] T104 [P] Apply design tokens consistently across every screen; remove per-screen ad-hoc styles; trim `src/web/styles.css` to only still-referenced rules (FR-041, FR-044)
- [ ] T105 [P] Remove `src/web/muiTheme.ts` or reduce it to primitive theming for the four retained MUI components (research.md R7)
- [ ] T106 [P] Add `React.memo` to screens and list items, confirm `React.lazy` puzzle chunks split in the build, verify selector hooks re-render only on their slice (research.md R13)
- [ ] T107 Measure the final `npm run build:web` bundle vs `specs/001-react-refactor-redesign/baseline-bundle.txt` — ≤115% or justify the overage in the PR (SC-013)
- [ ] T108 Repo grep — zero browser-flow references to `legacyGame`, `src/web/legacy/*`, `persistedState`, `PuzzleRenderDeps`, `AppShell`, `muiControls`; confirm `@mui/icons-material` gone from `package.json` and 0 net-new runtime deps (SC-004, SC-005, SC-014)
- [ ] T109 [P] Rewrite `game-architecture.md` for the React-owned architecture; remove guidance describing the retired imperative shell; update references in `CLAUDE.md` (the `npm test` line now covers unit + component), `AGENTS.md` / `.github/instructions/*.instructions.md` / stale README notes (FR-060, SC-016)
- [ ] T110 [P] Confirm `vite.config.ts` `base: '/colour-theory-game/'` and both GitHub Pages workflows still build/deploy (FR-062)
- [ ] T111 Full `quickstart.md` validation — manual fresh→Grand-Canvas playthrough, persistence tests, keyboard/screen-reader/320 px checks, CLI regression; tick the Done-when list (SC-001…SC-012)
- [ ] T112 Informal visual-identity review — show only the Studio to 3–5 people; they call it a colour/art game, not a dashboard/LMS/MUI demo (SC-015, FR-043)
- [ ] T113 Final gate — `npm run build`, `npm test`, `npm run test:component`, `npm run lint`, `npm run build:web`, `npm run test:e2e` all green; PR description calls out the three sanctioned constitution deviations (plan.md Complexity Tracking)

---

## Dependencies & Execution Order

### Phase dependencies

- **Setup (Phase 1)**: no dependencies — start immediately
- **Foundational (Phase 2)**: needs Setup — **blocks every user story**
- **US1 (Phase 3, P1)**: needs Foundational — the MVP; also establishes the shell flip and legacy-orchestrator removal that later phases assume
- **US2 (Phase 4, P2)**: needs US1 (Studio screen + navigation exist)
- **US3 (Phase 5, P2)**: needs US1 (`PuzzlePlayer` + `LegacyPuzzleAdapter` exist); independent of US2
- **US4 (Phase 6, P2)**: needs US1 (`ResultPanel`/`RewardReveal` exist); best after US3 so all puzzles are native
- **US7 (Phase 7, P2)**: needs US1; strongest after US2/US3/US4 so all surfaces exist to make responsive/accessible
- **US5 (Phase 8, P3)**: needs US1 (`getPetSprite`, Collection shell); independent of US2–US4
- **US6 (Phase 9, P3)**: needs US1 (Grand Canvas shell) and US5 (`PetBadge` for the pet roll)
- **Polish (Phase 10)**: needs all targeted user stories

### Story independence

US2, US3, US5 are largely independent slices once Foundational + US1 land and can be worked in parallel by different people. US4 and US6 have light ordering preferences (noted above) but each remains independently testable. US7 is cross-cutting and is easiest last, but its e2e/a11y checks can begin against whatever screens exist.

### Within each phase

- Tests for a story can be written alongside implementation (they will fail until the components exist); each phase ends with a green checkpoint gate.
- `[P]` tasks touch different files with no incomplete-task dependency.
- Sequential (non-`[P]`) tasks in a phase share a file or consume a prior task's output (e.g. `PuzzleScreen` before `PuzzlePlayer` swap; all station migrations before deleting the adapter).

---

## Parallel Opportunities

- **Setup**: T001, T004, T005, T006, T007 in parallel (T002→T003 sequential).
- **Foundational**: after T008, the pure modules T011/T014/T015/T016/T019/T021 and the design-system batches T022/T023/T024/T025/T026/T030 run in parallel; T009/T012/T013/T017/T020 have ordering.
- **US1 tests**: T031–T034 in parallel; T036/T037 in parallel with T035.
- **US3 puzzle migrations**: T072–T078 are seven independent station-sized batches — the biggest parallel win in the plan.
- **US2 / US3 / US5**: whole phases parallelisable across contributors after US1.
- **Polish**: T104, T105, T106, T109, T110 in parallel.

### Parallel example — US3 puzzle migration

```text
# After T063 (types) + T068 (registry) land, run in parallel:
Task T072: Migrate station-01 views  (puzzle-01..03)
Task T073: Migrate station-02 views  (puzzle-04..06)
Task T074: Migrate station-03 views  (puzzle-07..09)
Task T075: Migrate station-04 views  (puzzle-10..12)
Task T076: Migrate station-05 views  (puzzle-13..15)
Task T077: Migrate station-06 views  (puzzle-16..18)
Task T078: Migrate station-07 views  (puzzle-19..21, 23)
# Then T079 (swap PuzzlePlayer) → T080 (delete adapter) → T081 (gate)
```

---

## Implementation Strategy

### MVP first

1. Phase 1 (Setup) → Phase 2 (Foundational) → Phase 3 (US1).
2. **Stop and validate**: full fresh→Grand-Canvas playthrough, persistence, reset, CLI, `legacyGame.ts` gone from the browser flow.
3. This is a shippable, correctly-architected game even before the visual redesign and per-puzzle migration land.

### Incremental delivery

Each subsequent phase is a green, deployable checkpoint (FR-064):

- + US2 → Studio becomes a real hub.
- + US3 → puzzles are native React; the mutable bridge and `PuzzleRenderDeps` are deleted.
- + US4 → feedback loop polished.
- + US7 → responsive + accessible across devices.
- + US5 → cohesive pet collection.
- + US6 → distinctive finale.
- + Polish → token consistency, docs, bundle check, formal acceptance.

### Parallel team strategy

After US1: Dev A on US2, Dev B on US3 (fan out T072–T078), Dev C on US5. Reconvene for US4/US7/US6, then Polish.

---

## Notes

- The game MUST remain playable end-to-end on `main` at every checkpoint (FR-064) — the shell flips once in T052; un-migrated puzzles ride `LegacyPuzzleAdapter` until their US3 batch.
- Do not skip or delete failing tests to merge (Principle II); fix forward.
- Net-new runtime dependencies: 0. Net-new dev dependencies: 4 (jsdom + `@testing-library/{react,jest-dom,user-event}`), justified in plan.md Complexity Tracking.
- Commit after each task or logical group; run the phase checkpoint gate before moving on.
