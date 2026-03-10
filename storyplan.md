# Chromatic Mastery

## Game Concept

Chromatic Mastery is a cozy exploration puzzle game that teaches color theory through interactive challenges.

The player explores a magical artist's studio where the fundamental forces of color have been captured inside puzzle machines.

Each solved puzzle releases a small creature called a **Chromatic Pet**, representing a principle of color.

By collecting all pets and restoring balance to the studio, the player unlocks the final canvas and achieves **Chromatic Mastery**.

refer to [game-architecture.md](game-architecture.md)

---

# Player Goal

Restore the Color Studio by solving puzzles that represent:

- light physics
- pigment mixing
- value structure
- color harmony
- perceptual relativity
- atmospheric lighting

Each solved puzzle releases a Chromatic Pet.

The studio becomes more vibrant as pets return.

Final objective:
Create a masterpiece on the Grand Canvas using all learned color principles.

---

# Core Game Loop

1. Explore the studio
2. Discover puzzle station
3. Solve color challenge
4. Free Chromatic Pet
5. Add pet to collection
6. Studio gains color and life
7. Unlock next station

Repeat until all pets are collected.

---

# Studio Layout

The entire game takes place inside one magical studio room.

Stations unlock gradually.

## Stations

Light Laboratory
Value Sketchboard
Color Wheel Table
Optical Illusion Wall
Window Landscape
Paint Workbench

Each station contains 3 puzzles.

Total puzzles: 18  
Total pets: 18

---

# Story Introduction

When the player enters the studio they find a faded room.

Colors appear muted and lifeless.

A small glowing creature called the **Caretaker Sprite** appears.

Dialogue:

"Long ago this studio was filled with living color.  
But the principles of color were forgotten.  
The Chromatic Pets are trapped inside puzzles.  
Restore them and the studio will live again."

---

# Puzzle Stations

---

# 1. Light Laboratory
Teaches additive and subtractive color systems.

## Puzzle 1: Create White Light

Objective:
Combine red, green, and blue light beams to produce white light.

Mechanic:
Player rotates mirrors and lenses.

Success Condition:
RGB overlap produces white beam.

Reward Pet:
Glow Sprite

---

## Puzzle 2: Printer Pigments

Objective:
Match a target color using CMY inks.

Mechanic:
Player adjusts cyan, magenta, and yellow ink sliders.

Discovery:
CMY cannot create perfect black.

Reward Pet:
Ink Octopus

---

## Puzzle 3: Chromatic Black

Objective:
Create a rich black using complementary pigments.

Mechanic:
Player mixes pigments in bowl.

Valid mixes:

Blue + Orange  
Red + Green  
Yellow + Purple

Success Condition:
Shadow becomes luminous instead of flat.

Reward Pet:
Shadow Cat

---

# 2. Value Sketchboard
Teaches structure using value.

## Puzzle 4: Squint Test

Objective:
Paint a statue using only black and white.

Mechanic:
Player paints grayscale blocks.

Game periodically blurs screen.

Success Condition:
Object remains readable when blurred.

Reward Pet:
Shadow Mouse

---

## Puzzle 5: Value Ladder

Objective:
Arrange tiles from darkest to lightest.

Mechanic:
Drag blocks into correct order.

Hidden image appears when correct.

Reward Pet:
Gradient Hedgehog

---

## Puzzle 6: Chroma Tree

Objective:
Explore a 3D color tree showing chroma limits.

Mechanic:
Player climbs nodes to reach max saturation points.

Discovery:
Different hues reach peak chroma at different values.

Reward Pet:
Chroma Gecko

---

# 3. Color Wheel Table
Teaches harmony and palette construction.

## Puzzle 7: Complementary Colors

Objective:
Match opposite colors on wheel.

Examples:

Red ↔ Green  
Blue ↔ Orange  
Yellow ↔ Purple

Reward Pet:
Prism Fox

---

## Puzzle 8: Triadic Harmony

Objective:
Create a balanced three-color palette.

Example solution:

Red
Blue
Yellow

Reward Pet:
Palette Parrot

---

## Puzzle 9: Mood Palette

Objective:
Create palette matching emotional prompt.

Example prompts:

Joyful carnival  
Calm ocean  
Creepy dungeon

Bonus points for creative subversion.

Reward Pet:
Mood Bat

---

# 4. Optical Illusion Wall
Teaches color relativity.

## Puzzle 10: Same Square Illusion

Two squares appear different but are identical.

Objective:
Adjust background colors until illusion disappears.

Discovery:
Color perception is relative.

Reward Pet:
Chameleon Lizard

---

## Puzzle 11: Make Grey Look Blue

Player cannot change grey square.

Objective:
Manipulate surrounding colors.

Correct approach:
Use orange surroundings.

Reward Pet:
Contrast Frog

---

## Puzzle 12: Neutral Hero

Objective:
Make bright color stand out using neutrals.

Mechanic:
Mix neutral browns and greys from complements.

