import { defineConfig } from "vitest/config";

/**
 * Two projects:
 *  - `unit`      — fast node environment, the existing domain/validation suites
 *                  (`tests/*.test.ts`). Unchanged in mechanism.
 *  - `component` — jsdom environment for React component/interaction tests
 *                  (`tests/component/**`), added for FR-058.
 *
 * `npm test` runs BOTH so the Husky pre-commit hook gates component tests
 * (constitution Principle II).
 */
export default defineConfig({
  test: {
    passWithNoTests: true,
    projects: [
      {
        extends: true,
        test: {
          name: "unit",
          environment: "node",
          include: ["tests/*.test.ts"],
          globals: true,
        },
      },
      {
        extends: true,
        test: {
          name: "component",
          environment: "jsdom",
          include: ["tests/component/**/*.test.{ts,tsx}"],
          setupFiles: ["tests/component/setup.ts"],
          globals: true,
        },
      },
    ],
  },
});
