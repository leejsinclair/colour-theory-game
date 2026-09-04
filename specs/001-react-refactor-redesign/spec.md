# Feature Specification: React Architecture Refactor & Visual Redesign

**Feature Branch**: `001-react-refactor-redesign`

**Created**: 2026-09-02

**Status**: Draft

**Input**: User description: "Refactor the existing Chromatic Mastery browser game so that the web application is a properly structured React application and give it a polished, playful, visually distinctive game-arcade design. Preserve all existing gameplay, puzzles, progression, persistence and educational content. Remove the legacy DOM-driven web architecture and establish a clean separation between game/domain logic and React presentation."

## Overview

Chromatic Mastery today runs its browser experience through an imperative DOM
orchestrator (`legacyGame.ts` plus `src/web/legacy/*`) that owns navigation,
rendering, the HUD, modals, the learning gate and puzzle wiring. React is present
only as layout chrome (`AppShell.tsx`) and as small mini-game views mounted into
DOM zones via `createRoot`, bridged back to an out-of-tree "Check" button through
mutable `persistedState` objects and `document.getElementById` lookups.

This feature migrates the browser application to a genuinely React-driven
architecture, removes the legacy DOM orchestration from the active browser flow,
and applies a cohesive "Magical Artist's Studio + Colour Laboratory + Indie Game
Arcade" visual identity. The game's domain layer (`src/game/`, `src/systems/`,
`src/entities/`, `src/puzzles/`), educational content, puzzle mechanics,
progression rules, pet collection, persistence and the CLI are preserved. This is
a frontend architecture and UX transformation, not a gameplay or content rewrite.

## Baseline behaviour to preserve (as observed in the current codebase)

- **7 stations**: Light Laboratory, Value Sketchboard, Color Wheel Table, Optical
  Illusion Wall, Window Landscape, Paint Workbench, Design Studio.
- **22 playable puzzles** (`puzzle-01`–`puzzle-21` plus `puzzle-23`), each with a
  dedicated interactive mini-game. `puzzle-22` remains sprite-only and outside the
  playable set.
- **22 collectible Chromatic Pets**, one rewarded per solved puzzle, with names
  (Glow Sprite, Ink Octopus, …) and sprite rendering.
- **Progression rules** owned by `Game.ts`: sequential puzzle unlock within a
  station, station completion, sequential station unlock, score events (+100
  first solve, +25 pet rescue, +50 station complete, +200 Grand Canvas), streaks
  (current/best), practice mode (+10 per valid replay, capped at +30 per puzzle
  per session), and pet milestone badges (Color Apprentice at 6, Palette Keeper
  at 12, Chromatic Master at all).
- **Learning gate**: for an available, unsolved puzzle with learning content and
  no recorded quiz pass, an intro card + multiple-choice quiz must be completed at
  100% before the puzzle mechanics become playable. No bypass path.
- **Result feedback**: wrong answers route through `diagnose.ts` /
  `failureReasons.ts` to produce a specific, actionable explanation; a failure
  animation plays.
- **Info modal**: per-puzzle learning card fetched from
  `public/puzzle-info/puzzle-NN.md` and rendered as markdown, including the Chroma
  Tree explorer for `puzzle-06`.
- **Grand Canvas finale**: reached when all pets are collected; shows a
  completion certificate (stats, full pet roll, confetti) plus the ability to
  return and freely revisit/practice every station.
- **Persistence**: browser `localStorage` under key `ctg:web-progress:v1` storing
  `completedPuzzleIds`, `activeStationId`, `practicePuzzleId` and
  `learningProgressByPuzzle`. On load, solved puzzles are replayed through the
  domain layer to reconstruct state; a corrupt or absent snapshot loads a fresh
  game without crashing.
- **CLI** (`src/cli.ts`): `help / status / list / solve <id> / auto`, driven by
  the same domain layer and demo solutions.
- **Reset**: clears saved progress and returns to the fresh initial state.
- **Toasts**: transient reward messages for solves, pet unlocks, station
  completion and practice points.

## Clarifications

### Session 2026-09-02

- Q: Should each puzzle open as its own dedicated full screen, or stay rendered as a card within the station screen? → A: Dedicated full puzzle screen — the station screen shows a puzzle list/map; selecting a puzzle navigates to its own screen carrying the learning flow, controls, check action and feedback.
- Q: What should happen to the MUI + Emotion dependency? → A: Reduce — keep MUI only for accessible behaviour-heavy primitives (dialog/focus-trap, menu, slider, tooltip); build all game-identity surfaces (cards, buttons, HUD, Studio, screens) as custom-styled components. MUI must not dictate the visual identity.
- Q: Self-host a display font or use a system-font stack only? → A: Self-host one open-licence display font for headings only (subsetted WOFF2, `font-display: swap`, system fallback stack); body text and controls use a system sans-serif stack.
- Q: Add a first-run narrative moment or open directly into the Studio? → A: Brief skippable intro on first run only — 3–4 existing caretaker lines plus an "Enter the Studio" action; a persistence flag suppresses it on later visits; it remains re-showable from a menu.
- Q: How should planning treat visual direction given no reference image was supplied? → A: No image available — proceed from the written visual direction; treat any reference supplied later as non-binding refinement.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - The full game plays end to end in a React-driven UI (Priority: P1)

