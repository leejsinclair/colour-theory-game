# Phase 1 Data Model: React Architecture Refactor & Visual Redesign

This feature adds **no new domain entities** and changes no domain data
structure. It re-homes *UI/session* state from module-level `let` variables into
React, and adds one optional persistence field. The tables below describe the
entities as the React layer sees them and where each piece of state lives.

---

## 1. Domain entities (unchanged — owned by `src/game/`, `src/systems/`, `src/entities/`)

### Station
| Field | Type | Notes |
|---|---|---|
| `id` | `string` | `station-01`…`station-07` |
| `name` | `string` | Light Laboratory … Design Studio |
| `type` | `StationType` | enum, drives the per-station colour token |
| `position` | `{x,y}` | legacy map coord — retained, unused by new UI |
| `puzzles` | `Puzzle[]` | ordered |
| `unlocked` | `boolean` | `station-01` starts `true`; sequential unlock via `Game` |

Derived for UI (selector, not stored): `solvedCount`, `puzzleCount`,
`isComplete` (all puzzles solved), `status` = `locked | available | in-progress
| complete`.

### Puzzle
| Field | Type | Notes |
|---|---|---|
| `id` | `string` | `puzzle-01`…`puzzle-21`, `puzzle-23` (22 playable) |
| `title` | `string` | e.g. "Create White Light" |
| `type` | `PuzzleType` | enum |
| `solved` | `boolean` | domain-owned |
| `validator` | `(input) => boolean` | **domain-owned**, unchanged (FR-005) |
| `rewardPetId` | `string` | 1:1 with a pet (`puzzle-23` → `pet-22`) |

Derived for UI: `state` = `locked | available | solved`, `learningRequired`
(has content and no recorded quiz pass), `objective` text
(`src/web/puzzleContent.ts`).

### Chromatic Pet
| Field | Type | Notes |
|---|---|---|
| `id` | `string` | `pet-01`…`pet-22` |
| `name` | `string` | `PET_NAMES` in `src/web/petSprites.ts` |
| `spriteCentre` | `{cx,cy}` | CSS-sprite crop into `assets/pets/pets.png` (`pet-22` → standalone SVG) |
| `collected` | `boolean` | domain-owned (`player.collectedPets`) |
| `originPuzzleId` / `originStationId` | `string` | derived from the reward map |

`petSprites.ts` gains a React-friendly export (a `<PetBadge>`-consumable
descriptor / `getPetSprite(id)` returning style props) without removing the
existing DOM builder until legacy cleanup.

### Score Event (unchanged)
`{ delta: number; reason: string }` returned by `Game.completePuzzle` /
`Game.practiceComplete`. Values fixed by FR-014: +100 first solve, +25 pet
rescue, +50 station complete, +200 Grand Canvas (once), +10 practice (cap +30
per puzzle per session).

### Progress snapshot (from `Game.getProgress()` — unchanged shape)
`{ solved, total, petsCollected, finalCanvasUnlocked, score, currentStreak,
bestStreak, petMilestonesUnlocked[] }`. Milestone badges: 6 = "Color
Apprentice", 12 = "Palette Keeper", all = "Chromatic Master" (FR-015).

---

## 2. Persistence entity — `ctg:web-progress:v1`

`src/web/localProgress.ts`, key **unchanged**. `LocalProgressSnapshot`:

| Field | Type | Status | Notes |
|---|---|---|---|
| `completedPuzzleIds` | `string[]` | existing | replayed through domain on load |
| `activeStationId` | `string \| null` | existing | restores the player's context |
| `practicePuzzleId` | `string \| null` | existing | restores practice mode |
| `learningProgressByPuzzle` | `Record<string, { quizPassed: boolean }>` | existing (optional) | quiz-gate memory |
| `introSeen` | `boolean` | **NEW, optional** | absent ⇒ treat as first run (FR-030a). Additive, backward-safe (FR-050). Never affects progression. |
| `lastRoute` | `string` | **NEW, optional** | best-effort deep-link restore hint; ignored if invalid |

