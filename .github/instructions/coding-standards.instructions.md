---
description: "Use when editing TypeScript, React, game logic, puzzle logic, or tests."
applyTo: "src/**/*.ts,src/**/*.tsx,tests/**/*.ts,tests/**/*.tsx"
---

# Coding Standards

Follow these standards while writing or modifying code.

## Safety and Scope

- Make focused changes for the requested task only.
- Do not rewrite unrelated modules.
- Preserve backward compatibility unless asked to break it.

## TypeScript and Architecture

- Keep strict type safety intact.
- Avoid `any` unless unavoidable and justified.
- Keep puzzle-specific logic in [src/web/puzzles](../../src/web/puzzles).
- Keep shared domain logic in [src/game](../../src/game), [src/systems](../../src/systems), and [src/entities](../../src/entities).

## React and UI

- React owns the entire browser UI. Keep game rules in the domain layer; UI writes go through `src/web/state/actions.ts`.
- Prefer clear state transitions and deterministic UI updates.
- Keep accessibility in place (aria labels, keyboard handling, focus behavior).
- Reuse existing design-system primitives (`src/web/design-system`) and style from tokens; do not hard-code colours or spacing in a screen.

## Testing

- Update unit tests (`tests/*.test.ts`) for domain / validation / reducer changes.
- Update component tests (`tests/component/**`) for React component / interaction changes.
- Update e2e tests in [tests/e2e](../../tests/e2e) for user-flow changes.

## Prohibited Changes

- Do not commit secrets, credentials, or large binary assets.
- Do not disable failing tests to force green CI.