A player opens the game, is oriented at the Studio, enters the unlocked station,
passes a puzzle's learning gate, solves the puzzle, sees rewarding feedback and a
pet reveal, progresses through every station, and reaches the Grand Canvas — with
every existing mechanic behaving as it does today, but with the browser UI
lifecycle owned entirely by React. The "Check/Submit" action lives inside the
React puzzle component; no mutable `persistedState` bridge or out-of-tree button
remains.

**Why this priority**: This is the core of the feature and the definition of
done. Without a working end-to-end React-driven playthrough that preserves
gameplay, nothing else matters. It is a viable MVP on its own: the game is fully
playable and correctly architected even before the full visual redesign lands.

**Independent Test**: Play from a fresh start to Grand Canvas (manually and via
the automated journey suite) and confirm every puzzle solves, every pet unlocks,
score/streak/milestones update, persistence survives reload, and reset restores
the initial state — with no legacy DOM orchestrator module loaded by the browser
entrypoint.

**Acceptance Scenarios**:

1. **Given** a fresh load, **When** the app initialises, **Then** the Studio is
   shown, only Light Laboratory is enterable, the HUD shows 0 score / 0 pets /
   0 streak, and no `src/web/legacy/*` or `legacyGame.ts` module is imported by
   the browser entrypoint.
2. **Given** the player is in a station on an unsolved gated puzzle, **When** they
   view it, **Then** the intro card is shown and the puzzle controls and Check
   action are absent until the quiz is passed at 100%.
3. **Given** a passed learning gate, **When** the player sets the correct inputs
   and activates Check inside the puzzle component, **Then** the domain layer
   validates the input, the puzzle is marked solved, the correct score delta is
   applied, the rewarded pet unlocks, and success feedback plus a pet reveal are
   shown.
4. **Given** an incorrect submission, **When** the player activates Check, **Then**
   a specific diagnostic explanation is shown, the puzzle stays unsolved, the
   streak resets, and the player can retry.
5. **Given** all puzzles in a station are solved, **When** the last one is
   checked, **Then** the station is marked complete, the station-complete bonus
   applies, the next station unlocks, and a clear next-step call to action is
   offered.
6. **Given** every pet is collected, **When** the final puzzle is solved, **Then**
   the Grand Canvas finale is presented with the completion certificate and the
   +200 bonus is applied once.
7. **Given** existing saved progress under `ctg:web-progress:v1`, **When** the
   updated app loads, **Then** all previously solved puzzles, quiz passes and the
   active-station context are restored with zero loss.
8. **Given** the player triggers Reset, **When** it completes, **Then** saved
   progress is cleared and the game returns to the fresh initial state (learning
   gates re-armed, only Light Laboratory unlocked).

---

### User Story 2 - The Studio is a game hub that tells me what to do next (Priority: P2)

A player arrives at the Studio and within seconds understands the game premise,
their overall progress, which stations are available / locked / completed, which
pets they have collected, and what the single recommended next activity is.
Stations are presented as visually distinctive "locations in a game world" cards,
not plain buttons.

**Why this priority**: The Studio is the primary orientation surface and the
biggest UX weakness of the current two-panel prototype. It delivers immediate,
visible value once the P1 architecture exists.

**Independent Test**: Load the Studio at several progress states (fresh,
mid-game, all-complete) and confirm each station card communicates its identity,
description, puzzle count, progress and lock state; the HUD summarises overall
progress; and a "recommended next" affordance points to the correct station or
puzzle.

**Acceptance Scenarios**:

1. **Given** a fresh player, **When** the Studio loads, **Then** the game title,
   a short premise line, overall completion, the pet collection summary, and a
   prominent "start here → Light Laboratory" recommendation are visible.
2. **Given** a mid-game player, **When** the Studio loads, **Then** completed
   stations, the in-progress station and locked stations are each visually
   distinct, and the recommended next activity is the earliest unlocked,
   incomplete station or its next unsolved puzzle.
3. **Given** any station card, **When** the player inspects it, **Then** it shows
   a title, short description, a station colour theme, puzzle count, a progress
   indicator, and an Enter/Continue action (disabled with a clear locked
   treatment when locked).
