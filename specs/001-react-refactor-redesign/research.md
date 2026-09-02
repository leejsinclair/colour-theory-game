# Phase 0 Research: React Architecture Refactor & Visual Redesign

All open questions from the Technical Context are resolved below. The five
spec-level ambiguities were already settled in the Clarifications session
(2026-09-02) and are treated as fixed inputs here.

---

## R1. How does React consume the mutable `Game` domain instance without a state library?

**Decision**: Wrap the existing `Game` instance in a tiny external-store adapter
(`gameStore.ts`, ~40 lines) exposing `subscribe(listener)` / `getSnapshot()`, and
read it in components with React 19's built-in `useSyncExternalStore`. Domain
mutations (`completePuzzle`, `practiceComplete`, `load`) are performed through
action functions that call the `Game` method, then notify subscribers.
`getSnapshot()` returns a **stable, structurally-compared** progress object
(memoised — same reference unless a field changed) derived from
`game.getProgress()` plus the per-station/per-puzzle solved/locked state.

**Rationale**:
- `useSyncExternalStore` is the idiomatic React primitive for exactly this
  ("subscribe to an external mutable source"); it is in React itself — **no
  dependency** (satisfies FR-008, SC-014).
- Keeps `Game` as the single source of truth (Principle I / FR-005); React never
  copies domain state, it subscribes to it.
- Solves the Principle IV performance concern: a snapshot that keeps referential
  identity lets `React.memo` screens and `useMemo` selectors skip re-renders when
  an unrelated field changes.

**Alternatives considered**:
- *Zustand* — allowed by the spec "only if a real need is demonstrated". No need:
  `useSyncExternalStore` + context covers every sharing case. Rejected (avoids a
  dependency and matches `game-architecture.md`'s own guidance to prefer the
  minimum).
- *Lift `Game` into `useState` and replace on every change* — forces immutable
  cloning of a deep OOP graph or `forceUpdate` hacks; fights the domain design.
  Rejected.
- *Plain Context holding the `Game` instance + a version counter* — workable but
  `useSyncExternalStore` gives correct tearing behaviour and a cleaner selector
  story for free. Rejected in favour of the store adapter.

---

## R2. Navigation model — routing library or not?

