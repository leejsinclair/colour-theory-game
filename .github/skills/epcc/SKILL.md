---
name: epcc
description: "Use when evaluating if work is complete, defining acceptance criteria, applying definition of done, release readiness, or EPCC checks. Keywords: done, complete, acceptance criteria, definition of done, EPCC, ready to merge."
---

# EPCC Skill

Use this skill when deciding whether work is complete.

## Trigger Phrases

- definition of done
- acceptance criteria
- complete this feature
- is this ready to merge
- EPCC

## Source of Truth

- [EPCC.md](../../../EPCC.md)

## Inputs

- User request or issue requirements
- Files changed
- Test/build outputs

## Steps

1. List all explicit user requirements.
2. Verify each requirement has concrete implementation evidence.
3. Apply all relevant sections from [EPCC.md](../../../EPCC.md).
4. Check required validation commands for the change type.
5. Return a pass/fail report and any missing items.

## Required Validation Commands

- `npm run build`
- `npm test` when game logic changed
- `npm run lint` when lint-sensitive files changed
- `npm run test:e2e` when browser UX or user flows changed

## Output Format

- Requirement coverage: complete or incomplete
- EPCC checklist results: pass/fail per section
- Validation summary: commands run and outcomes
- Remaining blockers: explicit and actionable