4. **Given** a locked station, **When** the player attempts to enter it, **Then**
   entry is prevented and the reason (previous stations incomplete) is
   communicated by more than colour alone.

---

### User Story 3 - Each puzzle is a self-contained React experience with a clear learning flow (Priority: P2)

A player working a puzzle moves through a coherent flow — what am I learning →
learn/experiment → solve → check → feedback → reward → continue — rendered as one
React experience. Controls, the Check action, the learning card, the diagnostic
feedback and the reward all belong to the puzzle's component tree. Game rules stay
in the domain layer.

**Why this priority**: The puzzle experience is the most important part of the
product and the site of the worst architectural debt (React/DOM/mutable-bridge
split). Fixing it is high value but depends on the P1 shell.

**Independent Test**: For a representative sample across all 7 stations, drive
each puzzle's learning gate, interact with its controls via keyboard and pointer,
submit a wrong answer (verify specific feedback), submit the correct answer
(verify reward), and confirm no DOM querying or module-level mutable UI state is
used to move data between the controls and the submit action.

**Acceptance Scenarios**:

1. **Given** any puzzle, **When** it renders, **Then** its controls, Check
   action and feedback panel are within a single React subtree and share state
   through React state/context, not a mutable plain object or DOM lookups.
2. **Given** the learning stage, **When** the player reads the intro and takes
   the quiz, **Then** the content is the existing learning copy, is fully
   readable, and passing at 100% unlocks the solve stage and records the quiz
   pass in persistence.
3. **Given** a solved puzzle, **When** the player chooses Practice, **Then** the
   puzzle becomes replayable, valid replays award capped practice points, and the
   solved state is unaffected.
4. **Given** a puzzle with special apparatus (e.g. the Art Station paint pad, the
   Chroma Tree explorer), **When** it renders, **Then** that apparatus works as
   it does today within the React experience.
5. **Given** a screen-reader user, **When** a puzzle result is produced, **Then**
   the outcome (success or the specific failure reason) is announced.

---

### User Story 4 - Success feels rewarding and failure is instructive (Priority: P2)

On a correct solve the player gets a satisfying, brief moment of celebration — a
colour burst / sparkle, a progress update, an encouraging message and the pet
reveal. On an incorrect attempt the player gets a calm, specific explanation of
what went wrong, which principle to reconsider, and what to try next — never a
bare "incorrect".

**Why this priority**: This is the emotional core of a puzzle game's feedback
loop and is largely content that already exists; presenting it well is high
leverage. Depends on P1/P3 puzzle rendering.

**Independent Test**: Trigger success and failure on several puzzles and confirm
the celebration is brief and non-blocking, the failure explanation is specific
and actionable, both respect `prefers-reduced-motion`, and both are conveyed by
more than colour.

**Acceptance Scenarios**:

1. **Given** a correct solve, **When** feedback plays, **Then** a short
   celebration and pet reveal occur, the HUD/progress update, and interaction is
   not blocked for more than a moment.
2. **Given** `prefers-reduced-motion: reduce`, **When** feedback plays, **Then**
   motion-heavy effects are replaced with a static equivalent that still
   communicates success/failure.
3. **Given** an incorrect attempt, **When** feedback shows, **Then** it names the
   specific issue and the colour-theory principle to reconsider, using the
   existing diagnostic content.
4. **Given** any feedback state, **When** shown, **Then** state is not signalled
   by colour alone (icon, text or shape also present).

---

### User Story 5 - The Chromatic Pet collection feels like an achievement (Priority: P3)

A player can view their pet collection as a rewarding, game-like gallery. Locked
pets appear as intriguing silhouettes; unlocked pets show personality, a name,
and the puzzle/station they came from. Hover/focus states are strong. It is not a
database list.

**Why this priority**: Adds personality and a collection goal, but the game is
fully playable without a dedicated collection screen (a summary already lives in
the HUD).

**Independent Test**: Open the collection at several progress states and confirm
locked vs unlocked treatment, names, source attribution, keyboard focus states,
and that a single reusable pet component is used everywhere pets appear.

**Acceptance Scenarios**:

1. **Given** an uncollected pet, **When** the collection renders, **Then** it
   shows as a silhouette/locked state without revealing the full design, and is
   labelled as not yet collected.
2. **Given** a collected pet, **When** viewed, **Then** its name, artwork and
   originating puzzle/station are shown.
3. **Given** keyboard navigation, **When** the player tabs through pets, **Then**
   each has a visible focus state and an accessible label.
4. **Given** pets shown in the HUD, the collection and the Grand Canvas, **When**
   compared, **Then** they use one shared pet presentation component.

