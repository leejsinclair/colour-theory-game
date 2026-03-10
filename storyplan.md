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