Reward Pet:
Neutral Turtle

---

# 5. Window Landscape
Teaches atmospheric perspective.

## Puzzle 13: Depth Painting

Paint mountain scene with correct depth cues.

Rules for distant objects:

blur edges  
reduce saturation  
cool hue  
reduce contrast

Reward Pet:
Sky Jelly

---

## Puzzle 14: Rayleigh Scattering

Activate atmospheric shader.

Far objects shift toward blue.

Reward Pet:
Air Sprite

---

## Puzzle 15: Golden Hour

Time-limited challenge.

Player mixes warm sunset palette before nightfall.

Palette shifts to blue hour.

Reward Pet:
Dusk Owl

---

# 6. Paint Workbench
Teaches pigment mixing.

## Puzzle 16: Vibrant Green

Correct mix:

Phthalo Blue  
Hansa Yellow

Incorrect mixes produce muddy greens.

Reward Pet:
Paint Slime

---

## Puzzle 17: Mud Monster

Player mixes too many complements.

Result is muddy brown.

Puzzle teaches avoiding over-mixing.

Reward Pet:
Mud Blob

---

## Puzzle 18: Optical Mixing

Paint dots of pure colors.

Viewer eye blends them.

Demonstrates pointillism.

Reward Pet:
Dot Bee

---

# Final Challenge

When all pets are collected:

The **Grand Canvas** appears in the center of the studio.

Player must paint a scene using all learned principles:

value structure  
color harmony  
atmospheric perspective  
chromatic black  
color relativity

All pets assist by reacting to color mistakes.

When painting succeeds:

The studio transforms into a vibrant gallery.

Caretaker Sprite says:

"You now see color not as paint, but as living light."

Player achieves **Chromatic Mastery**.

---

# Pet Behavior System

Pets wander the studio after being freed.

Examples:

Glow Sprite glows near light puzzles  
Shadow Cat hides in dark corners  
Sky Jelly floats near window  
Paint Slime sits on palette

Pets react to nearby colors.

---

# Completion Rewards

Completing the game unlocks:

Free Paint Mode  
Studio decoration items  
Pet hats  
Advanced color challenges

---

# End Theme

Color is not static.

It is a living relationship between:

light  
material  
perception  
environment

The player leaves the studio seeing color differently forever.

---

# Implementation Status (March 2026)

This section tracks implementation against this story plan and `game-architecture.md`.

## Completed in code (`src/`)

- Modular architecture scaffold: scene manager, station manager, puzzle manager, pet manager, save system
- Domain models: player, station, puzzle, pet, puzzle states/types, station types, pet types
- Story content mapping: 6 stations, 18 puzzles, 18 pets, caretaker intro lines, final canvas requirements
- Progression flow:
	- first station unlocked at start
	- puzzle chaining inside each station
	- next station unlock on station completion
	- final canvas unlock at 18 pets
- Color engine utilities: RGB/CMY mix, complement, atmospheric perspective, optical mixing
- Puzzle validation rules implemented for all 18 puzzles with story-specific checks
- Playable prototypes:
	- CLI loop (`npm run play`) for command-based progression
	- Browser/canvas prototype (`npm run play:web`) for visual station progression
- Unit tests for core progression and save/load (`npm test`)
- Shared demo-solution map used by tests and prototypes for deterministic solves
- Mini-game UX improvements:
	- Puzzle-01 (RGB beams): visual toggle beam buttons with live additive-color preview replacing plain checkboxes
	- Puzzle-02 (CMY print): live CMY-to-RGB preview swatches (current mix vs. target)
	- Puzzle-03 (Chromatic Black): bowl-based pigment selection with live chromatic black preview and luminous-shadow feedback
	- Puzzle-16 (Vibrant Green): live pigment mix color preview showing clean vs. muddy outcomes
	- Puzzle-17 (Mud Monster): interactive mix board with action buttons, live mud meter, monster-state feedback, recipe log, and reset flow
	- Puzzle-18 (Optical Mixing): coverage bar tracks painted area percentage; pointer capture for uninterrupted drag-to-paint across canvas boundary
	- Puzzle-07 (Complementary Colors): target-and-response complement drill using clickable color chips and streak feedback
	- Puzzle-09 (Mood Palette): palette-builder board with inferred tags from hue/saturation/value/contrast interactions
	- Puzzle-13 (Depth Painting): layered mountain scene with live edge-softening, saturation-drop, and cool-shift controls
	- Puzzle-14 (Rayleigh Scattering): atmospheric board with scattering/haze controls and visible far-ridge blue shift
	- Puzzle-15 (Golden Hour): dual warm/cool progress meters, live completion checklist, reset-day-cycle control, and more reliable/forgiving completion tracking; **improved usability**: phase indicator badge, per-phase step guide ("Step 1 of 2…"), "Shift To Blue Hour" promoted to accent button with tooltip, "Advance Time" labeled with step size, redundant controls hidden in blue-hour phase
	- Puzzle-18 (Optical Mixing): added live tiled distance preview canvas to visualize optical blending while painting
	- All puzzles: shake animation + red border feedback on incorrect Check submission