---

### User Story 6 - The Grand Canvas is a distinctive finale (Priority: P3)

A player who completes the game reaches a finale screen that feels like a genuine
reward — visually significant and clearly different from an ordinary puzzle
screen, while still part of the same design system. Its existing content (stats,
full pet roll, return/practice actions, saved-progress reassurance) is preserved.

**Why this priority**: A strong payoff matters for the experience, but only a
small fraction of players reach it and its current certificate already functions.

**Independent Test**: Complete the game (or inject a completed save) and confirm
the finale shows the preserved stats and pet roll, offers return + review/practice
actions, is visually distinct from puzzle screens, and respects reduced motion.

**Acceptance Scenarios**:

1. **Given** all pets collected, **When** the finale renders, **Then** puzzles
   solved, pets rescued and best streak are shown alongside the full pet roll.
2. **Given** the finale, **When** the player chooses Return, **Then** they land
   back in the Studio with every station unlocked for free revisiting and
   practice.
3. **Given** `prefers-reduced-motion`, **When** the finale renders, **Then**
   celebratory motion is reduced to a static treatment.

---

### User Story 7 - The game works and is accessible on any device (Priority: P2)

A player on a phone, tablet, laptop or desktop gets a layout designed for that
size — navigation collapses appropriately, station cards stack, puzzle controls
stay usable with touch and keyboard, feedback stays visible, and the HUD
simplifies. All interactive elements are reachable and operable by keyboard and
screen reader.

**Why this priority**: A meaningful share of players are on mobile, and
accessibility is a stated first-class requirement and a project principle. It is
cross-cutting but must be verifiable as its own slice.

**Independent Test**: Exercise the primary journeys at ~320px, tablet and desktop
widths, keyboard-only, and with a screen reader, confirming no horizontal
scroll on body, adequate touch targets, visible focus throughout, and correct
semantics for buttons/controls/dialogs.

**Acceptance Scenarios**:

1. **Given** a ~320px viewport, **When** any primary screen renders, **Then**
   content stacks readably with no horizontal page scroll and touch targets meet
   a minimum comfortable size.
2. **Given** keyboard-only navigation, **When** the player moves through Studio →
   station → learning gate → puzzle → feedback → next, **Then** every step is
   reachable and operable with a visible focus indicator.
3. **Given** a dialog (info modal), **When** it opens, **Then** focus is trapped,
   Escape closes it, and focus returns to the trigger.
4. **Given** text and UI states, **When** measured, **Then** contrast meets
   WCAG AA and no state relies on colour alone.

---

### Edge Cases

- **Corrupt or partial save snapshot**: the app loads a fresh game without
  crashing and does not overwrite the corrupt data until the player makes
  progress.
- **`localStorage` unavailable** (private mode / quota): gameplay continues for
  the session; progress simply is not persisted; no errors surface to the player.
- **Deep link / direct navigation to a locked station or puzzle**: the player is
  routed to the Studio (or shown the locked state) rather than into a locked
  puzzle.
- **Returning player who already unlocked the Grand Canvas**: lands in the finale
  or an all-unlocked Studio, consistent with today's behaviour.
- **Player passes a quiz but reloads before solving**: the quiz pass is restored
  and the puzzle is immediately playable (no re-gate).
- **Reduced-motion preference toggled**: all celebratory/transition animation
  degrades to static equivalents.
- **Practice on a solved puzzle after the per-puzzle practice cap is reached**:
  streak still increments, no additional points, and a "cap reached" message is
  shown.
- **Very fast repeated Check clicks**: submission is idempotent — no double score,
  no duplicated pet.
- **A station completed out of expected order via restored save**: unlock logic
  reconstructs correctly from replayed solves.
- **Screen-reader user submitting a puzzle**: the result is announced via a live
  region.

## Requirements *(mandatory)*

### Functional Requirements

#### Architecture & migration

- **FR-001**: The browser application MUST be driven by a React component tree
  that owns the full UI lifecycle: application shell, navigation, Studio, station
  view, puzzle presentation, learning cards, HUD, dialogs, feedback, collection
  and Grand Canvas.
- **FR-002**: The legacy imperative DOM orchestrator (`src/web/legacyGame.ts`)
  MUST NOT be responsible for orchestrating the browser UI and MUST NOT be loaded
  by the browser entrypoint after migration.
- **FR-003**: Responsibilities currently in `src/web/legacy/*` (info modal,
  learning flow, result feedback, art-station mini-game), DOM event handlers,
  module-level mutable UI state, `persistedState` bridges and out-of-tree button
  wiring MUST be migrated into React components/state, then the superseded legacy
  modules and any dead code they leave behind MUST be removed once references and
  tests confirm they are unused.
