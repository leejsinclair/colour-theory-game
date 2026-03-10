# Chromatic Mastery Prototype

This repository contains a modular TypeScript implementation of the Chromatic Mastery game architecture with both CLI and browser playable prototypes.

## Run

- Install dependencies: `npm install`
- Run tests: `npm test`
- Build core TypeScript: `npm run build`
- Play CLI prototype: `npm run play`
- Play browser/canvas prototype: `npm run play:web`

## Browser Controls

- Click the map to move the player avatar around the studio
- Click an unlocked station while nearby to enter its puzzle scene
- `Solve` on an available puzzle: submits a valid demo solution
- `Auto Solve Journey`: completes all 18 puzzles
- `Reset Run`: restarts progression

## Notes

- Puzzle validation rules reflect the story plan requirements for all 18 puzzles.
- Browser prototype reuses the same `Game` progression logic used by tests and CLI.
