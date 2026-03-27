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

- Prefer clear state transitions and deterministic UI updates.
- Keep accessibility in place (aria labels, keyboard handling, focus behavior).
- Reuse existing UI patterns before adding new abstractions.

## Testing

- Update unit tests in [tests/game.test.ts](../../tests/game.test.ts) for game logic changes.
- Update e2e tests in [tests/e2e](../../tests/e2e) for user-flow changes.

## Prohibited Changes

- Do not commit secrets, credentials, or large binary assets.
- Do not disable failing tests to force green CI.