- **FR-004**: The static gameplay DOM skeleton in `index.html` and DOM-id / custom
  DOM-event (`ctg:ready`) coupling between the shell and the game MUST be replaced
  by React composition and props/context.
- **FR-005**: Game rules, colour-theory calculations, puzzle validation,
  progression, scoring and persistence implementation MUST remain in the domain
  layer (`src/game/`, `src/systems/`, `src/entities/`, `src/puzzles/`,
  `src/web/puzzleValidation.ts` and equivalents) and MUST NOT be reimplemented in
  React components.
- **FR-006**: Each puzzle's interactive controls, Check/Submit action and result
  feedback MUST live within a single React subtree and communicate via React
  state/context — not via mutable module-level variables or DOM queries.
- **FR-007**: Puzzle completion MUST be communicated from the puzzle component to
  application state through an explicit callback/event/interface; the component
  MUST NOT mutate domain objects directly to signal completion.
- **FR-008**: Shared client-side application state (current view, active station,
  practice target, game instance, modal control) MUST use standard React
  mechanisms (`useState`/`useReducer`/context). A state-management library MUST
  NOT be added unless the design demonstrates a concrete need that React
  primitives cannot meet; if added it MUST be lightweight and justified.
- **FR-009**: The application MUST NOT be a single monolithic `App.tsx`; it MUST
  be composed of focused components with clear responsibilities, avoiding deeply
  nested conditional JSX.

#### Gameplay preservation

- **FR-010**: All 7 stations MUST remain available with their existing names,
  ordering, puzzles and unlock relationships.
- **FR-011**: All 22 currently playable puzzles MUST remain available with their
  existing mechanics, inputs, validation and demo solutions unchanged.
- **FR-012**: All 22 Chromatic Pets MUST remain collectible, one per solved
  puzzle, with existing names and reward mapping.
- **FR-013**: Progression MUST be preserved: sequential puzzle unlock within a
  station, station completion, sequential station unlock, and Grand Canvas
  unlock when all pets are collected.
- **FR-014**: Scoring MUST be preserved exactly: +100 first solve, +25 pet
  rescue, +50 station complete, +200 Grand Canvas (once), practice +10 per valid
  replay capped at +30 per puzzle per session, and current/best streak tracking.
- **FR-015**: Pet milestone badges MUST be preserved at their existing thresholds
  (6, 12, and all pets).
- **FR-016**: The learning gate MUST remain mandatory for every puzzle that has
  learning content: intro card + quiz passed at 100% before the puzzle mechanics
  are playable, with no bypass path.
- **FR-017**: Wrong-answer feedback MUST continue to route through the existing
  diagnostic content to give a specific, actionable explanation rather than a
  generic failure state.
- **FR-018**: The per-puzzle info modal MUST continue to present the existing
  markdown learning cards, including the Chroma Tree explorer for `puzzle-06`.
- **FR-019**: Practice mode for solved puzzles MUST be preserved, including the
  practice-cap message and streak behaviour.
- **FR-020**: The Grand Canvas finale MUST preserve its existing content: puzzles
  solved, pets rescued, best streak, the full pet roll, and return +
  review/practice actions, plus free revisiting of all stations afterwards.
- **FR-021**: Reset MUST clear saved progress and return the game to the fresh
  initial state with learning gates re-armed and only Light Laboratory unlocked.
- **FR-022**: The "auto-solve journey" affordance MUST remain available (it backs
  automated testing and the demo path).
- **FR-023**: The CLI (`src/cli.ts`: `help / status / list / solve <id> / auto`)
  MUST remain fully functional and MUST continue to share the domain layer with
  the web app.

#### Navigation

- **FR-024**: Navigation between Studio, station, puzzle, collection and Grand
  Canvas MUST be predictable, keyboard accessible, and implemented with React
  navigation/state patterns rather than DOM manipulation. Studio, Station and
  Puzzle MUST be distinct screens: the Station screen presents a puzzle
  list/map, and selecting a puzzle navigates to a dedicated Puzzle screen that
  carries that puzzle's learning flow, controls, check action and feedback.
- **FR-025**: Top-level screens SHOULD be deep-link addressable (e.g. via URL
  hash) so a screen can be reloaded or shared; full query-parameter/history
  routing and a routing-library dependency are NOT required.
- **FR-026**: Navigating to a locked or unavailable destination MUST resolve
  gracefully to the Studio or an explicit locked state, never into a locked
  puzzle.
- **FR-027**: A player inside a station MUST be able to return to the Studio and,
  when a station is complete, advance directly to the next station.

#### Studio & HUD

- **FR-028**: The Studio MUST communicate, on load: game title, a short premise,
  overall completion, available / locked / completed stations, the collected-pet
  summary, and a single recommended next activity.
