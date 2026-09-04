# Contract: Persistence (`ctg:web-progress:v1`)

Governs `src/web/localProgress.ts` and its callers. The key and every existing
field are **frozen**; changes are additive-only (FR-049–FR-051, SC-003).

## Storage key

`ctg:web-progress:v1` — **unchanged**. No `v2`. A breaking change would require a
new key + migration and is out of scope.

## Schema

```ts
type LocalProgressSnapshot = {
  completedPuzzleIds: string[];                                   // existing
  activeStationId: string | null;                                 // existing
  practicePuzzleId: string | null;                                // existing
  learningProgressByPuzzle?: Record<string, { quizPassed: boolean }>; // existing (optional)
  introSeen?: boolean;                                            // NEW — optional
  lastRoute?: string;                                             // NEW — optional, best-effort
};
```

### New field rules
| Field | Absent means | Written when | May affect progression? |
|---|---|---|---|
| `introSeen` | first run — show the intro (FR-030a) | player dismisses the intro or reaches the Studio | **No** |
| `lastRoute` | no hint — start at Studio (or `activeStationId`) | on route change, debounced | **No** — ignored if it fails the nav guards |

## Read contract — `readLocalProgress(): LocalProgressSnapshot | null`

- Extend the existing defensive parse: each field independently validated,
  wrong-typed fields dropped to their default, **never throws**.
- `introSeen`: `typeof parsed.introSeen === 'boolean' ? parsed.introSeen : undefined`.
- `lastRoute`: kept only if it is a string; route validation happens during the
  restore flow in `persistenceSync.ts`.
- Corrupt JSON / `localStorage` throw → `null`.

## Write contract — `saveLocalProgress(snapshot): void`

- Serialise the full snapshot (existing + new fields).
- Wrapped in `try/catch`; storage failure (private mode, quota) is swallowed
  silently — gameplay continues unpersisted (FR-051, Edge Cases).
- **Not** called before the player makes first progress on a fresh run (no
  clobbering a corrupt-but-present blob until there is something to save — Edge
  Cases). Enforced by the `skipNextPersist` session flag.
- Debounced (≥250 ms) so rapid solves/navigations coalesce.

## Clear contract — `clearLocalProgress(): void`

- Unchanged. Called by `actions.reset()`. After clear, the app is in the fresh
  initial state: only `station-01` unlocked, all learning gates re-armed,
  `introSeen` gone (intro will show again) (FR-021, US1-8).

## Load / restore sequence (`persistenceSync.ts`)

1. `readLocalProgress()`. `null` → fresh `Game`, route = `intro` (first run).
2. Build a fresh `Game`; for each id in `completedPuzzleIds`, mark solved via the
   domain restore path (replay with the demo solution or a dedicated
   `restoreSolved` call) so score/pets/unlocks/streaks/milestones reconstruct
   deterministically — including stations completed "out of order" in the blob
   (Edge Cases).
3. Apply `learningProgressByPuzzle` to the store's `learning` map.
4. Initial route: `lastRoute` if it resolves to a currently-permitted route,
   else `activeStationId` → that station, else `studio`. If
   `introSeen !== true` and there is **no** progress, route = `intro`.
5. `finalCanvasUnlocked` (all pets) → allow `grand-canvas`; a returning
   fully-complete player lands in an all-unlocked Studio or the finale,
   matching today (Edge Cases).

## Compatibility tests (required)

| Test | Asserts |
|---|---|
| `tests/fixtures/legacy-save-v1.json` (real pre-feature blob) restores | zero solved puzzles / quiz passes / pets lost (SC-003, FR-049) |
| snapshot with no `introSeen` | treated as first run; intro shows once; after dismiss, `introSeen: true` persisted |
| snapshot with unknown extra keys | ignored, no throw |
| corrupt JSON string | `readLocalProgress()` → `null`, fresh game, blob not overwritten until progress |
| `localStorage.setItem` throws | no error surfaced, session continues |
| reset then reload | fresh initial state, intro shows again |
