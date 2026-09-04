<!--
Sync Impact Report
- Version change: (template, unratified) → 1.0.0
- Rationale: Initial ratification. No prior filled constitution existed (file contained only
  unfilled template placeholders), so this is treated as the founding adoption rather than an
  amendment — MAJOR version 1.0.0 per governance policy for initial adoption.
- Modified principles: none (first fill)
- Added sections:
  - Core Principles: I. Code Quality & Architectural Integrity
  - Core Principles: II. Testing Standards (NON-NEGOTIABLE)
  - Core Principles: III. User Experience Consistency
  - Core Principles: IV. Performance Requirements
  - Technology Stack & Tooling Constraints
  - Development Workflow & Quality Gates
  - Governance
- Removed sections: none
- Deferred placeholders / TODOs: none — RATIFICATION_DATE set to the date of this founding
  adoption since no earlier ratified version exists.
- Templates requiring follow-up: none checked by this command (out of scope per Scope Guard);
  dependent commands (plan/spec/tasks templates) read this constitution at runtime and were not
  modified here.
-->

# Chromatic Mastery Constitution

## Core Principles

### I. Code Quality & Architectural Integrity
TypeScript strict mode is non-negotiable; `any` and unchecked type assertions MUST NOT be
introduced without an inline comment justifying why a stricter type is not possible. Game-rule
decisions MUST live in the domain/systems layer (`src/game/`, `src/systems/`, `src/entities/`),
never in UI components — this separation is what lets the CLI and web shell share one source of
truth for progression, and any change that leaks rule logic into `src/web/` is a defect, not a
style preference. `npm run build` (the `tsc` typecheck gate) MUST pass before work is considered
done. New code MUST follow established repo patterns — puzzle `puzzle-NN.ts` / `puzzle-NN-view.tsx`
pairs, `src/web/legacy/` sub-modules, the `PuzzleRenderDeps` helper bag — rather than introducing
a parallel convention; deviating requires explicit justification in the PR description. Dead code,
commented-out code, and unused exports MUST NOT be merged (delete, don't comment out, when a
removal is certain).

**Rationale**: The codebase is deliberately architected as two runtime surfaces (CLI, web) sharing
one domain core, and as an imperative shell rather than a full React tree (see
`game-architecture.md`). These are considered decisions, not accidents — code that quietly
re-introduces a competing pattern erodes the reason the architecture works.

### II. Testing Standards (NON-NEGOTIABLE)
Every change to `src/game/`, `src/systems/`, `src/entities/`, or validation logic
(`src/web/puzzleValidation.ts` and friends) MUST ship with Vitest unit coverage. Every UI or user
journey change (new puzzle, altered flow, modal/gate behavior) MUST ship with Playwright e2e
coverage. Failing tests MUST be fixed, not skipped, disabled, or deleted to unblock a merge — a
red test is a signal to fix the code or the test's premise, never to silence it. The Husky
`pre-commit` (lint + unit tests) and `pre-push` (e2e) hooks are mandatory quality gates; bypassing
them with `--no-verify` or equivalent MUST NOT happen without explicit, one-off user authorization
for that specific push.

**Rationale**: `EPCC.md` is the authoritative completion rubric for this project precisely because
"looks done" and "is done" diverge quickly in a puzzle game with 21+ interactive mini-games — only
tests catch regressions across puzzles a manual pass won't revisit.

### III. User Experience Consistency
Puzzle interactions MUST be built from the established `PuzzleRenderDeps` helpers (sliders,
selects, checkboxes, hue helpers) so every puzzle — current and future — shares the same
interaction vocabulary; a puzzle that invents its own control pattern breaks the game's learned
affordances. The learning gate (intro card + quiz) MUST precede playability for every puzzle with
no bypass path, since teaching colour theory is the product, not a wrapper around it. Wrong-answer
feedback MUST route through `diagnose.ts` / `failureReasons.ts` to give a specific, actionable
explanation — generic "incorrect" states are a regression in teaching value, not just polish.
Persistence changes to `localProgress.ts` or `SaveSystem.ts` MUST be additive and backward-safe so
a returning player's solved state and learning progress are never silently lost by a schema change.