**Decision**: Custom hash-based navigation. `useHashRoute()` maps
`window.location.hash` ⇄ a typed `Route` (`{ view: 'studio' | 'station' |
'puzzle' | 'collection' | 'grand-canvas' | 'intro'; stationId?; puzzleId? }`).
A pure `parseHash(hash): Route` / `serialiseRoute(route): string` pair is
unit-tested. `listen` via `hashchange`. Guards live in `routes.ts`: a route
resolving to a locked/unknown station or puzzle is rewritten to `studio` (or the
station's locked state) before render (FR-026, Edge Cases).

**Rationale**: FR-025 explicitly says full history/query routing and a routing
dependency are **not required**; deep-linking to top-level screens is a SHOULD,
satisfied by the hash. Hash routing needs no server config for the GitHub Pages
subpath (`/colour-theory-game/`) and survives reload/share. ~60 lines total.

**Alternatives considered**:
- *react-router* — real dependency, history API needs Pages 404 fallback config,
  far more surface than six screens need. Rejected (FR-025, SC-014).
- *No addressable screens (pure in-memory view state)* — fails the FR-025 SHOULD
  and makes e2e/debugging harder. Rejected.

---

## R3. Session / UI navigation state shape

**Decision**: One `useReducer` in `GameProvider` for session state that is not
domain state and not derivable from the route:

```
type SessionState = {
  practicePuzzleId: string | null;   // was a legacyGame module-level `let`
  modal: { kind: 'info'; puzzleId: string } | null;
  toasts: Toast[];                    // reward/pet/practice messages queue
  introDismissedThisSession: boolean;
};
```

`view` and `activeStationId` come from the **route**, not this reducer (single
source of truth for "where am I"). `selectedArtColor` moves into
`<ArtStationPad>` local state. Domain state (score, streak, solved, pets,
unlocks, milestones) stays in `Game`. `learningProgressByPuzzle` is persisted and
exposed via the store snapshot; the transient learning **stage** (intro / quiz /
puzzle) is local `useReducer` state inside `<PuzzleScreen>`.

**Rationale**: Directly retires the "Layer 2" module-level `let` variables
(`game-architecture.md` §Layer 2) and the `resetSessionState()` pattern —
`Reset` now dispatches a reducer action + rebuilds the store. Matches FR-008.

**Alternatives considered**: a single mega-reducer holding route + session +
mirrored domain — rejected (re-creates the "competing source of truth" smell and
couples navigation to domain).

---

## R4. The `persistedState` bridge → what replaces it per puzzle?

**Decision**: `PuzzleComponent` contract (`contracts/puzzle-component.md`):

```
type PuzzleComponentProps<TInput> = {
  value: TInput;
  onChange: (next: TInput) => void;
  disabled: boolean;                    // true until learning gate passed / during reward
  announce: (message: string) => void;  // routes to the shared aria-live region
  reducedMotion: boolean;               // for any in-puzzle animation
};
```

`<PuzzlePlayer>` owns `useState<TInput>(initialInputFor(puzzleId))`, renders
`<PuzzleComponent value onChange disabled announce />` and a **real**
`<CheckButton onClick={() => submitPuzzle(puzzleId, value)} />` inside the same
subtree. `submitPuzzle` is a context action → `Game.completePuzzle` /
`validatePuzzleInput` → returns a result the screen turns into `<RewardReveal>`
or `<ResultPanel>`. No `Object.assign`, no `createRoot`, no `getElementById`,
no `addCheckButton`.

The 22 existing `*-view.tsx` files already hold their render logic; the refactor
per file is mechanical: swap `{ persistedState }` for `{ value, onChange }`,
delete the trailing `renderPuzzleNN` (createRoot + addCheckButton) export,
export the component itself, register it in the new `puzzleComponents` map.
`initialInputFor` / `demoSolutions` supply the starting value and the
auto-solve/demo path.

**Rationale**: satisfies FR-006, FR-007, SC-005 exactly; controlled-component
pattern is the React norm and is trivially component-testable.

**Special cases**:
- **puzzle-18 (Art Station)** — `legacy/artStationMiniGame.ts` is imperative DOM
  (paint pad + optical preview + coverage bar). Rewrite as `<ArtStationPad>`
  (React, pointer + keyboard paint), with the coverage/optical math extracted to
  `artStationCoverage.ts` (pure, unit-tested — replaces
  `tests/artStationMiniGame.test.ts`).
- **puzzle-06 (Chroma Tree)** — `ChromaTreeExplorer.tsx` is already a React
  component; reused inside both the puzzle and the info modal.
- **puzzle-23** — keeps `puzzle-23-data.ts`; only the view wrapper changes.

---

## R5. Batch migration without breaking `main` (FR-064)

**Decision**: `LegacyPuzzleAdapter.tsx` — a temporary component that, for a
puzzle id not yet in `puzzleComponents`, mounts the **old** `renderPuzzleById`
into a ref'd `<div>` with a shim `PuzzleRenderDeps` (its `addCheckButton`
forwards the `inputFactory` to `<PuzzlePlayer>`'s submit instead of building a
DOM button). Puzzles migrate in station-sized batches (7 batches). The adapter
and the entire `PuzzleRenderDeps` path are deleted in the final legacy-removal
step once the map has all 22.

**Rationale**: every checkpoint has all 22 puzzles playable — migrated ones
natively, the rest through the adapter — so `main` is never broken (FR-064,
FR-063). The adapter is the only net-new "legacy-touching" code and it is
short-lived and covered by SC-004's end-state check.

**Alternatives considered**: migrate all 22 in one PR — rejected (huge, risky,
violates "small and localized" and FR-063/FR-064). Keep legacy puzzle rendering
permanently behind an adapter — rejected (SC-004, SC-005 forbid it).

---

## R6. Screen-by-screen cutover sequence

**Decision**: the shell flips **once, early** (step: "React shell & navigation"),
after which `main.tsx` mounts only `<App>` and never imports `legacyGame`.
Screens are built React-native from that point; there is no half-legacy shell.
The only bridge is the per-puzzle `LegacyPuzzleAdapter` (R5). Order follows
FR-063: shell → state → navigation & Studio → Station/progress → Puzzle lifecycle
→ per-puzzle batches → learning/feedback → collection → Grand Canvas → legacy
removal → design-system pass → tests → build validation → docs.

