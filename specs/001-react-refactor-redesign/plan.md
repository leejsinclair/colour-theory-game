# Implementation Plan: React Architecture Refactor & Visual Redesign

**Branch**: `001-react-refactor-redesign` | **Date**: 2026-09-02 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/001-react-refactor-redesign/spec.md`

## Summary

Chromatic Mastery's browser UI is currently orchestrated by an imperative DOM
module (`src/web/legacyGame.ts`, ~825 lines, plus four `src/web/legacy/*`
sub-modules). React is present only as page chrome (`AppShell.tsx`) and as 22
mini-game views that are mounted into DOM zones with one `createRoot` call each
and bridged back to an out-of-tree "Check" button through mutable `persistedState`
objects and `document.getElementById` lookups.

This feature makes React the owner of the entire browser UI lifecycle, retires the
legacy DOM orchestration from the active browser flow, and applies a cohesive
"Magical Artist's Studio + Colour Laboratory + Indie Game Arcade" identity built
on a small design-token system. The domain core (`src/game/`, `src/systems/`,
`src/entities/`, `src/puzzles/`, `src/web/puzzleValidation.ts`), all educational
content, the CLI, and the `ctg:web-progress:v1` save format are preserved
unchanged in behaviour.

**Technical approach**: a strangler-fig migration. Introduce a React application
shell + hash-based navigation + a `GameProvider` that exposes the existing mutable
`Game` instance to React through `useSyncExternalStore` (no new dependency).
Migrate screen-by-screen (Studio → Station → Puzzle → Learning/Feedback →
Collection → Grand Canvas), and migrate the 22 puzzle views in batches — each
un-migrated puzzle keeps working through a temporary `LegacyPuzzleAdapter` so the
game stays fully playable on `main` at every checkpoint. Once every screen and
puzzle is React-native, delete `legacyGame.ts`, `src/web/legacy/*`, the
`PuzzleRenderDeps`/`persistedState` machinery, `muiControls.tsx`, and the
`index.html` DOM skeleton. MUI is reduced to four accessible primitives (Dialog,
Menu, Slider, Tooltip); `@mui/icons-material` is dropped in favour of inline SVG.
Net-new **runtime** dependencies: 0. Net-new **dev** dependencies: 4 (jsdom +
`@testing-library/{react,jest-dom,user-event}`) for the component-test layer
required by FR-058.

## Technical Context

**Language/Version**: TypeScript 6 (strict), `target` ES2022, `jsx: react-jsx`.
The `tsc -p tsconfig.json` gate (CommonJS emit) typechecks `src/**` and
`tests/**`; Vite/esbuild produces the ESM browser bundle separately.

**Primary Dependencies**: React 19.2, React-DOM 19.2 (runtime). MUI v9
(`@mui/material`) reduced to Dialog / Menu / Slider / Tooltip + focus utilities.
Emotion 11 retained only as MUI's styling engine (no direct app usage today).
`marked` 18 for info-card markdown. Vite 8 build. **Removed**:
`@mui/icons-material` (≈5 icons, replaced by inline SVG).

**Storage**: browser `localStorage` key `ctg:web-progress:v1`
(`src/web/localProgress.ts`) for the web snapshot; in-memory domain state
reconstructed on load by replaying solves through `Game` /
`src/systems/SaveSystem.ts`. Schema changes are additive-only.

**Testing**: Vitest 4 — existing node-environment unit suites
(`tests/*.test.ts`) unchanged in mechanism, plus a new jsdom-environment
component-test project (`@testing-library/react`). Playwright 1.59 e2e
(`tests/e2e/*`), all four specs rewritten against a role/accessible-name
contract. Husky `pre-commit` (lint + unit) / `pre-push` (e2e) unchanged.

**Target Platform**: current evergreen desktop and mobile browsers; static
single-page deployment to GitHub Pages at base path `/colour-theory-game/`.

**Project Type**: single repository — a web SPA (`src/web/`) and a Node CLI
(`src/cli.ts`, `src/index.ts`) sharing one TypeScript domain core. No backend.

**Performance Goals**: production JS bundle grows ≤15% vs the pre-feature
baseline (SC-013); puzzle input and Check produce no perceptible lag; the
self-hosted heading font does not block first paint (`font-display: swap`,
preloaded, subsetted WOFF2); no looping or interaction-blocking animation.

**Constraints**: no routing library (hash navigation only, FR-025); no
state-management library (React Context + `useReducer` + `useSyncExternalStore`,
FR-008); 0 net-new runtime dependencies (SC-014); WCAG AA contrast and
non-colour-only state (FR-055, FR-035); full keyboard operability (FR-053);
`prefers-reduced-motion` honoured everywhere (FR-047); backward-compatible
persistence (FR-049–FR-051); the game MUST remain playable end-to-end on `main`
at every migration checkpoint (FR-064); Vite `base: '/colour-theory-game/'` and
the Pages workflows preserved (FR-062).

**Scale/Scope**: 7 stations, 22 playable puzzles (`puzzle-01`–`21` + `23`), 22
pets, ~6 top-level screens, ~15 design-system primitives, ~25 feature
components, 1 imperative orchestrator + 4 legacy sub-modules + the
`PuzzleRenderDeps` bridge to retire, 4 e2e specs + 2 legacy-module unit specs to
rewrite.

## Constitution Check

*GATE: evaluated against `.specify/memory/constitution.md` v1.0.0.*

### Principle I — Code Quality & Architectural Integrity

| Check | Status |
|---|---|
| TypeScript strict; no new `any` / unchecked assertions without justification | **PASS** — enforced by FR-059, SC-012; lint gate unchanged |
| Game-rule decisions stay in `src/game/` / `src/systems/` / `src/entities/` | **PASS** — FR-005, FR-007; React calls domain methods, never re-implements rules |
| New code follows established repo patterns rather than a parallel convention | **DEVIATION (sanctioned)** — this feature deliberately *replaces* the `puzzle-NN.ts` + `PuzzleRenderDeps` + `src/web/legacy/*` conventions with a React component model. This is the explicit purpose of the feature and is justified in Complexity Tracking; the PR description must state it per the constitution. |
| Dead / commented-out code not merged; deletions are real deletions | **PASS** — FR-003, SC-004 require legacy removal once references/tests confirm disuse |

### Principle II — Testing Standards (NON-NEGOTIABLE)

| Check | Status |
|---|---|
| Domain / validation changes ship with Vitest unit coverage | **PASS** — domain is preserved; FR-056 keeps `tests/game.test.ts`, `tests/puzzleValidation.test.ts`, `tests/localProgress.test.ts`; new pure modules (hash-route parser, art-station coverage math, persistence merge) get unit tests |
| UI / journey changes ship with Playwright e2e coverage | **PASS** — FR-057 rewrites the suite against semantic selectors and enumerates required paths |
| Failing tests fixed, never skipped/deleted to merge | **PASS** — checkpoint discipline (build + test + lint + e2e green per phase) |
| Husky gates not bypassed without one-off authorization | **PASS** — gates unchanged |
| New component-test tooling | **DEVIATION (sanctioned)** — jsdom + `@testing-library/*` added as **dev** dependencies to satisfy FR-058; justified in Complexity Tracking and SC-014 (runtime deps still 0) |

### Principle III — User Experience Consistency

| Check | Status |
|---|---|
| Puzzle interactions built from shared helpers so every puzzle shares one vocabulary | **PASS (re-based)** — the `PuzzleRenderDeps` helper bag is replaced by a shared design-system control set (`<Slider>`, `<Select>`, `<Checkbox>`, `<CheckButton>`, hue helpers) used by every puzzle; the *principle* (one interaction vocabulary) is preserved, the *implementation* changes |
| Learning gate precedes playability, no bypass | **PASS** — FR-016; gate state machine moves into `<PuzzleScreen>` with the same 100%-pass rule |
| Wrong-answer feedback routes through `diagnose.ts` / `failureReasons.ts` | **PASS** — FR-017; `<ResultPanel>` consumes the same diagnostic modules |
| Persistence changes additive and backward-safe | **PASS** — FR-049–FR-051; version key unchanged, new fields optional |

### Principle IV — Performance Requirements

| Check | Status |
|---|---|
| `npm run build:web` keeps working; no material unexplained bundle regression | **PASS** — FR-062, SC-013 (≤15%, measured); MUI surface shrinks, `@mui/icons-material` removed, puzzle views `React.lazy`-split |
| Expensive colour math stays in `ColorEngine` / `src/systems/`, not render | **PASS** — preserved; art-station coverage math extracted to a pure tested module |
| New content must not materially degrade initial load | **PASS** — decoration is CSS/SVG (FR-045); one subsetted WOFF2 heading font, non-blocking |
| **"The web shell's imperative orchestration exists specifically to avoid a full React re-render tree… new features MUST work within this model rather than introducing a competing state library or a parallel React root."** | **DEVIATION (sanctioned, central to the feature)** — this feature reverses that mandate: it removes the imperative shell and makes React own the tree. Mitigations for the performance concern the mandate protects are designed in (see Complexity Tracking and `research.md`): `useSyncExternalStore` over the existing `Game` instance, split contexts, memoised selectors, `React.memo` screens, lazy puzzle chunks, measured bundle. FR-060 requires `game-architecture.md` to be rewritten; a follow-up `/speckit.constitution` amendment to Principle IV is recommended so the constitution matches the shipped architecture. |

### Technology Stack & Tooling Constraints

Stack changes are justified, not incidental: MUI reduced (not removed) per the
clarified FR-048; `@mui/icons-material` removed (small, replaceable); dev-only
test tooling added. Node `.nvmrc` version, `vite.config.ts` base path, and both
CI workflows are unchanged. **PASS.**

### Development Workflow & Quality Gates

`npm run build` / `npm test` / `npm run lint` / `npm run test:e2e` all gate each
checkpoint (FR-059, FR-063, FR-064). Changes are scoped to `src/web/`, tests, and
docs; the domain layer is not opportunistically refactored (Non-Goals). **PASS.**

**Gate result: PASS with three sanctioned deviations**, all recorded in
Complexity Tracking. The deviations are the stated purpose of the feature and are
authorised by the approved spec; the implementation PR(s) must call them out
explicitly per the constitution's Governance section.

*Post-Phase-1 re-check: unchanged — the design in `research.md` / `data-model.md`
/ `contracts/` introduces no new violation and no new runtime dependency.*

## Project Structure

### Documentation (this feature)

```text
specs/001-react-refactor-redesign/
├── plan.md              # This file
├── research.md          # Phase 0 — decisions & rationale
├── data-model.md        # Phase 1 — entities, state ownership, persistence schema
├── quickstart.md        # Phase 1 — how to validate the feature end to end
├── contracts/
│   ├── app-state.md     # GameProvider / context / reducer / navigation contract
│   ├── puzzle-component.md  # PuzzleComponent props + submit contract (replaces PuzzleRenderDeps)
│   ├── persistence.md   # ctg:web-progress:v1 read/write/merge contract
│   └── ui-contract.md   # Accessible roles/names Playwright & AT rely on
├── checklists/
│   └── requirements.md  # Spec quality checklist (already validated)
└── tasks.md             # Created by /speckit.tasks — NOT by this command
```

### Source Code (repository root)

```text
src/
├── game/ systems/ entities/ puzzles/ content/ types/     # DOMAIN — unchanged behaviour
│   └── content/gameContent.ts + gameContent additions: none (data reused as-is)
├── cli.ts  index.ts                                      # CLI — unchanged
└── web/
    ├── main.tsx                 # rewritten: mounts <App> only; no legacyGame import
    ├── app/
    │   ├── App.tsx              # screen switch + landmarks + focus management
    │   ├── useHashRoute.ts      # hash <-> view/params mapping (pure parser + hook)
    │   └── routes.ts            # view enum, guards (locked -> Studio), deep-link parse
    ├── state/
    │   ├── GameProvider.tsx     # useSyncExternalStore over Game; split contexts
    │   ├── gameStore.ts         # subscribe/getSnapshot adapter around the mutable Game
    │   ├── sessionReducer.ts    # { view, activeStationId, practicePuzzleId, modal, toasts }
    │   ├── persistenceSync.ts   # read on init, debounced write, corrupt-safe (wraps localProgress.ts)
    │   └── useReducedMotion.ts
    ├── design-system/
    │   ├── tokens.css           # CSS custom properties: colour/surface/text/accent/station/
    │   │                        #   success-failure/spacing/radius/shadow-glow/type/motion
    │   ├── fonts/               # one subsetted WOFF2 display face + @font-face + license file
    │   ├── Button.tsx IconButton.tsx Card.tsx Panel.tsx Heading.tsx
    │   ├── Badge.tsx Tag.tsx ProgressRing.tsx ProgressBar.tsx
    │   ├── Dialog.tsx Menu.tsx Slider.tsx Tooltip.tsx   # thin MUI wrappers, custom-skinned
    │   ├── LiveRegion.tsx VisuallyHidden.tsx
    │   ├── CelebrationBurst.tsx  # reduced-motion aware
    │   └── StudioBackdrop.tsx    # CSS/SVG decoration
    ├── components/
    │   ├── HUD.tsx              # summarises station/completion/pets/streak/Grand-Canvas progress
    │   ├── AppMenu.tsx          # Reset, Replay intro, (dev) Auto-solve journey, Feedback link
    │   ├── PetBadge.tsx         # THE reusable pet component: locked silhouette / unlocked
    │   ├── PetGallery.tsx
    │   ├── StationCard.tsx  RecommendedNext.tsx
    │   ├── PuzzleMap.tsx  PuzzleListItem.tsx
    │   ├── LearningIntro.tsx  LearningQuiz.tsx
    │   ├── PuzzlePlayer.tsx     # hosts a PuzzleComponent + real <CheckButton>; lifts input
    │   ├── ResultPanel.tsx      # consumes diagnose.ts / failureReasons.ts
    │   ├── RewardReveal.tsx
    │   ├── ToastHost.tsx       # renders sessionReducer toast queue (station-complete / practice)
    │   ├── InfoModal.tsx        # marked-rendered card + ChromaTreeExplorer (reused)
    │   └── LegacyPuzzleAdapter.tsx  # TEMPORARY — deleted at end of puzzle migration
    ├── screens/
    │   ├── IntroScreen.tsx      # first-run caretaker intro (skippable, replayable)
    │   ├── StudioScreen.tsx
    │   ├── StationScreen.tsx
    │   ├── PuzzleScreen.tsx     # what -> learn -> solve -> check -> feedback -> reward -> continue
    │   ├── CollectionScreen.tsx
    │   └── GrandCanvasScreen.tsx  # reworked from CompletionCertificate.tsx
    ├── puzzles/
    │   ├── index.ts             # NEW: puzzleComponents map { "puzzle-NN": React component }
    │   ├── types.ts             # NEW: PuzzleComponentProps (value/onChange/disabled/announce/reducedMotion)
    │   ├── puzzle-01-view.tsx … puzzle-23-view.tsx   # refactored: controlled, no persistedState, no createRoot
    │   ├── ArtStationPad.tsx    # NEW: React rewrite of legacy/artStationMiniGame.ts
    │   ├── ChromaTreeExplorer.tsx  # reused as-is
    │   ├── diagnose.ts  failureReasons.ts            # reused as-is
    │   └── artStationCoverage.ts # NEW pure module: coverage/optical math, unit-tested
    ├── puzzleValidation.ts  puzzleContent.ts  localProgress.ts  petSprites.ts  # kept (petSprites: add a React-friendly export)
    └── styles.css               # trimmed to only still-referenced rules

  RETIRED once migration completes:
    src/web/legacyGame.ts
    src/web/legacy/{infoModal,learningFlow,resultFeedback,artStationMiniGame}.ts
    src/web/AppShell.tsx
    src/web/muiControls.tsx  src/web/muiTheme.ts (or reduced to primitive theming)
    src/web/puzzles/{puzzle-01..21,23}.ts entry re-exports + puzzle-01.tsx (dead dup)
    src/web/puzzles/index.ts renderPuzzleById / puzzleRenderers / PuzzleRenderDeps
    src/web/puzzles/muiPuzzleControls.tsx
    index.html DOM skeleton (reduced to <div id="root">) + #auto-solve/#reset/ctg:ready

tests/
├── game.test.ts  puzzleValidation.test.ts  localProgress.test.ts   # kept (domain)
├── artStationMiniGame.test.ts   # rewritten -> artStationCoverage.test.ts (pure math)
├── learningFlow.test.ts         # rewritten -> LearningQuiz.test.tsx (component)
├── component/                    # NEW jsdom project
│   ├── PuzzlePlayer.test.tsx  LearningGate.test.tsx  PetBadge.test.tsx
│   ├── StudioScreen.test.tsx  HUD.test.tsx  InfoModal.test.tsx
│   └── useHashRoute.test.ts  persistenceSync.test.ts
└── e2e/                          # all 4 specs rewritten to role/name selectors
    ├── new-player-journey.spec.ts  studio.spec.ts
    ├── design-studio-check.spec.ts  screenshot.spec.ts
    └── mobile-critical-path.spec.ts   # NEW (320px)

vitest.config.ts  # NEW: two projects (node unit / jsdom component) — replaces the implicit default
```

**Structure Decision**: Single project, no new top-level directories. All new
code lives under `src/web/` in five new sub-folders (`app/`, `state/`,
`design-system/`, `components/`, `screens/`) plus a reshaped `src/web/puzzles/`.
The domain core, CLI, content and `public/` assets are untouched. `src/web/legacy/`
is deleted at the end of the migration. This matches the repo's existing
"domain core + two runtime surfaces" layout and the constitution's Technology
Stack constraints.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| **Principle IV — removing the imperative shell / making React own the render tree** (also touches Principle I "follow established patterns" and Principle III "PuzzleRenderDeps") | This is the feature. The current React/DOM/`persistedState` split is the spec's stated primary architectural debt (FR-006, SC-005); it produces `createRoot`-per-puzzle leaks, out-of-tree Check buttons, DOM-id coupling, and untestable UI seams. FR-001–FR-004 mandate React ownership. | "Keep the imperative shell, wrap it in React" was considered and rejected: it leaves every listed defect in place, cannot deliver the Studio/Puzzle screen model (FR-024), and SC-004 explicitly forbids the legacy modules loading in the browser flow. The performance rationale behind Principle IV is instead addressed directly (`useSyncExternalStore`, split contexts, memo selectors, lazy puzzle chunks, measured ≤15% bundle — see `research.md`). |
| **Replacing `PuzzleRenderDeps` / `puzzle-NN.ts` pair convention with a React `PuzzleComponent` contract** | The helper bag exists only to feed data across the React/DOM boundary that this feature removes. A single `PuzzleComponent` props contract (`contracts/puzzle-component.md`) preserves the "one interaction vocabulary" intent of Principle III via a shared control set. | Keeping the helper-bag signature would force every migrated puzzle to keep an imperative `render()` entry and an `inputFactory`, re-introducing the mutable bridge the feature exists to delete. |
| **Adding 4 dev dependencies (jsdom, `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`)** | FR-058 requires component/interaction tests for the new React puzzle lifecycle and shared components; Vitest currently runs node-only with no DOM. | happy-dom was considered (lighter) but jsdom has better fidelity for focus-trap / dialog / `aria-live` assertions that FR-036/FR-053 depend on. Runtime dependencies remain 0 (SC-014); these are `devDependencies` only. |

**Follow-up (not part of this feature's code):** after this ships, run
`/speckit.constitution` to amend Principle IV so it describes the React-owned
architecture instead of the retired imperative shell (FR-060 handles the
`game-architecture.md` side).
