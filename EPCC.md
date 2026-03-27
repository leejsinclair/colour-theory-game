# EPCC: Engineering Product Completion Criteria

Use this as the source of truth for deciding if a feature or fix is complete.

## 1. Requirement Fit

- The user request is fully implemented.
- No explicit requirement from the request is omitted.
- Out-of-scope behavior is not unintentionally changed.

## 2. Technical Correctness

- Code compiles and type-checks.
- Logic is deterministic and handles expected edge cases.
- Existing architecture and layering are preserved.

## 3. Quality Gates

Run and pass the checks that apply to your change:

- `npm run build` (required)
- `npm test` (required for logic/domain changes)
- `npm run lint` (required for style/lint-sensitive changes)
- `npm run test:e2e` (required for browser/UI flow changes)

## 4. Tests and Coverage

- New behavior has tests or justified rationale if testless.
- Updated behavior has updated assertions.
- Regressions are prevented in the most likely failure areas.

## 5. UX and Accessibility (if UI touched)

- User-facing text is clear and accurate.
- Keyboard and focus behavior remains usable.
- Visual states and feedback are consistent.

## 6. Documentation and Maintainability

- Update docs that describe changed behavior.
- Keep changes readable and minimally invasive.
- Avoid dead code and TODO placeholders unless tracked.

## 7. Ready-to-Ship Outcome

A change is complete when all applicable EPCC sections pass and there are no known blockers.
