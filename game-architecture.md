# Chromatic Mastery Game Architecture

This document describes how the codebase is structured at runtime and where core responsibilities live.
It is architecture-focused and intentionally avoids duplicating coding policy and completion checklists.

For coding standards and done criteria, use:
- [AGENTS.md](AGENTS.md)
- [.github/copilot-instructions.md](.github/copilot-instructions.md)
- [.github/instructions/coding-standards.instructions.md](.github/instructions/coding-standards.instructions.md)
- [.github/instructions/completion-criteria.instructions.md](.github/instructions/completion-criteria.instructions.md)
- [EPCC.md](EPCC.md)

## High-Level Runtime Model

The project supports two runtime surfaces:
- CLI mode for terminal gameplay and diagnostics.
- Web mode for interactive puzzle UX.

Both modes share the same core domain and progression logic.

## Top-Level Code Areas

- [src/game](src/game): game orchestration and scene flow.
- [src/systems](src/systems): managers for puzzles, pets, stations, color, and persistence.
- [src/entities](src/entities): domain entities and state containers.
- [src/puzzles](src/puzzles): puzzle logic classes used by core game flows.
- [src/web](src/web): browser shell, puzzle rendering, and UI behaviors.
- [src/content](src/content): puzzle learning content and demo solutions.
- [src/types](src/types): shared type definitions.

## Core Domain Layer

The core domain layer is the source of truth for progression and rewards.

Primary modules:
- [src/game/Game.ts](src/game/Game.ts): coordinates puzzle completion, rewards, streaks, and unlock flow.
- [src/systems/PuzzleManager.ts](src/systems/PuzzleManager.ts): puzzle lookup and solved-state management.
- [src/systems/PetManager.ts](src/systems/PetManager.ts): pet unlock state and collection data.
- [src/systems/StationManager.ts](src/systems/StationManager.ts): station metadata and completion status.
- [src/systems/SaveSystem.ts](src/systems/SaveSystem.ts): serialization and load/restore behavior.
- [src/systems/ColorEngine.ts](src/systems/ColorEngine.ts): color calculation helpers.

## Web Application Layer

Web UI is split into shell, controls, and puzzle-specific interactions.

Key files:
- [src/web/AppShell.tsx](src/web/AppShell.tsx): application shell and layout containers.
- [src/web/main.tsx](src/web/main.tsx): web bootstrap entry.
- [src/web/legacyGame.ts](src/web/legacyGame.ts): DOM-driven puzzle flow and progression wiring; orchestrates the modules below.
- [src/web/puzzles](src/web/puzzles): per-puzzle logic and view implementations.
- [src/web/puzzleContent.ts](src/web/puzzleContent.ts): puzzle objective text and legacy concept descriptions.
- [src/web/puzzleValidation.ts](src/web/puzzleValidation.ts): shared input-validation helpers (hue distance, shuffle, validate).
- [src/web/localProgress.ts](src/web/localProgress.ts): localStorage read/write for save snapshots.
- [src/web/petSprites.ts](src/web/petSprites.ts): pet ID lists, display names, and sprite builder.

Puzzle modules are intentionally isolated. Add puzzle-specific behavior in the matching file pair inside [src/web/puzzles](src/web/puzzles) when possible.

### Legacy UI Modules (`src/web/legacy/`)

Focused sub-modules extracted from `legacyGame.ts` for clarity and testability:

| File | Responsibility |
|---|---|
| [infoModal.ts](src/web/legacy/infoModal.ts) | Info modal lifecycle: open, close, markdown fetch, Chroma Tree explorer |
| [learningFlow.ts](src/web/legacy/learningFlow.ts) | Learning gate: intro card, quiz rendering, quiz evaluation |
| [resultFeedback.ts](src/web/legacy/resultFeedback.ts) | Result Analysis panel: show/clear failure reasons, fail animation |
| [artStationMiniGame.ts](src/web/legacy/artStationMiniGame.ts) | Art Station (puzzle-18) paint pad, optical preview, and coverage bar |

When extending the legacy UI, prefer adding new functionality to an existing legacy module or creating a new one rather than growing `legacyGame.ts` directly.

## Content and Learning Layer

Learning copy, quiz questions, and explanatory metadata live in content modules:
- [src/content/puzzleLearningContent.ts](src/content/puzzleLearningContent.ts)
- [src/content/gameContent.ts](src/content/gameContent.ts)
- [src/content/demoSolutions.ts](src/content/demoSolutions.ts)

Detailed per-puzzle markdown references are in:
- [public/puzzle-info](public/puzzle-info)

## Validation and Testing Architecture

Testing is divided by scope:
- Unit tests: [tests/game.test.ts](tests/game.test.ts)
- End-to-end browser flows: [tests/e2e](tests/e2e)

Standard validation commands:
- npm run build
- npm test
- npm run lint
- npm run test:e2e for UI/user-journey changes

## State Management

The project uses a deliberate two-layer state model.  No external state-management library is installed because neither layer benefits from one at the current scale.

### Layer 1 — Domain state (`Game` class and systems)

`src/game/Game.ts` is the single source of truth for progression: puzzles solved, pets collected, score, streaks, and station unlock status.  This state is managed through a clean OOP class hierarchy and is shared with both the CLI and web surfaces.  Redux-style actions and reducers, or a Zustand store, would add indirection with no benefit here.

### Layer 2 — Web shell state (`legacyGame.ts` session variables)

The web shell maintains a small number of UI-navigation variables (the active station, practice mode puzzle, selected art colour, etc.).  These are declared as module-level `let` variables and grouped under the **Mutable session state** comment block near the top of the file.  All of them are reset in a single `resetSessionState()` call from `initializeGame()`.

A state-management library is not appropriate for this layer either:
- Only `legacyGame.ts` reads or writes these variables — there is no cross-component sharing problem.
- The `Game` class is still the domain authority; the session variables are transient UI overlays.
- The variable count is small (seven).

### The `persistedState` bridge (puzzle views)

Puzzle React components (e.g. `puzzle-01-view.tsx`) use a `persistedState` object pattern: the component holds a local `useState` copy for rendering and writes back to a shared plain object on every state change.  The DOM-side Check button reads that object via an `inputFactory` callback.

This pattern exists because the Check button lives outside the React component tree.  It is the **most natural seam** to address if the shell is ever ported to React: move the Check button inside the puzzle component, remove the mutation, and use normal React state or React Context.

### When to add a state-management library

If the shell (`legacyGame.ts`) is converted to a full React component tree, standard React patterns become appropriate:
- Use **React Context** to share `openInfoModal`, `game`, and navigation helpers across components.
- Use **Zustand** (lightweight, no boilerplate) if cross-component puzzle state needs to be read outside the component that owns it.
- Avoid Redux unless the team is already familiar with it — it would be over-engineered for this codebase.

Until the shell is React-based, introducing a store would add a dependency without removing any real complexity.



- Keep game-rule decisions in the domain/systems layer, not inside presentational UI components.
- Keep puzzle behavior localized to puzzle modules instead of central conditional branching where possible.
- Keep persistence-compatible schema updates additive and backward-safe.

## Evolution Notes

If architecture changes materially, update this document and the related planning docs:
- [storyplan.md](storyplan.md)
- [cloud-handoff.md](cloud-handoff.md)