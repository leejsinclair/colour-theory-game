# Contract: PuzzleComponent

Replaces the `PuzzleRenderDeps` helper bag + `renderPuzzleById` +
`persistedState` + `addCheckButton` pattern (`src/web/puzzles/types.ts`,
`index.ts`). Every playable puzzle exports one React component satisfying this
contract; `<PuzzlePlayer>` hosts it.

## Signature

```ts
type PuzzleComponentProps<TInput> = {
  /** Current answer. Controlled — the component renders from this, never from its own copy. */
  value: TInput;
  /** Report a new answer. The ONLY channel out of the component. */
  onChange: (next: TInput) => void;
  /** True until the learning gate is passed, and briefly during reward playback. */
  disabled: boolean;
  /** Push a message to the shared aria-live region (results, hints, "cap reached"). */
  announce: (message: string) => void;
  /** Reduced-motion flag for any in-puzzle animation. */
  reducedMotion: boolean;
};

type PuzzleComponent<TInput> = React.ComponentType<PuzzleComponentProps<TInput>>;
```

## Registration

```ts
// src/web/puzzles/index.ts  (new shape)
export const puzzleComponents: Record<string, React.LazyExoticComponent<PuzzleComponent<any>>> = {
  'puzzle-01': React.lazy(() => import('./puzzle-01-view')),
  // …through puzzle-21, then:
  'puzzle-23': React.lazy(() => import('./puzzle-23-view')),
};

export function initialInputFor(puzzleId: string): unknown;  // per-puzzle starting value
```

`puzzle-NN.ts` entry re-export files and `renderPuzzleById` / `PuzzleRenderer` /
`PuzzleRenderDeps` are deleted once the map is complete.

## Rules

1. **No side channels.** The component MUST NOT: mutate a module-level variable,
   call `document.getElementById` / `querySelector`, call `createRoot`, read or
   write `localStorage`, import `Game` or any `src/game`/`src/systems` class, or
   mutate `value` in place. Output is `onChange` only. (FR-006, FR-007, SC-005)
2. **Validation stays in the domain.** The component MAY compute a live preview
   (e.g. the mixed colour swatch) but MUST NOT decide pass/fail — that is
   `<PuzzlePlayer>` → `actions.submitPuzzle` → domain. (FR-005)
3. **Controls come from the design system.** Sliders/selects/checkboxes/buttons
   are `design-system/` components (which wrap MUI Slider or native controls),
   giving every puzzle one interaction vocabulary (Principle III).
4. **Accessibility.** Controls are real, labelled elements; keyboard-operable;
   the component calls `announce()` for any state a sighted user learns from
   colour/position alone (FR-035, FR-036, US3-5).
5. **Reward/disabled.** While `disabled`, controls are non-interactive but remain
   visible and readable (no layout shift).
6. **Special apparatus** (`<ArtStationPad>` for puzzle-18, `<ChromaTreeExplorer>`
   for puzzle-06) satisfies the same contract; internal complex state is local.

## `<PuzzlePlayer>` responsibilities (the host)

```ts
type PuzzlePlayerProps = {
  puzzleId: string;
  disabled: boolean;                 // = learning gate not passed
  onSolved: (r: Extract<SubmitResult, { ok: true }>) => void;
  onFailed: (d: FailureDiagnosis) => void;
};
```

- Owns `const [value, setValue] = useState(initialInputFor(puzzleId))`.
- Renders `<Suspense fallback={<PuzzleSkeleton/>}><PuzzleComponent value onChange={setValue} disabled announce reducedMotion/></Suspense>`.
- Renders a real `<CheckButton disabled={disabled} onClick={submit}>Check</CheckButton>` **inside its own subtree** (FR-006).
- `submit()` → `actions.submitPuzzle(puzzleId, value)` → routes result to
  `onSolved` / `onFailed`; guards against double-submit while a result is
  pending (Edge Cases — fast repeated clicks).
- In practice mode, calls `actions.practiceSubmit` instead and shows the
  cap/streak messaging.

## Migration checklist (per puzzle, mechanical)

- [ ] `Puzzle0NView({ persistedState })` → `Puzzle0NView({ value, onChange, disabled, announce, reducedMotion })`
- [ ] delete the local `useState` copy + every `Object.assign(persistedState, …)` / `persistedState.x = …`
- [ ] delete the trailing `export const renderPuzzle0N = (deps) => { createRoot… addCheckButton… }`
- [ ] `export default Puzzle0NView` (for `React.lazy`)
- [ ] add `initialInputFor` case (was the `ensureState` initial object)
- [ ] confirm the `onChange` payload shape matches what `validatePuzzleInput` / the demo solution expects (compare to the old `inputFactory` return)
- [ ] component test: renders from `value`, emits correct `onChange`, no DOM/global access
