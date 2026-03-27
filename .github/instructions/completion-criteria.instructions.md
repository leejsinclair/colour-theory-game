---
description: "Use when determining whether a feature, fix, or PR is complete; applies definition-of-done and release readiness checks. Keywords: done, complete, acceptance criteria, definition of done, EPCC."
applyTo: "**/*"
---

# Completion Criteria

Use this checklist before declaring work complete.

## Functional Completion

- Requested behavior is implemented end-to-end.
- Existing behavior outside scope is unchanged.
- Edge cases and error states for touched flows are handled.

## Quality Gates

- Build passes: `npm run build`
- Unit tests pass: `npm test`
- Lint passes: `npm run lint`
- E2E tests pass for UI or journey changes: `npm run test:e2e`

## Documentation and Traceability

- Update relevant docs if behavior or workflow changed.
- Keep [storyplan.md](../../storyplan.md) and [cloud-handoff.md](../../cloud-handoff.md) aligned when applicable.
- Include a concise summary of what changed and why.

## Final Rule

Do not mark a task complete unless [EPCC.md](../../EPCC.md) is satisfied.
