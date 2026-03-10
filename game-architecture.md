# Chromatic Mastery – Game Architecture

This document defines the technical architecture for the Chromatic Mastery puzzle game.

The architecture is designed to support:
- puzzle driven gameplay
- modular puzzle logic
- collectible pets
- simple rendering
- extensible content

The design assumes a 2D scene with interactive stations.

---

# Core Architecture Principles

1. Puzzles are modular
2. Stations contain puzzles
3. Pets are rewards for puzzles
4. Game state tracks progress
5. Rendering is independent of puzzle logic

---

# System Overview

Game
 ├── SceneManager
 ├── StationManager
 ├── PuzzleManager
 ├── PetManager
 ├── PlayerController
 └── SaveSystem

---

# Scene System

Scenes represent physical areas of the studio.

Scene Types:

StudioScene
PuzzleScene
FinalCanvasScene

SceneManager responsibilities:

loadScene()
unloadScene()
transitionScene()

---

# Station System

Stations are interactive puzzle locations.

Station Types:

LightLaboratory
ValueSketchboard
ColorWheelTable
OpticalIllusionWall
WindowLandscape
PaintWorkbench

Station Model:

Station
    id
    name
    location
    puzzles[]
    unlocked
    completed

---

# Puzzle System

Each puzzle is independent.

Puzzle Model:

Puzzle
    id
    stationId
    title
    description
    puzzleType
    state
    solved
    rewardPetId

Puzzle State:

locked
available
in_progress
solved

Puzzle Types:

RGB_LIGHT
CMY_PRINT
CHROMATIC_BLACK
VALUE_PAINT
VALUE_SORT
CHROMA_TREE
COLOR_COMPLEMENT
COLOR_TRIAD
MOOD_PALETTE
SQUARE_ILLUSION
GREY_SHIFT
NEUTRAL_POP
LANDSCAPE_DEPTH
RAYLEIGH_SCATTER
GOLDEN_HOUR
PIGMENT_MIX
MUD_PREVENTION
POINTILLISM

Puzzle Interface:

startPuzzle()
updatePuzzle()
checkSolution()
completePuzzle()

---

# Pet System

Pets represent color concepts.

Pet Model:

Pet
    id
    name
    type
    sprite
    unlocked
    behavior

Pet Types:

GlowSprite
InkOctopus
ShadowCat
ShadowMouse
GradientHedgehog
ChromaGecko
PrismFox
PaletteParrot
MoodBat
ChameleonLizard
ContrastFrog
NeutralTurtle
SkyJelly
AirSprite
DuskOwl
PaintSlime
MudBlob
DotBee

Pet Behavior Model:

PetBehavior
    idle()
    wander()
    reactToColor()
    interactWithPlayer()

Example behaviors:

GlowSprite increases brightness near light puzzles

ShadowCat hides in dark areas

SkyJelly floats near window

PaintSlime moves toward paint palettes

---

# Player System

PlayerController responsibilities:

movement
interaction
puzzle activation
pet interaction

Player Model:

Player
    position
    interactionRange
    collectedPets[]

Interaction types:

interactStation()
inspectPuzzle()
collectPet()

---

# Puzzle Logic Examples

Example: RGB Light Puzzle

Inputs:

redBeam
greenBeam
blueBeam

Solution Condition:

if redBeam AND greenBeam AND blueBeam overlap
    outputColor = white
    puzzleSolved = true

---

Example: Complementary Color Puzzle

Inputs:

selectedColorA
selectedColorB

Solution:

if colorWheel.opposite(selectedColorA) == selectedColorB
    puzzleSolved = true

---

Example: Atmospheric Perspective Puzzle

Validation rules:

distance increases:
    edgeSharpness decreases
    saturation decreases
    temperature shifts cooler

if rules satisfied
    puzzleSolved = true

---

# Pet Collection System

When puzzle is solved:

unlockPet(petId)

Process:

spawnPetAnimation()
addPetToCollection()
updateStudioPopulation()

PetCollection Model:

PetCollection
    collectedPets[]
    totalPets
    completionPercent

---

# Studio Population System

Pets wander the studio after being unlocked.

PetSpawner responsibilities:

spawnPet()
assignPetBehavior()
controlPetMovement()

---

# Rendering Layers

Layer order:

background
studio environment
player
pets
puzzle UI
effects

Rendering components:

SpriteRenderer
ParticleSystem
ColorShader

---

# Color Engine

Color Engine handles color interactions.

Functions:

mixRGB()
mixCMY()
calculateComplement()
applyAtmosphericPerspective()
simulateOpticalMixing()

Example:

mixCMY(cyan, magenta, yellow)

Returns simulated pigment result.

---

# Save System

Save data stored locally.

SaveData Model:

SaveData
    completedPuzzles[]
    collectedPets[]
    unlockedStations[]
    playerPosition

Functions:

saveGame()
loadGame()

---

# Final Canvas System

Unlock condition:

if collectedPets == 18
    unlockFinalCanvas()

Final canvas allows free painting using all mechanics.

Canvas tools:

color picker
brush
value slider
chroma slider
lighting filter

Pets provide hints during painting.

---

# Asset Structure

/assets

sprites
    pets
    stations
    UI

textures
    paint
    gradients

audio
    ambience
    puzzleSolved
    petUnlock

---

# Recommended File Structure

/src

game
    Game.ts
    SceneManager.ts

systems
    PuzzleManager.ts
    PetManager.ts
    SaveSystem.ts

entities
    Player.ts
    Pet.ts
    Station.ts
    Puzzle.ts

puzzles
    RGBPuzzle.ts
    CMYPuzzle.ts
    ComplementPuzzle.ts
    AtmospherePuzzle.ts

ui
    PuzzleUI.ts
    InventoryUI.ts