**Rules**:
- Read: tolerant parse (extend the existing `try/catch` + per-field guards);
  unknown/missing fields → safe defaults; corrupt JSON → `null` → fresh game.
- Write: debounced; skipped while a storage error is active; **not** written
  before the player makes progress on a fresh run (preserves current
  no-clobber-corrupt-data behaviour — Edge Cases).
- No version bump. A `v2` migration is explicitly out of scope.
- Fixture `tests/fixtures/legacy-save-v1.json` (a real pre-feature snapshot)
  must restore with zero loss (SC-003).

---

## 3. React application state (NEW — replaces `legacyGame.ts` "Layer 2")

### 3a. Route (source of truth for "where am I")
```
type Route =
  | { view: 'intro' }
  | { view: 'studio' }
  | { view: 'station'; stationId: string }
  | { view: 'puzzle'; stationId: string; puzzleId: string }
  | { view: 'collection' }
  | { view: 'grand-canvas' };
```
- Serialised to `window.location.hash`; parsed by `parseHash` (pure, tested).
- Guarded: a `station`/`puzzle` route pointing at a locked or unknown target is
  rewritten to `{ view: 'studio' }` before render (FR-026).
- `view` and `stationId`/`puzzleId` are **not** duplicated into any reducer.

### 3b. SessionState (`useReducer` in `GameProvider`)
| Field | Type | Replaces | Reset by |
|---|---|---|---|
| `practicePuzzleId` | `string \| null` | `legacyGame` module `let` | `RESET`, or leaving practice |
| `modal` | `{ kind: 'info'; puzzleId: string } \| null` | `initInfoModal` DOM state | `CLOSE_MODAL`, route change |
| `toasts` | `Toast[]` | `showToast` / `toastContainerEl` | auto-expire, `RESET` |
| `introDismissedThisSession` | `boolean` | n/a (new) | new session |
| `skipNextPersist` | `boolean` | `legacyGame` `skipNextPersist` | after one persist cycle |

Actions: `SUBMIT_RESULT`, `ENTER_PRACTICE`, `EXIT_PRACTICE`, `OPEN_INFO`,
`CLOSE_MODAL`, `PUSH_TOAST`, `EXPIRE_TOAST`, `DISMISS_INTRO`, `RESET`.

### 3c. Learning stage (local `useReducer` in `<PuzzleScreen>`)
```
type LearningStage = 'intro' | 'quiz' | 'solve';
type LearningState = { stage: LearningStage; selections: number[]; feedback: string };
```
- Initial stage: `solve` if `learningProgressByPuzzle[puzzleId]?.quizPassed`,
  else `intro`.
- Passing the quiz at 100% → dispatch a context action that (a) records
  `{ quizPassed: true }` into persistence and (b) advances to `solve`
  (FR-016, US3-2). No bypass path.

### 3d. Transient puzzle input (local `useState` in `<PuzzlePlayer>`)
- `value: TInput` — the puzzle's current answer, typed per puzzle.
- Initialised by `initialInputFor(puzzleId)`; the auto-solve/demo path sets it
  from `getDemoSolution(puzzleId)`.
- Passed to the `PuzzleComponent` as `value` + `onChange`; read by
  `<CheckButton>` on click. **No `persistedState`, no `Object.assign`, no DOM
  query** (SC-005).

### 3e. Derived/computed (selector hooks, memoised — not stored)
| Selector | Returns |
|---|---|
| `useProgress()` | the `Game.getProgress()` snapshot (stable identity) |
| `useStations()` | `Station` view models with `status`, `solvedCount` |
| `useStation(id)` | one station VM + its puzzle VMs |
| `usePuzzle(id)` | puzzle VM: `state`, `learningRequired`, `rewardPet` |
| `useRecommendedNext()` | earliest unlocked incomplete station, else its next unsolved puzzle, else Grand Canvas (US2-2, SC-010) |
| `usePets()` | 22 `PetBadge` descriptors with `collected` + origin |
| `useReducedMotion()` | `boolean` from the media query |