**Rationale**: Consistency across 21 puzzles is what makes the game legible as one system rather
than 21 one-off widgets, and the learning gate + specific feedback are the mechanism by which the
game actually teaches colour theory rather than just testing it.

### IV. Performance Requirements
`npm run build:web` (the Vite production build) is the artifact GitHub Pages deploys; changes MUST
NOT break this build or introduce a material, unexplained bundle-size regression. The web shell's
imperative orchestration (`legacyGame.ts` plus `src/web/legacy/` modules) exists specifically to
avoid a full React re-render tree and state-management overhead for a DOM-heavy, animation-driven
game — new features MUST work within this model rather than introducing a competing state library
or a parallel React root, per `game-architecture.md`. Puzzle render paths MUST stay non-blocking:
expensive colour math belongs in `ColorEngine` / `src/systems/`, not inline in a puzzle view's
render function. New content (puzzle-info markdown, images, assets) MUST NOT materially degrade
initial page load.

**Rationale**: This is a browser game evaluated by feel — input lag or a slow first paint directly
undermines the puzzle-solving experience the other principles are protecting.

## Technology Stack & Tooling Constraints

The stack is fixed and changes to it require explicit justification, not incidental drift: strict
TypeScript, React 19 + MUI + Emotion for chrome only (per Principle I, gameplay is imperative DOM
orchestration), Vite for dev/build, Vitest for unit tests, Playwright for e2e. Node version is
pinned by `.nvmrc` and consumed via `node-version-file` in CI — local tooling MUST track that
version, not an ad hoc one. `vite.config.ts`'s `base: '/colour-theory-game/'` production setting
(required for the GitHub Pages subpath) MUST be preserved by any build config change. CI
(`.github/workflows/cloud-ci.yml`) runs build + unit + e2e on PRs and pushes to `main`; deploy
(`.github/workflows/deploy.yml`) runs `npm run build:web` to Pages on push to `main` — changes that
would break either workflow MUST be caught locally first via `npm run test:cloud`.

## Development Workflow & Quality Gates

`EPCC.md`, elaborated by `AGENTS.md` and `.github/instructions/*.instructions.md`, is the
authoritative definition of done and takes precedence over ad hoc judgment calls: `npm run build`
always; `npm test` for logic changes; `npm run lint` for style-sensitive edits; `npm run test:e2e`
for UI/journey changes. Changes MUST be kept small and localized to the area they address —
opportunistic refactors or abstractions beyond what a task requires are out of scope for the same
PR. A failing test suite MUST NOT be worked around by disabling the failing test.

## Governance

This constitution supersedes ad hoc practice for any conflict between the two; where CLAUDE.md,
EPCC.md, or AGENTS.md offer more specific mechanical detail, they elaborate this constitution and
MUST NOT contradict it. Amendments are made by editing this file via the `/speckit.constitution`
workflow, which MUST regenerate the Sync Impact Report and bump the version per semantic
versioning: MAJOR for backward-incompatible principle removal or redefinition, MINOR for a new
principle or materially expanded section, PATCH for wording/clarification-only changes. Every pull
request MUST be evaluated against the Core Principles above in addition to `EPCC.md`'s completion
rubric before being considered mergeable; a PR that knowingly violates a principle MUST say so
explicitly in its description with a justification, not merge silently. Complexity that violates
Principle I (architectural integrity) or IV (performance) MUST be justified in the PR description
or avoided. Runtime, day-to-day development guidance for contributors and agents lives in
`CLAUDE.md`; this document governs the non-negotiable principles that guidance must not violate.

**Version**: 1.0.0 | **Ratified**: 2026-09-02 | **Last Amended**: 2026-09-02