- Playwright e2e coverage expanded (12 tests):
	- RGB beam button toggling and color preview rendering
	- Optical mixing coverage bar visibility and update-on-draw behavior
	- Gamification HUD visibility (Score / Pets / Best Streak tiles)
	- HUD value updates after Auto Solve Journey
	- Pet milestone badges (Color Apprentice / Palette Keeper / Chromatic Master) rendered after all pets collected
	- Reward toast notification appears on first-time puzzle solve via Check button
	- Progress panel shows Score line
	- Golden Hour phase indicator visible when entering puzzle
- **Gamification reward loop implemented** (`src/game/Game.ts`, `src/systems/SaveSystem.ts`):
	- First-time puzzle solve: +100 pts
	- New pet rescued: +25 pts
	- Station completion bonus: +50 pts
	- Final canvas unlock: +200 pts
	- Practice completions: +10 pts per valid attempt, capped at 30 per puzzle per session
	- Combo streak counter (currentStreak / bestStreak) increments on each successful Check
	- Pet collection milestones: 6 pets → "Color Apprentice", 12 → "Palette Keeper", 18 → "Chromatic Master"
	- All fields persisted in save snapshot with backward-compatible defaults
- **HUD + reward feedback UI** (`src/web/main.ts`, `index.html`, `src/web/styles.css`):
	- Persistent Score / Pets / Best Streak tile row above progress panel
	- Pet milestone badges rendered below HUD when thresholds reached
	- Floating toast notification on each successful Check showing score breakdown (e.g., "+100 First Solve: Triadic Harmony +25 Pet Rescued")

## Improvements Needed (Priority Backlog)

- Improve gameplay depth for remaining prototype-like puzzles:
	- Puzzle-08 (Triadic Harmony): add direct wheel dragging/snapping and visual spacing aids (arcs/wedge guides) for faster learning
	- Puzzle-10 to Puzzle-12 (Relativity set): add explicit "perception before/after" overlays and richer challenge tiers
	- Puzzle-15 (Golden Hour): add consequence-based scoring tiers for early/on-time/late transitions and stronger phase-specific coaching
- Improve puzzle instruction clarity:
	- Add one-sentence "How to win" hints and one-sentence "Why this failed" hints directly in each mini-game state panel
	- Standardize wording so terms like "mud", "contrast", and "neutral" are always explained in context
- Expand automated test coverage for recent UX additions:
	- Add e2e assertions for puzzle-specific interactions in upgraded mini-games (not only station entry/visibility)
	- Add regression checks for practice-mode replay behavior and check/fail feedback loops
- Strengthen final-game loop completeness:
	- Implement final canvas playable challenge (currently represented as progression state only)
	- Add pet reaction hooks during final painting to reflect story requirements

## Next Steps (Execution Plan)

1. Add e2e tests for upgraded puzzle interactions (`puzzle-03`, `puzzle-07`, `puzzle-09`, `puzzle-13`, `puzzle-14`, `puzzle-15`, `puzzle-16`, `puzzle-17`, `puzzle-18` tiled preview) to lock current engagement behavior.
2. Add tiered challenge variants for the relativity and harmony puzzles (`puzzle-08` through `puzzle-12`) to improve replay value.
3. Implement per-puzzle fail-reason messaging (not just "Try Again") using puzzle-specific validation feedback.
4. Build final canvas interaction loop with measurable completion criteria tied to the five final principles.
5. Add post-completion flow: free paint mode entry, reward unlock messaging, and pet ambient behaviors in free play.
6. Expand CI quality gate to ensure any new/changed puzzle has either unit coverage or Playwright interaction coverage.

## Cloud Delivery + Playwright Requirements

This section defines what GitHub cloud automation must complete and verify before merge.

### Required commands

- `npm ci`
- `npm run build`
- `npm test`
- `npx playwright install --with-deps chromium`
- `npm run test:e2e`

### Definition of done for cloud completion

- TypeScript compiles with no errors.
- Unit tests pass (`tests/game.test.ts`).
- Playwright e2e tests pass for studio loading, progression, and art-station gameplay interaction (not just visibility).
- Browser prototype remains launchable via `npm run play:web`.
- Story-plan progress section remains in sync with actual implemented features.

### Required Playwright scenarios

- Studio boot: verify title, progress panel, and core action buttons.
- Auto-solve flow: verify final canvas unlock appears in progress panel.
- Art station playable loop: verify entering Paint Workbench exposes the mini game and supports paint interaction (select color, draw, clear).

### Cloud handoff rules for future tasks

- Any gameplay feature change must include at least one unit or Playwright test update.
- Any UI selector used in Playwright should stay stable or tests must be updated in the same PR.
- If station progression logic changes, verify both CLI (`npm run play`) and browser (`npm run play:web`) behavior.