---

## 4. State ownership map (the core of this feature)

| State | Owner | Mechanism | Was |
|---|---|---|---|
| Puzzles solved, pets collected, score, streaks, station unlocks, milestones, Grand Canvas unlock | **`Game` (domain)** | OOP classes, unchanged | same |
| Colour math, puzzle validation, demo solutions | **domain** (`ColorEngine`, `src/puzzles/*`, `puzzleValidation.ts`, `demoSolutions.ts`) | unchanged (FR-005) | same |
| Persistence read/write | **`localProgress.ts` + `SaveSystem`** | called from `persistenceSync.ts` effect | called from `legacyGame.ts` |
| Current view / active station / active puzzle | **React** | `useHashRoute` (Route ⇄ hash) | `legacyGame` `activeStationId` `let` + DOM |
| Practice target, info-modal open, toast queue, intro-dismissed | **React** | `sessionReducer` | `legacyGame` module `let`s + DOM ids |
| Learning stage (intro/quiz/solve) + quiz selections | **React** | local `useReducer` in `<PuzzleScreen>` | `learningUiState` Map in `legacyGame` |
| Quiz-passed record | **Persistence** | `learningProgressByPuzzle` (existing) | same |
| Transient puzzle answer | **React** | `useState` in `<PuzzlePlayer>` | mutable `persistedState` object |
| Selected art-station colour | **React** | local state in `<ArtStationPad>` | `legacyGame` `selectedArtColor` `let` |
| First-run intro seen | **Persistence** | `introSeen` (new optional field) | n/a |
| Reduced-motion preference | **Platform** | `matchMedia` + `useReducedMotion` | partially handled in CSS |
| Reset | **React → domain + persistence** | `RESET` action rebuilds store, `clearLocalProgress()` | `resetSessionState()` + `clearLocalProgress()` |

---

## 5. Component data contracts (see `contracts/` for full signatures)

| Component | Key props (in) | Emits (out) |
|---|---|---|
| `<GameProvider>` | `children` | context: store snapshot, actions, session |
| `<PuzzlePlayer>` | `puzzleId`, `disabled` | `onSolved(scoreEvent, petId)`, `onFailed(diagnosis)` |
| `PuzzleComponent` (per puzzle) | `value`, `onChange`, `disabled`, `announce`, `reducedMotion` | via `onChange` only — never mutates domain (FR-007) |
| `<LearningQuiz>` | `puzzleId`, `questions` | `onPass()` (100% only) |
| `<PetBadge>` | `petId`, `collected`, `size`, `showLabel` | focus/hover visual only |
| `<StationCard>` | station VM | `onEnter()` (no-op + reason when locked) |
| `<HUD>` | progress snapshot (via hook) | — |
| `<InfoModal>` | `puzzleId` | `onClose()` (focus returns to trigger) |
| `<ResultPanel>` | `diagnosis` (from `diagnose.ts`) | `onRetry()` |
| `<GrandCanvasScreen>` | progress snapshot, pets | `onReturn()`, `onReviewPractice()` |

---

## 6. Validation rules (unchanged, enforced in the domain)

- Puzzle solve: `validatePuzzleInput(puzzleId, input)` / the puzzle's own
  validator — **not** re-implemented in React (FR-005, SC-002).
- Learning gate: quiz must score 100% before `stage` can become `solve`
  (FR-016).
- Practice: valid replay awards +10, capped at +30 per puzzle per session;
  streak still increments at the cap, no extra points, "cap reached" announced
  (FR-019, Edge Cases).
- Station unlock: sequential; reconstructed by replaying solves on load (Edge
  Cases — out-of-order restored save).
- Grand Canvas: unlocked when all 22 pets collected; +200 applied exactly once
  (FR-013, FR-014, Edge Cases — fast double Check is idempotent).