**Rationale**: `legacyGame.ts` has a single `render()` that owns the whole
`#app`; there is no clean seam to run it half-migrated alongside React screens.
Flipping the shell once (with the puzzle adapter as the safety net) is lower risk
than trying to interleave two orchestrators writing to the same DOM.

**Checkpoint gate** (every phase): `npm run build && npm test && npm run lint`
green; from the shell-flip phase onward, `npm run test:e2e` green too.

---

## R7. MUI reduction — which primitives stay, and how are they skinned?

**Decision**: keep `@mui/material` **Dialog** (focus trap, scroll lock, `aria`
wiring for the info modal), **Menu**/**MenuItem** (the app/options menu — roving
focus, Escape, type-ahead), **Slider** (pointer + keyboard + `aria-valuetext`
for puzzle controls), **Tooltip** (hover/focus intent, non-essential info only).
Wrap each in a `design-system/` component that applies token-based classes and
hides default theming. Remove `@mui/icons-material` (≈5 icons → inline SVG
components). Drop `Container`, `Grid`, `Stack`, `Box`, `Card`, `Chip`,
`Typography`, `Button`, `Checkbox`, `Select`, `FormControl(Label)` in favour of
custom components. Keep a minimal `ThemeProvider` only if a retained primitive
needs it; otherwise remove `muiTheme.ts`.

**Rationale**: matches the clarified FR-048 verbatim (primitives only; identity
is custom). These four are the "behaviour-heavy" ones where re-implementing
correct accessibility is genuinely hard and risky. Everything else is styling MUI
would otherwise dictate.

**Emotion**: retained transitively as MUI's styling engine (the app has **zero**
direct `@emotion/*` imports today, confirmed by grep). App styling is plain CSS +
CSS custom properties + CSS Modules (Vite-native, zero runtime). FR-048's
"Emotion MUST NOT be relied on as the primary styling approach" is satisfied by
construction.

**Alternatives considered**:
- *Remove MUI entirely, hand-roll a dialog/menu/slider* — high a11y risk
  (focus-trap edge cases, slider keyboard semantics), no dependency saving that
  matters, contradicts the clarified decision. Rejected.
- *Adopt Radix / Headless UI / Ark* — swaps one dependency for another with no
  net benefit and a bundle cost. Rejected (SC-014).

---

## R8. Design-token system & visual identity

**Decision**: `design-system/tokens.css` defines CSS custom properties on
`:root` in these groups (FR-041): `--bg-*` (deep midnight studio), `--surface-*`
(layered panels / "glass pigment"), `--text-*`, `--accent-*` (a small vivid set —
not per-element colour), `--station-01..07` (one hue identity per station),
`--state-success` / `--state-failure` / `--state-locked` (each paired with an
icon + label convention, never colour alone — FR-035), `--space-*` (modular
scale), `--radius-*`, `--shadow-*` / `--glow-*`, `--font-display` /
`--font-body`, `--motion-fast/base/slow` + `--ease-*`. A
`@media (prefers-reduced-motion: reduce)` block zeroes durations and a
`[data-reduced-motion]` hook mirrors it for JS-driven effects.

Identity = "Magical Artist's Studio + Colour Laboratory + Indie Game Arcade":
dark atmospheric ground, painterly/geometric CSS-SVG decoration (`StudioBackdrop`
— a *bounded* set of shapes, FR-045), station cards as glowing "puzzle machines /
locations", colourful CTAs, strong `:focus-visible` ring. Explicitly **not** an
MUI demo / dashboard / LMS / CRUD tool / preschool game (FR-043, SC-015).

**Rationale**: tokens-first keeps the system small and consistent across every
screen (FR-041) and makes the reduced-motion + contrast requirements a
single-place concern.

**Alternatives considered**: `vanilla-extract` / `styled-components` / Tailwind —
all add a dependency and/or a build step for something CSS custom properties do
natively. Rejected (SC-014, FR-061).

---

## R9. Typography / self-hosted display font

**Decision**: one open-licence display face for **headings only** (candidates,
all SIL OFL: *Fraunces*, *Clash Display*-alternative, *Bricolage Grotesque*,
*Space Grotesk* — final pick during implementation, chosen for arcade/illustrated
character + legibility). Self-hosted: subsetted WOFF2 (Latin + digits +
punctuation actually used in headings), `@font-face` with `font-display: swap`,
`<link rel="preload" as="font" crossorigin>` in `index.html`, and a real system
fallback stack (`ui-serif, Georgia, …` or `system-ui, …` matching the face).
Body text and **all** controls: `system-ui, -apple-system, Segoe UI, Roboto,
…` with **no** bundled file (FR-046).

**Rationale**: verbatim to the clarified FR-046. Subsetting keeps the file ≈15–35
KB; `swap` + preload keeps it off the first-paint critical path (Principle IV,
SC-013). No third-party CDN (offline-safe, deploy-bundled).

**Alternatives considered**: Google Fonts CDN link (current `muiTheme.ts`
references "Fraunces"/"Space Grotesk" by name, implying a CDN or system
resolution) — rejected by FR-046 (must be self-hosted, not third-party CDN).
System-only for headings — rejected by the clarification (one self-hosted display
font is wanted for identity).

---

## R10. Component-test tooling

**Decision**: add `vitest.config.ts` with two projects — `unit` (node env,
`tests/*.test.ts`, unchanged) and `component` (jsdom env, `tests/component/**`).
Dev deps: `jsdom`, `@testing-library/react`, `@testing-library/jest-dom`,
`@testing-library/user-event`. `npm test` runs both projects; Husky `pre-commit`
picks them up automatically.

**Rationale**: FR-058 needs component coverage; the domain suites must keep their
fast node env. Two-project config is the standard Vitest pattern.

**Alternatives considered**: happy-dom (faster, lighter) — rejected for lower
fidelity on focus-trap / `aria-live` / dialog semantics that FR-036 / FR-053 /
US7 tests assert. Playwright component testing — heavier, overlaps e2e, slower
in `pre-commit`. Rejected.

---

## R11. Playwright suite rewrite

**Decision**: define `contracts/ui-contract.md` first (stable accessible
role + name for every element the tests and AT depend on), then rewrite all four
specs against `getByRole` / `getByRole('…', { name })` — no `.puzzle-item`,
`#hud-score-value`, `.beam-btn[data-beam]`, `.pill.solved` CSS hooks. Add
`mobile-critical-path.spec.ts` at 320px. Keep an **auto-solve journey** action
(FR-022): in the app menu it is dev/test-only (`import.meta.env.DEV` or a
`?e2e=1` flag) and drives `submitPuzzle` with `getDemoSolution` through the same
path a player uses.

Required coverage (FR-057): initial load · Studio rendering · station lock state ·
entering a station · learning flow · puzzle interaction · successful completion ·
unsuccessful attempt · pet collection · progression · persistence across reload ·
reset · Grand Canvas unlock · mobile/responsive critical path.

**Rationale**: FR-057 mandates semantic selectors; the contract file prevents
churn if markup shifts and doubles as the a11y spec.

---

## R12. Persistence compatibility

**Decision**: keep `LOCAL_SAVE_KEY = "ctg:web-progress:v1"` and every current
field (`completedPuzzleIds`, `activeStationId`, `practicePuzzleId`,
`learningProgressByPuzzle`). Add only optional fields: `introSeen?: boolean`
(absent ⇒ first run — FR-030a) and, if needed, `lastRoute?: string`. Extend
`readLocalProgress`'s existing defensive parse for the new fields; never throw.
Load path unchanged: parse → replay `completedPuzzleIds` through the domain →
restore quiz passes + active station + practice target. Corrupt / absent / quota
⇒ fresh game, no overwrite until the player makes progress (preserve the current
`skipNextPersist` guard as a reducer flag). Commit a real `v1` snapshot fixture
(`tests/fixtures/legacy-save-v1.json`) and assert zero-loss restore
(FR-049, SC-003).

**Rationale**: additive-only + tolerant parse = returning players lose nothing
(FR-049–FR-051, Principle III). No version bump needed; a `v2` migration is
out of scope.

**Alternatives considered**: bump to `v2` with a migration shim — unnecessary
complexity for purely additive changes; would risk the exact data-loss the
requirement forbids if the migration has a bug. Rejected.

---

## R13. Performance — re-render & bundle strategy

**Decision**:
- **Split contexts**: `GameStoreContext` (snapshot, changes often) separate from
  `GameActionsContext` (stable function identities) and `SessionContext`.
  Components subscribe only to what they read.
- **Selector hooks**: `useProgress()`, `useStation(id)`, `usePuzzleState(id)` —
  each `useSyncExternalStore` with a memoised selector so a component re-renders
  only when its slice changes.
- `React.memo` on all six screens and on `StationCard` / `PetBadge` /
  `PuzzleListItem` (list items).
- **Lazy puzzle chunks**: `puzzleComponents` entries are `React.lazy(() =>
  import('./puzzle-NN-view'))` behind a `<Suspense>` skeleton — the initial
  bundle carries the shell + design system, not 22 mini-games.
- Measure: record `dist/assets/*.js` gzip size on `main` **before** starting;
  compare at the build-validation checkpoint; assert ≤15% (SC-013) or document
  the overage in the PR.
- CelebrationBurst uses CSS transforms/opacity only, capped particle count,
  `will-change` removed after the animation, fully skipped under reduced motion.

**Rationale**: this is the concrete answer to the Principle IV concern that
motivated the imperative shell — a React tree here is demonstrably cheap when the
store snapshot is stable and puzzle code is code-split.

---

## R14. Accessibility approach

**Decision**: semantic landmarks (`<header>` HUD, `<nav>` for station/screen
nav, `<main>` per screen); every screen has one `<h1>` and receives focus on
route change (focus moves to the heading, announced). Real `<button>` / labelled
inputs everywhere. One app-level polite `aria-live` region (`<LiveRegion>`) that
`announce()` writes to — puzzle results, station unlocks, pet reveals, "cap
reached" (FR-036, US3-5, Edge Cases). MUI `Dialog` for the info modal (trap +
Escape + focus return — FR / US7-3). `:focus-visible` token ring on everything.
Contrast: every token colour pair used for text/state validated ≥ WCAG AA
(document the matrix in `contracts/ui-contract.md`). State never colour-only:
locked = lock icon + "Locked" text; solved = check icon + "Solved"; success /
failure panels carry an icon + heading (FR-035, FR-055, SC-008).
`prefers-reduced-motion`: honoured via the token media block + `useReducedMotion`
for JS effects (FR-047, SC-009).

**Rationale**: first-class requirement (spec, constitution Principle III/UX);
centralising the live region and focus-on-route-change keeps it maintainable.

---

## R15. Responsive approach

**Decision**: mobile-first CSS. Base layout single-column; `clamp()` fluid type
and spacing tokens; station grid `grid-template-columns: repeat(auto-fill,
minmax(min(100%, 16rem), 1fr))`. HUD: a compact bottom bar on narrow viewports
(station + % + pets), expanding to a full top rail with streak + Grand-Canvas
progress ring on wide ones — a **simplification**, not a scale-down (FR-030,
FR-052). Puzzle controls: ≥44px touch targets, no fixed pixel widths, wrap
freely. Any wide content (colour strips, pet grid) scrolls inside its own
`overflow-x:auto` container — never the page body (FR-054, SC-007). Breakpoints
tested: 320 / 768 / 1280. Container queries where supported, media-query
fallback.

**Rationale**: FR-052 forbids a shrunk desktop; per-size intent + fluid tokens
deliver that without a layout framework.

---

## Resolved unknowns summary

| Unknown (Technical Context) | Resolution |
|---|---|
| State library needed? | No — `useSyncExternalStore` + Context + `useReducer` (R1, R3, R13) |
| Routing library needed? | No — hash navigation (R2) |
| DOM env for component tests | jsdom, 4 dev deps, two-project Vitest config (R10) |
| Which MUI primitives stay | Dialog, Menu, Slider, Tooltip; drop `@mui/icons-material` (R7) |
| Font source | one self-hosted subsetted WOFF2 display face, headings only (R9) |
| Bundle-growth risk | code-split puzzles + MUI reduction; measured ≤15% (R13, SC-013) |
| Persistence schema change | additive optional `introSeen`; key unchanged (R12) |
| Keeping `main` playable mid-migration | `LegacyPuzzleAdapter` + shell flips once (R5, R6) |

No `NEEDS CLARIFICATION` markers remain.
