# Copilot Instructions

These instructions guide GitHub Copilot behavior in this repository.

## Scope

Applies to all coding tasks in this workspace.

## Before Coding

- Read [AGENTS.md](../AGENTS.md).
- Load applicable files in [.github/instructions](instructions).
- If asked to ensure a task is done, evaluate against [EPCC.md](../EPCC.md).

## Implementation Expectations

- Keep edits minimal and localized.
- Match existing naming, style, and architecture.
- Avoid changing unrelated files.
- Add or update tests when logic changes.

## Validation Expectations

Run the smallest necessary set of checks for the change type:

- Always: `npm run build`
- Logic changes: `npm test`
- Style/lint-sensitive edits: `npm run lint`
- UI flows or user journey changes: `npm run test:e2e`

## Done Criteria

A task is complete only when [EPCC.md](../EPCC.md) is satisfied.
