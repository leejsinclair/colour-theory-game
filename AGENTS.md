# AGENTS

Repository-wide guidance for coding agents (Copilot, Claude Code, and similar tools).

## Purpose

Use this file as the default behavioral contract for automated code contributors.
It complements human contributor docs and points agents to machine-readable standards.

## Primary Sources (in order)

1. Task request from the user.
2. Files under [.github/instructions](.github/instructions).
3. Completion rubric in [EPCC.md](EPCC.md).
4. Human contributor docs: [CONTRIBUTING.md](CONTRIBUTING.md) and [cloud-handoff.md](cloud-handoff.md).

## Core Engineering Standards

- Keep TypeScript strict-mode clean; do not introduce type errors.
- Preserve existing architecture and file boundaries.
- Keep puzzle logic self-contained in [src/web/puzzles](src/web/puzzles).
- Prefer small, targeted changes over broad refactors.
- Update tests when behavior changes.
- Never commit secrets or credentials.

## Definition of Complete

A feature or fix is complete only when all items in [EPCC.md](EPCC.md) pass.

## Required Validation Commands

- `npm run build`
- `npm test`
- `npm run lint`
- `npm run test:e2e` for UI/flow changes

## Essential Agent Files

- [AGENTS.md](AGENTS.md)
- [.github/copilot-instructions.md](.github/copilot-instructions.md)
- [.github/instructions/coding-standards.instructions.md](.github/instructions/coding-standards.instructions.md)
- [.github/instructions/completion-criteria.instructions.md](.github/instructions/completion-criteria.instructions.md)
- [EPCC.md](EPCC.md)
- [.github/skills/epcc/SKILL.md](.github/skills/epcc/SKILL.md)
- [.claude/skills/epcc/SKILL.md](.claude/skills/epcc/SKILL.md)
