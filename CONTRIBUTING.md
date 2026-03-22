# Contributing to Chromatic Mastery

Thank you for your interest in contributing! This document explains how to report bugs, suggest features, and submit code changes.

---

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Reporting Issues](#reporting-issues)
- [Suggesting Features](#suggesting-features)
- [Development Setup](#development-setup)
- [Submitting a Pull Request](#submitting-a-pull-request)
- [Coding Standards](#coding-standards)

---

## Code of Conduct

This project follows the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md). By participating, you agree to uphold it.

---

## Reporting Issues

Use the GitHub Issues template chooser to pick the right template:

- **Bug report** — something is broken or behaves unexpectedly
- **Feature request** — a new idea or improvement
- **Puzzle feedback** — a puzzle feels unfair, confusing, or has incorrect validation

👉 https://github.com/leejsinclair/colour-theory-game/issues/new/choose

Please include as much context as possible: steps to reproduce, expected vs actual behaviour, and your browser/OS if relevant.

---

## Suggesting Features

Open a Feature Request issue. Describe the problem you are trying to solve and your proposed solution. Screenshots or mockups are always appreciated.

---

## Development Setup

1. **Fork** the repository and clone your fork:

   ```bash
   git clone https://github.com/<your-username>/colour-theory-game.git
   cd colour-theory-game
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Install Playwright browsers** (required for end-to-end tests):

   ```bash
   npx playwright install
   ```

4. **Start the development server:**

   ```bash
   npm run play:web
   ```

   Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Submitting a Pull Request

1. Create a feature branch from `main`:

   ```bash
   git checkout -b feat/my-change
   ```

2. Make your changes.

3. Run the full test suite:

   ```bash
   npm run test:cloud
   ```

   All tests must pass before submitting.

4. Lint your code:

   ```bash
   npm run lint
   ```

5. Commit using a clear, descriptive message.

6. Push your branch and open a pull request against `main`. Fill in the PR template and link any related issues.

---

## Coding Standards

- **TypeScript strict mode** is enabled. All new code must type-check cleanly.
- Follow the existing file and folder conventions (see `src/` structure in the README).
- Keep puzzle logic self-contained in `src/web/puzzles/puzzle-XX.ts` and its view component.
- Add or update unit tests in `tests/game.test.ts` and end-to-end tests in `tests/e2e/` where appropriate.
- Do not commit secrets, credentials, or large binary assets.
