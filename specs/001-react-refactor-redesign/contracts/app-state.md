# Contract: Application State & Navigation

The internal contract the React shell exposes. Consumers: every screen and
feature component. Not a public API — a stable seam so migration steps can be
built and tested independently.

## Contexts

Three separate contexts (split so a snapshot change does not re-render
action-only consumers):

```ts
// changes whenever domain state changes
const GameStoreContext: Context<GameSnapshot>;

// stable identities for the life of the provider
const GameActionsContext: Context<GameActions>;

// session/UI state + dispatch
const SessionContext: Context<{ state: SessionState; dispatch: Dispatch<SessionAction> }>;
```

## `GameSnapshot` (from `gameStore.getSnapshot()`)

```ts
type GameSnapshot = {
  progress: {
    solved: number; total: number; petsCollected: number;
    finalCanvasUnlocked: boolean; score: number;
    currentStreak: number; bestStreak: number;
    petMilestonesUnlocked: string[];
  };
  stations: ReadonlyArray<{
    id: string; name: string; type: string;
    status: 'locked' | 'available' | 'in-progress' | 'complete';
    solvedCount: number; puzzleCount: number;
    puzzles: ReadonlyArray<{
      id: string; title: string;
      state: 'locked' | 'available' | 'solved';
      learningRequired: boolean; rewardPetId: string;
    }>;
  }>;
  pets: ReadonlyArray<{
    id: string; name: string; collected: boolean;
    originPuzzleId: string; originStationId: string;
  }>;
  learning: Record<string, { quizPassed: boolean }>;
};
```

**Invariant**: `getSnapshot()` returns a referentially-stable object while no
field changed (structural memo). Selectors (`useProgress`, `useStation(id)`, …)
each pass a slice selector to `useSyncExternalStore` so consumers re-render only
on their slice.

## `GameActions` (stable)

```ts
type GameActions = {
  submitPuzzle(puzzleId: string, input: unknown): SubmitResult;
  practiceSubmit(puzzleId: string, input: unknown): SubmitResult;
  recordQuizPass(puzzleId: string): void;
  reset(): void;                       // domain rebuild + clearLocalProgress()
  markIntroSeen(): void;
  autoSolveJourney(): Promise<void>;   // dev/e2e only; drives submitPuzzle w/ demo solutions
};

type SubmitResult =
  | { ok: true; scoreEvent: { delta: number; reason: string }; petId: string | null;
      stationCompleted: boolean; nextStationId: string | null; grandCanvasUnlocked: boolean }
  | { ok: false; diagnosis: FailureDiagnosis };   // from puzzles/diagnose.ts
```

**Rules**:
- `submitPuzzle` calls the **domain** (`Game.completePuzzle` /
  `validatePuzzleInput`) — it never mutates `Puzzle.solved` or pet state directly
  (FR-007).
- Idempotent: a second `submitPuzzle` for an already-solved puzzle returns the
  cached success with `delta: 0` and no duplicate pet (Edge Cases).
- On success the action notifies store subscribers **once** (batched) so score,
  pets, unlocks and the reward animation update together.

## `SessionState` / `SessionAction`

See `data-model.md` §3b. Reducer is pure and unit-tested. `RESET` clears session
state **and** calls `actions.reset()`.

## Navigation — `useHashRoute()`

```ts
function parseHash(hash: string): Route;          // pure, total, never throws
function serialiseRoute(route: Route): string;    // pure
function useHashRoute(snapshot: GameSnapshot): {
  route: Route;                                    // already guard-resolved
  navigate(route: Route): void;                    // sets location.hash
};
```

**Guard rules** (applied in `useHashRoute` before returning `route`):
| Requested | Condition | Resolved to |
|---|---|---|
| `station` | station unknown or `status === 'locked'` | `studio` |
| `puzzle` | station locked, or puzzle `state === 'locked'` | `station` (if reachable) else `studio` |
| `grand-canvas` | `!progress.finalCanvasUnlocked` | `studio` |
| `intro` | `learning`/`introSeen` indicates already seen | `studio` (unless explicitly replayed via menu) |
| anything unparseable | — | `studio` |

**Focus management**: on `route` change, `<App>` moves focus to the new screen's
`<h1>` and the `<LiveRegion>` announces the screen name (FR-053, R14).

## Persistence sync (`persistenceSync.ts`)

- On mount: `readLocalProgress()` → replay `completedPuzzleIds` through the
  domain → restore `learningProgressByPuzzle`, `activeStationId` (→ initial
  route), `practicePuzzleId`, `introSeen`.
- On snapshot/session change: debounced `saveLocalProgress()` with the current
  `completedPuzzleIds` + learning + `introSeen` + `lastRoute`.
- Never writes before first progress on a fresh run; swallows storage errors
  (FR-051).