- **FR-029**: Stations MUST be presented as visually distinctive cards with a
  title, short description, station colour theme, puzzle count, progress
  indicator, lock/complete state, and an Enter/Continue action.
- **FR-030**: A persistent HUD MUST summarise current station, overall
  completion, pets collected, current streak (where applicable) and progress
  toward the Grand Canvas, understandable at a glance, and MUST simplify (not
  merely shrink) on small screens.
- **FR-030a**: On a player's first run the app MUST show a brief, skippable
  narrative intro (3–4 lines of the existing caretaker framing plus an "Enter the
  Studio" action). A persisted flag MUST suppress it on subsequent visits, and it
  MUST remain re-viewable from a menu. The flag MUST be additive and backward-safe
  (absence = treat as first run) and MUST NOT affect gameplay progression.

#### Learning & feedback experience

- **FR-031**: Each puzzle MUST present a coherent flow: what are we learning →
  learn/experiment → solve → check → feedback → reward → continue, using the
  existing learning content and quizzes.
- **FR-032**: Learning content MUST remain fully readable and MUST NOT be
  visually degraded by decorative styling; educational clarity takes precedence.
- **FR-033**: A correct solve MUST produce a brief, non-blocking celebration
  (colour burst / sparkle), a progress update, an encouraging message and a pet
  reveal.
- **FR-034**: An incorrect attempt MUST produce a calm, specific explanation of
  what went wrong and which principle to reconsider, and MUST leave the puzzle
  retryable.
- **FR-035**: All success/failure and lock/complete states MUST be conveyed by
  more than colour (text, icon or shape as well).
- **FR-036**: Puzzle result outcomes MUST be announced to assistive technology
  via a live region.
- **FR-037**: No audio MUST be added; the feedback architecture MAY be structured
  to allow sound later but MUST NOT ship audio in this feature.

#### Collection & finale

- **FR-038**: A reusable pet presentation component MUST support locked
  (silhouette) and unlocked states, hover/focus states, the pet name, and the
  associated puzzle/station, and MUST be used wherever pets appear.
- **FR-039**: The collection view MUST present pets as a game-like gallery, with
  locked pets shown as silhouettes that do not reveal the full design.
- **FR-040**: The Grand Canvas finale MUST be visually distinct from an ordinary
  puzzle screen while remaining within the same design system.

#### Visual design system

- **FR-041**: The application MUST define a small, coherent set of design tokens
  covering background, surface and text colours, accent colours, per-station
  colours, success/failure colours, spacing, border radius, shadows/glows,
  typography and animation timing, applied consistently across all screens.
- **FR-042**: The visual identity MUST express "Magical Artist's Studio + Colour
  Laboratory + Indie Game Arcade" — dark atmospheric studio background, vivid
  intentional colour accents, large expressive but readable headings, playful
  geometric/painterly decoration, cohesive selectable cards, colourful
  call-to-action buttons, and strong hover/focus states.
- **FR-043**: The result MUST NOT look like a default Material UI demo, an
  enterprise dashboard, a generic "SaaS" template, an LMS, a CRUD tool or a
  preschool game; a reviewer looking at the Studio MUST immediately recognise it
  as a colour game.
- **FR-044**: Colour MUST be used as information and hierarchy, not indiscriminate
  decoration; strong contrast and a clear visual hierarchy MUST be maintained.
- **FR-045**: Decorative visuals MUST be implemented primarily with CSS/SVG or
  generated shapes; a large image/asset pipeline MUST NOT be introduced unless
  existing assets justify it, and the number of decorative elements MUST stay
  maintainable.
- **FR-046**: One open-licence display font MUST be self-hosted (bundled with the
  deploy, not fetched from a third-party CDN) and used for major headings only,
  subsetted, served as WOFF2 with `font-display: swap` and a real system fallback
  stack. Body text and interactive controls MUST use a system sans-serif stack
  with no bundled font file. The heading font MUST be licence-cleared for web
  embedding and MUST NOT block first paint.
- **FR-047**: Animation MUST be used only to reinforce feedback and navigation
  (station unlock, pet reveal, puzzle completion, progress change, hover, modal
  and screen transitions), MUST NOT block interaction or run constantly, and MUST
  respect `prefers-reduced-motion: reduce`.
- **FR-048**: MUI/Emotion MUST be reduced to a supporting role: it MAY be used
  only for accessible, behaviour-heavy primitives (dialog with focus trap, menu,
  slider, tooltip and related focus utilities). All game-identity surfaces —
  cards, buttons, HUD, Studio, station and puzzle screens, collection, finale —
  MUST be custom-styled components. Default MUI styling MUST NOT dictate the
  visual identity, and Emotion MUST NOT be relied on as the primary styling
  approach for game-identity components.

#### Persistence

- **FR-049**: Existing saved progress under `ctg:web-progress:v1` MUST remain
  readable, and a returning player MUST NOT lose solved puzzles, quiz passes or
  collected pets as a result of this feature.
- **FR-050**: Any persistence schema change MUST be additive and backward-safe;
  new fields MUST be optional with safe defaults, and the app MUST tolerate old
  snapshots.
- **FR-051**: A corrupt, partial or absent snapshot MUST load a fresh game
  without crashing; storage failures MUST NOT surface errors to the player or
  block gameplay.

#### Responsiveness & accessibility

- **FR-052**: The application MUST provide layouts designed for mobile, tablet,
  laptop and desktop — not a shrunk desktop layout — with navigation collapsing,
  station cards stacking, puzzle controls remaining usable by touch, and feedback
  remaining visible.
- **FR-053**: All primary journeys MUST be fully operable by keyboard with a
  visible focus indicator on every interactive element, and MUST use semantic
  HTML (real buttons, labelled form controls, accessible dialogs).
- **FR-054**: No primary screen MUST cause horizontal scrolling of the page body;
  wide content MUST scroll within its own container.
- **FR-055**: Text and UI-state contrast MUST meet WCAG AA.

#### Testing, quality & documentation

- **FR-056**: Existing unit tests (`tests/*.test.ts`) MUST continue to pass, with
  domain/validation coverage preserved or improved.
- **FR-057**: The Playwright end-to-end suite MUST be updated to the new UI using
  semantic/role-based selectors rather than CSS-implementation details, and MUST
  cover: initial load, Studio rendering, station lock state, entering a station,
  the learning flow, puzzle interaction, successful completion, unsuccessful
  attempt, pet collection, progression, persistence across reload, reset, Grand
  Canvas unlock, and a mobile/responsive critical path.
- **FR-058**: Component/interaction tests MUST be added where they provide
  meaningful coverage of the new React puzzle lifecycle and shared components.
- **FR-059**: `npm run build` (typecheck), `npm run build:web` (production
  build), and `npm run lint` MUST all succeed; strict TypeScript MUST be
  maintained with no new `any` or unchecked assertions lacking justification.
- **FR-060**: Architecture documentation (`game-architecture.md` and related
  docs) MUST be updated to describe the new React architecture and to remove
  guidance describing the retired legacy model.
- **FR-061**: No unnecessary runtime dependencies MUST be introduced; additions
  MUST be justified against a concrete need.
- **FR-062**: The Vite production base path (`/colour-theory-game/`) and the
  GitHub Pages build/deploy workflows MUST continue to work.

#### Migration approach

- **FR-063**: Migration MUST be incremental and each step independently testable
  where practical, following the sequence: baseline behaviour → React shell →
  shared state/context boundaries → navigation & Studio → station/progress UI →
  puzzle lifecycle → per-puzzle views → learning/feedback → pet collection →
  Grand Canvas → legacy removal → design-system application → tests → production
  build validation → documentation.
- **FR-064**: At no point in the migration MUST the game become unplayable end to
  end on `main`; partially migrated states MUST still deliver a working
  playthrough.

### Key Entities *(include if feature involves data)*

- **Station**: A location in the game world grouping puzzles. Attributes: id,
  name, colour theme, ordered puzzle list, unlocked state, completed state,
  solved count.
- **Puzzle**: An interactive mini-game teaching one colour-theory principle.
  Attributes: id, station, title, objective/description, type, input shape,
  validator (domain-owned), reward pet, state (locked/available/solved),
  associated learning content and demo solution.
- **Chromatic Pet**: A collectible rewarded for solving a puzzle. Attributes: id,
  name, sprite/personality, originating puzzle/station, collected state.
- **Player Progress / Save Snapshot**: Persisted state under `ctg:web-progress:v1`
  — completed puzzle ids, active station, practice target, per-puzzle learning
  (quiz) progress. Reconstructs domain state on load by replaying solves.
- **Learning Content**: Per-puzzle intro card copy, illustration reference, quiz
  questions/answers, and the detailed markdown info card.
- **Score Event**: A domain result of an attempt — delta and reason string —
  covering first solve, pet rescue, station complete, Grand Canvas and practice.
- **Design Token Set**: The named colour, spacing, radius, shadow/glow,
  typography and animation-timing values that define the visual system.
- **Application View**: A top-level screen (first-run Intro, Studio, Station,
  Puzzle, Collection, Grand Canvas) plus transient overlays (info modal),
  addressable for deep linking. Station and Puzzle are distinct screens.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A player can complete the entire journey from a fresh start to the
  Grand Canvas — every one of the 22 playable puzzles solved and every one of the
  22 pets collected — without encountering a broken, blank or unresponsive
  screen.
- **SC-002**: 100% of the stations, playable puzzles, pets, progression rules,
  scoring values, streak behaviour and milestone badges present before the
  feature remain present and behave identically after it.
- **SC-003**: A returning player with existing saved progress loses zero solved
  puzzles, zero quiz passes and zero collected pets when the updated app loads.
- **SC-004**: The browser entrypoint loads zero modules from `src/web/legacy/`
  and does not load `legacyGame.ts`; a repository search confirms no remaining
  browser-flow references to the retired legacy orchestration.
- **SC-005**: No puzzle relies on a mutable module-level UI variable, a
  `persistedState` bridge object, or a DOM query to move data between its
  controls and its submit action.
- **SC-006**: Every primary journey step (Studio → station → learning gate →
  puzzle → feedback → next station → Grand Canvas) is completable using only the
  keyboard, with a visible focus indicator at every step.
- **SC-007**: All primary screens render without horizontal page-body scrolling
  at 320px, tablet and desktop widths, and interactive controls remain operable
  by touch.
- **SC-008**: Text and interactive-state contrast meet WCAG AA, and every
  success/failure/lock/complete state is distinguishable without colour.
- **SC-009**: With `prefers-reduced-motion: reduce`, no screen plays looping or
  interaction-blocking animation; celebratory effects have a static equivalent.
- **SC-010**: A first-time player can identify the recommended next activity from
  the Studio within 10 seconds.
- **SC-011**: The existing unit and (updated) end-to-end suites pass, and the
  end-to-end suite covers every critical path listed in FR-057.
- **SC-012**: `npm run build`, `npm run build:web` and `npm run lint` all pass
  with no new type errors and no new lint violations.
- **SC-013**: The production bundle size does not increase by more than 15%
  relative to the pre-feature baseline (or any regression beyond that is
  explicitly justified in the plan).
- **SC-014**: The number of net-new runtime dependencies is 0 unless each
  addition is individually justified against a concrete need in the plan.
- **SC-015**: In an informal review, evaluators shown only the Studio screen
  identify the product as a colour/art game (not a dashboard, LMS or generic
  template) without prompting.
- **SC-016**: `game-architecture.md` describes the React architecture as shipped
  and contains no guidance that still presents the retired legacy model as
  current.

## Assumptions

- No binary visual-reference image was attached to this request; the visual
  direction is taken from the written description and judged against the identity
  criteria in FR-042/FR-043. A reference image supplied later is a non-binding
  refinement and does not override the functional and accessibility constraints
  here.
- "All puzzles / stations / pets" refers to the currently playable set observed
  in the codebase: 7 stations, 22 playable puzzles (`puzzle-01`–`21` + `23`), and
  22 collectible pets. `puzzle-22` is sprite-only and stays outside the playable
  set.
- The "Grand Canvas" today is the final completion-certificate scene reached when
  all pets are collected; "preserve its functionality" means preserving that
  reward moment (stats, pet roll, return/practice, free revisiting) with a
  stronger visual treatment — not adding a new painting mechanic.
- Deep linking to top-level screens may be implemented with a URL hash and simple
  state mapping; adding a routing library is out of scope unless planning shows a
  concrete need.
- MUI/Emotion is retained only as an accessible-primitives layer (see FR-048);
  the visual identity comes from custom-styled components. Which specific
  primitives stay is a planning detail.
- The `localStorage` key `ctg:web-progress:v1` and its current fields remain
  supported; any additions (e.g. the first-run intro-seen flag, a reduced-motion
  or last-view hint) are optional and backward-safe.
- Existing player-facing copy, learning content, quizzes and `public/puzzle-info`
  markdown are reused as-is unless a specific defect is found.
- Target platforms are current evergreen desktop and mobile browsers; no legacy
  browser support is required.
- Deployment remains GitHub Pages at the `/colour-theory-game/` base path via the
  existing workflows.
- No audio is added in this feature.
- The CLI is retained; there is no compelling reason to remove it and it shares
  the preserved domain layer.
- Husky `pre-commit` (lint + unit) and `pre-push` (e2e) gates remain in force.

## Out of Scope / Non-Goals

- Authentication, a backend, a database, multiplayer, analytics, advertisements
  or social accounts.
- A new game engine or state-management infrastructure beyond a justified
  lightweight need.
- Redesigning the underlying colour theory, puzzle mechanics or educational
  content.
- Rewriting domain classes purely for modernisation.
- Adding new puzzles, stations, pets or a literal Grand Canvas painting mode.
- Removing the CLI.
