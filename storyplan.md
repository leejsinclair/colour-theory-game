# Development Progress

## Latest Updates

**22 March 2026**
- Added full puzzle learning gate system: introduction card + two-question quiz shown before each puzzle's first attempt across all 21 puzzles
- Players must pass the quiz (100%, unlimited retries) to unlock puzzle mechanics; solved puzzles bypass the gate and go straight to practice
- Added Review Introduction button after unlock (persists across React re-renders)
- Quiz pass state saved to localStorage and restored on reload
- Added new CSS classes for all learning UI components
- Added comprehensive Playwright e2e test suite: new-player-journey.spec.ts covers the complete app from fresh load to Grand Canvas (24 tests)
- All existing e2e tests updated for the learning gate flow (45 total, all passing)
- Added learning content metadata unit tests (24 total, all passing)
- Added full puzzle learning content section to storyplan.md (all 21 introductions and quizzes) for LLM analysis

**17 March 2026**
- Puzzle 16 (Vibrant Green): Simplified user interface for improved usability

---

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
Design Studio

Each station contains 3 puzzles.

Total puzzles: 21  
Total pets: 21

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

# 7. Design Studio
Teaches compositional color balance, color psychology, and chromatic vibration.

## Puzzle 19: Color Balance 60/30/10

Objective:
Allocate colors to a composition following the 60/30/10 rule.

Mechanic:
Player adjusts hue pickers for primary, secondary, and accent roles.  
Player sets proportion sliders so values sum to 100%.

Success Condition:
Primary ≈ 60%, Secondary ≈ 30%, Accent ≈ 10% (within tolerance).

Reward Pet:
Harmony Dove

---

## Puzzle 20: Emotional Colour Mapping

Objective:
Match each color swatch to its primary psychological association.

Mechanic:
Player is shown four color swatches (red, blue, yellow, green).
For each color, the player selects the correct emotional association from a list of four options.

Correct mappings:

Red → Excitement & Urgency  
Blue → Trust & Calm  
Yellow → Optimism & Warmth  
Green → Growth & Balance

Discovery:
Color carries emotional meaning before any conscious thought — designers exploit this to guide viewer response.

Reward Pet:
Empathy Moth

---

## Puzzle 21: Chromatic Vibration

Objective:
Create the strongest possible optical vibration between two adjacent colors.

Mechanic:
Player adjusts two hue sliders and toggles a value-balance switch.
A side-by-side color preview shows the result.
A vibration-intensity bar rises as the conditions for vibration are met.

Success Conditions:
Hues are complementary (approximately 180° apart on the color wheel).
Values (lightness) of both colors are equal.

Discovery:
Maximum vibration occurs at the intersection of complementary hue contrast and zero value contrast.
When value contrast is high, the eye reads contrast easily. When value contrast is zero but hues are complementary, the eye cannot decide which color is figure and which is ground — causing optical shimmer.

Reward Pet:
Vibration Hummingbird

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

---

# Prototype Status Update (March 2026)

This section reflects what is currently implemented in the playable prototypes.

## Completed Game Modes

- CLI prototype is playable and supports status, puzzle listing, solving by ID, and full auto-solve.
- Browser prototype is playable with a full puzzle-list flow and progression tracking.

## Completed Core Features

- 7 stations are implemented and progression-gated (6 main + 1 bonus Design Studio, unlocks after all main stations complete).
- 21 puzzles are implemented with per-puzzle validation logic.
- 21 Chromatic Pets are implemented and collectible.
- Puzzle completion unlocks the next puzzle and next station as designed.
- Final challenge unlock condition is implemented after all 21 pets are collected.
- Save/load support is implemented.
- Score, streak, and pet milestones are implemented.
- Browser UI includes progress HUD, pet collection display, puzzle concept modal, and reward toasts.
- Browser UI includes Auto Solve Journey and Reset Run actions.

## Completed Puzzle Content

### Station 1 - Light Laboratory

- [x] Puzzle 1: Create White Light
- [x] Puzzle 2: Printer Pigments
- [x] Puzzle 3: Chromatic Black

### Station 2 - Value Sketchboard

- [x] Puzzle 4: Squint Test
- [x] Puzzle 5: Value Ladder
- [x] Puzzle 6: Chroma Tree

### Station 3 - Color Wheel Table

- [x] Puzzle 7: Complementary Colors
- [x] Puzzle 8: Triadic Harmony
- [x] Puzzle 9: Mood Palette

### Station 4 - Optical Illusion Wall

- [x] Puzzle 10: Same Square Illusion
- [x] Puzzle 11: Make Grey Look Blue
- [x] Puzzle 12: Neutral Hero

### Station 5 - Window Landscape

- [x] Puzzle 13: Depth Painting
- [x] Puzzle 14: Rayleigh Scattering
- [x] Puzzle 15: Golden Hour style challenge (implemented as a two-stage time-of-day mastery puzzle)

### Station 6 - Paint Workbench

- [x] Puzzle 16: Vibrant Green
- [x] Puzzle 17: Mud Monster
- [x] Puzzle 18: Optical Mixing

### Station 7 - Design Studio (Bonus)

- [x] Puzzle 19: Color Balance 60/30/10
- [x] Puzzle 20: Emotional Colour Mapping
- [x] Puzzle 21: Chromatic Vibration

## Removed or Changed Elements

- Map-based exploration has been removed from the active browser prototype flow.
- Click-to-move avatar navigation and nearby-station interaction are not part of the current UI.

---

# Puzzle Learning Content — Introductions and Quizzes

Each puzzle shows the player an introduction card (two paragraphs + illustration) before their first attempt. They must pass a two-question quiz before the puzzle unlocks. Below is the complete text for all 21 puzzles, including **How to win**, **Why this fails**, and **Key terms** for each.

---

## Station 1 — Light Laboratory

### Puzzle 1: RGB White Light

**Introduction**

Demonstrates additive color mixing used by light sources such as screens and projectors.

Learn how red, green and blue combine to make white light.

**How to win**

Make the center patch appear white by adjusting the three sliders to match emitted light proportions.

**Why this fails**

Overlapping emitted wavelengths add, so mismatched intensities produce tinted whites.

**Key terms**
- additive: mixing by adding light wavelengths together
- subtractive: mixing by absorbing wavelengths

**Quiz**

Q1: Why do screens use red, green and blue to make many colors?
- A) Because emitted light wavelengths add to form other colors ✓
- B) Because pigments reflect those three colors
- C) Because human eyes only see red, green and blue

*Explanation: Additive mixing combines light intensities to create new perceived colors.*

Q2: If you increase the green slider while red and blue stay the same, what happens?
- A) It shifts toward green and may become lighter ✓
- B) It becomes darker because colors cancel out
- C) It turns into a neutral grey

*Explanation: Adding more green increases that wavelength's contribution and overall luminance.*

---

### Puzzle 2: CMY Printing Basics

**Introduction**

Pigments and inks work by subtraction: they absorb parts of white light and reflect what remains to your eye.

Cyan, magenta, and yellow are subtractive primaries. Tuning each channel teaches how print color shifts hue and value.

**How to win**

Adjust the cyan, magenta, and yellow sliders until the mixed swatch matches the target color.

**Why this fails**

Each ink absorbs a different part of white light, so unbalanced channels shift the result away from the target hue.

**Key terms**
- subtractive: mixing by absorbing wavelengths from reflected light
- value: lightness or darkness of a color
- chroma: the intensity or purity of a color

**Quiz**

Q1: Why is CMY called subtractive?
- A) It emits extra light
- B) It absorbs wavelengths from white light ✓
- C) It rotates hue angles
- D) It uses grayscale only

*Explanation: Pigments absorb wavelengths, effectively subtracting light from the reflected result.*

Q2: Which set is the subtractive primary trio?
- A) Red, green, blue
- B) Cyan, magenta, yellow ✓
- C) Orange, purple, green
- D) Black, white, gray

*Explanation: CMY are the subtractive primaries used by print workflows.*

---

### Puzzle 3: Chromatic Black

**Introduction**

Shows how dark areas can retain subtle hue rather than becoming neutral black; useful for painting and shadow work.

Complementary pigments neutralize toward dark neutrals while preserving subtle color life.

**How to win**

Make the shadowed patch match the reference by adjusting local chroma and hue.

**Why this fails**

Low luminance reduces perceived saturation but hue bias remains, so shadows keep a tint.

**Key terms**
- chroma: the intensity or purity of a color
- complement: the color directly opposite on the color wheel
- value: lightness or darkness of a color

**Quiz**

Q1: Why can a shadowed area still look slightly colored?
- A) Because low light reduces brightness but not all hue information disappears ✓
- B) Because shadows create new pigments
- C) Because the eye cannot see color in dark areas at all

*Explanation: Perception preserves hue cues even at low luminance.*

Q2: When matching a painted shadow, which slider is most important to adjust first?
- A) Chroma (saturation) to keep the hue visible without raising brightness ✓
- B) Hue only; brightness never matters
- C) Increase brightness to remove the tint

*Explanation: Lowering chroma keeps the tint while preserving darkness.*

---

## Station 2 — Value Sketchboard

### Puzzle 4: Value and Squint Readability

**Introduction**

Value means lightness and darkness, independent of hue. Good value structure keeps subjects readable even when detail is blurred.

Artists squint to simplify scenes into big value masses. If the image reads while blurred, the structure is usually strong.

**How to win**

Paint each block so the statue remains clearly readable when the screen blurs — use strong light-dark contrast.

**Why this fails**

When values are too similar, the blur makes the subject disappear into the background.

**Key terms**
- value: lightness or darkness of a color
- contrast: the difference in value between adjacent areas

**Quiz**

Q1: What does squinting help you evaluate?
- A) Brush texture only
- B) Fine line detail
- C) Overall value structure ✓
- D) Pigment brand quality

*Explanation: Squinting suppresses detail so light-dark relationships become obvious.*

Q2: Value refers to a color's …
- A) Saturation
- B) Temperature
- C) Lightness or darkness ✓
- D) Pigment cost

*Explanation: Value is the light-dark scale of a color.*

---

### Puzzle 5: Ordering a Value Ladder

**Introduction**

A value ladder arranges tones from darkest to lightest. Practicing this trains perception for stronger composition decisions.

When values are in the right order, hidden structure appears clearly. Out-of-order values break readability and hierarchy.

**How to win**

Drag the tiles into order from darkest to lightest — the hidden image appears when the sequence is correct.

**Why this fails**

Out-of-order values break the tonal gradient and the hidden structure stays invisible.

**Key terms**
- value: lightness or darkness of a color
- value ladder: a sequence of tones arranged from dark to light

**Quiz**

Q1: A value ladder should run from …
- A) Warm to cool
- B) Dark to light ✓
- C) Saturated to dull
- D) Hue A to hue B

*Explanation: Value ladders are about tonal progression, not hue shifts.*

Q2: Why is value ordering useful?
- A) It improves color naming
- B) It reveals visual structure ✓
- C) It removes contrast
- D) It prevents blending

*Explanation: Correct value order clarifies form and readability.*

---

### Puzzle 6: Chroma Peaks by Hue

**Introduction**

Explains that maximum saturation (chroma) varies by hue; some colors reach higher vividness than others.

Understanding hue-specific chroma limits helps you avoid muddy mixes and place saturation where it naturally works best.

**How to win**

Match the vividness of the target by adjusting chroma while keeping hue constant.

**Why this fails**

Different hues have different maximum chroma, so equal slider values don't always match perceived vividness.

**Key terms**
- chroma: the intensity or purity of a color
- saturation: similar to chroma; degree of colorfulness
- peak chroma: highest saturation a hue can reach
- value: lightness or darkness of a color

**Quiz**

Q1: What does 'peak chroma' mean?
- A) The highest saturation a hue can reach before it changes appearance ✓
- B) The brightest possible color regardless of hue
- C) When a color becomes black

*Explanation: Each hue has a different maximum saturation in a given color space.*

Q2: If two hues use the same chroma slider value but one looks more vivid, why?
- A) Because that hue's peak chroma is higher, so the same value maps to stronger appearance ✓
- B) Because the screen is broken
- C) Because vividness is unrelated to chroma

*Explanation: Perceptual mapping between numeric chroma and visible vividness differs by hue.*

---

## Station 3 — Color Wheel Table

### Puzzle 7: Complementary Pairs

**Introduction**

Complementary colors sit opposite each other on the color wheel. Side by side they intensify contrast.

Mixed together, complements neutralize toward grays and browns. That dual behavior makes them powerful for both pop and control.

**How to win**

Identify and select the color that sits directly opposite each given swatch on the color wheel.

**Why this fails**

Choosing an adjacent or nearby hue instead of the true opposite leaves contrast too low and the pair loses energy.

**Key terms**
- complement: the color directly opposite on the color wheel
- hue: the named quality of a color such as red, blue, or yellow

**Quiz**

Q1: What is true about complements when placed side by side?
- A) They mute each other visually
- B) They increase each other's intensity ✓
- C) They become grayscale
- D) They lose contrast

*Explanation: Simultaneous contrast makes complements appear more vivid together.*

Q2: Which pair is complementary?
- A) Yellow and purple ✓
- B) Yellow and orange
- C) Blue and green
- D) Red and orange

*Explanation: Yellow and purple are opposite on most standard wheels.*

---

### Puzzle 8: Triadic Harmony

**Introduction**

A triad uses three hues spaced evenly around the wheel, roughly 120 degrees apart. This creates energetic but balanced contrast.

Triads work best when one hue leads and the others support. Equal dominance can feel noisy, so hierarchy matters.

**How to win**

Choose three hues roughly 120° apart and assign one as the dominant color with the others as accents.

**Why this fails**

Giving all three hues equal area creates visual noise — one hue must lead for the palette to feel balanced.

**Key terms**
- hue: the named quality of a color such as red, blue, or yellow
- saturation: degree of colorfulness
- triadic: three hues spaced evenly around the color wheel

**Quiz**

Q1: How far apart are triadic hues on the wheel?
- A) About 45°
- B) About 90°
- C) About 120° ✓
- D) About 180°

*Explanation: Triadic palettes are based on near-equal 120° spacing.*

Q2: A good triad usually has …
- A) No dominant hue
- B) One dominant hue with supporting accents ✓
- C) Only neutrals
- D) Only warm colors

*Explanation: Hierarchy keeps triads balanced and readable.*

---

### Puzzle 9: Mood Palettes

**Introduction**

Color combinations carry emotional tone before any words are read. Warm, high-energy palettes feel different from cool, quiet ones.

Palette design combines hue, value contrast, and saturation control. Matching mood requires the full relationship, not a single swatch.

**How to win**

Build a palette that matches the emotional prompt by combining hue temperature, value contrast, and saturation level.

**Why this fails**

Changing only one dimension (e.g., hue alone) rarely shifts the emotional read — all three dimensions work together.

**Key terms**
- hue: the named quality of a color such as red, blue, or yellow
- value: lightness or darkness of a color
- saturation: degree of colorfulness

**Quiz**

Q1: Which palette direction is usually calmer?
- A) High-contrast warm reds
- B) Cooler, softer contrasts ✓
- C) Neon complements only
- D) Pure black and white

*Explanation: Cool and lower-contrast palettes often read as calmer.*

Q2: Mood palettes are built from …
- A) Only hue names
- B) Hue, value contrast, and saturation ✓
- C) Brush size only
- D) Station unlock order

*Explanation: Emotional tone depends on multiple color dimensions together.*

---

## Station 4 — Optical Illusion Wall

### Puzzle 10: Same-Square Illusion

**Introduction**

Perceived color depends on surrounding context. Two identical squares can look different when backgrounds shift.

This effect, called simultaneous contrast, proves color is relational. Designers use context shifts to guide attention and perception.

**How to win**

Adjust the background colors until both center squares look identical — that is when context is neutralized.

**Why this fails**

A lighter background makes the center appear darker, and vice versa, so mismatched backgrounds hide the equality.

**Key terms**
- simultaneous contrast: a color's appearance shifts depending on neighboring colors
- value: lightness or darkness of a color

**Quiz**

Q1: In simultaneous contrast, identical center colors can look …
- A) Exactly the same always
- B) Different because of surroundings ✓
- C) Invisible
- D) Fully saturated

*Explanation: Context shifts how the visual system interprets a color.*

Q2: This illusion demonstrates that color perception is …
- A) Absolute
- B) Random
- C) Relative ✓
- D) Mechanical only

*Explanation: Perception is relative to neighboring colors and values.*

---

### Puzzle 11: Make Gray Read Blue

**Introduction**

Demonstrates simultaneous contrast: surrounding colors change how a neutral patch is perceived.

Orange context pushes neighboring gray toward a blue impression — a practical way to suggest cool light indirectly.

**How to win**

Adjust the surround color so the central grey appears bluish to match the target.

**Why this fails**

Warm surrounds bias neutrals toward cool complements, and vice versa.

**Key terms**
- complement: the color directly opposite on the color wheel
- saturation: degree of colorfulness
- simultaneous contrast: a color's appearance shifts depending on neighboring colors

**Quiz**

Q1: Which surrounding color will make a neutral grey appear bluer?
- A) Orange ✓
- B) Green
- C) Black

*Explanation: Orange is the warm complement that shifts perceived neutral toward blue.*

Q2: If the grey still looks neutral after adding orange surround, what should you try?
- A) Increase the surround's saturation or brightness to strengthen the contrast effect ✓
- B) Make the grey darker; contrast doesn't depend on surround intensity
- C) Change the grey's hue to red

*Explanation: Stronger surrounding chroma/brightness increases contrast-driven perceptual shifts.*

---

### Puzzle 12: Neutral Hero

**Introduction**

A bright accent has the strongest impact when most of the composition is neutral. Neutrals create breathing room.

If everything is loud, nothing leads. Strategic restraint with saturation builds hierarchy and focus.

**How to win**

Mix neutral grays and browns for most of the composition so the single bright accent color stands out clearly.

**Why this fails**

Adding too many saturated areas competes with the accent and flattens the visual hierarchy.

**Key terms**
- saturation: degree of colorfulness
- chroma: the intensity or purity of a color
- complement: the color directly opposite on the color wheel

**Quiz**

Q1: What helps an accent color pop most?
- A) Many competing saturated colors
- B) Mostly neutral surroundings ✓
- C) Lower contrast
- D) Only grayscale accents

*Explanation: Neutrals reduce competition and emphasize the accent.*

Q2: Why avoid many high-saturation focal colors?
- A) It weakens visual hierarchy ✓
- B) It speeds rendering
- C) It increases depth automatically
- D) It fixes values

*Explanation: Too many accents compete and flatten emphasis.*

---

## Station 5 — Window Landscape

### Puzzle 13: Atmospheric Depth

**Introduction**

Distant objects usually look cooler, lighter, and less saturated. Edge contrast also softens with distance.

These cues create depth on flat surfaces. Painting near and far planes with the same chroma and sharpness collapses space.

**How to win**

Paint each depth plane with progressively cooler, lighter, and less saturated tones as objects move into the distance.

**Why this fails**

Using the same chroma and edge sharpness at every distance removes the depth cues that make space readable.

**Key terms**
- saturation: degree of colorfulness
- chroma: the intensity or purity of a color
- value: lightness or darkness of a color
- atmospheric perspective: the effect of air on distant color

**Quiz**

Q1: As objects move farther away, they usually become …
- A) Warmer and sharper
- B) Cooler and less saturated ✓
- C) More contrasted
- D) More detailed

*Explanation: Atmosphere tends to cool and desaturate distant forms.*

Q2: Which cue commonly decreases with distance?
- A) Edge softness
- B) Atmospheric haze
- C) Contrast clarity ✓
- D) Blue shift

*Explanation: Perceived contrast clarity drops at distance.*

---

### Puzzle 14: Rayleigh Scattering

**Introduction**

Air molecules scatter short wavelengths more strongly than long wavelengths. This is why clear skies read blue.

The same principle contributes to distant blue haze. Increasing scattering in a scene should shift far objects toward cooler tones.

**How to win**

Increase the atmospheric scattering slider to shift distant objects toward a cooler, hazier blue tone.

**Why this fails**

Too little scattering keeps distant objects the same warm color as near ones, collapsing perceived depth.

**Key terms**
- Rayleigh scattering: air molecules deflect short wavelengths more than long ones
- wavelength: the physical property that determines a light color
- value: lightness or darkness of a color

**Quiz**

Q1: Rayleigh scattering affects which wavelengths more strongly?
- A) Long red wavelengths
- B) Short blue wavelengths ✓
- C) All equally
- D) Only infrared

*Explanation: Shorter wavelengths scatter more in the atmosphere.*

Q2: A practical visual result is that distant objects often look …
- A) Warmer
- B) Sharper
- C) Bluer ✓
- D) More saturated

*Explanation: Atmospheric scattering commonly cools distance color.*

---

### Puzzle 15: Time-of-Day Palette Shift

**Introduction**

Light color temperature changes through the day. Midday tends cooler and higher contrast, while golden hour is warmer with longer shadows.

Strong landscape color decisions depend on matching palette and light behavior together, not one isolated slider.

**How to win**

Match the sliders to the target time of day by coordinating light color temperature, shadow length, and contrast level.

**Why this fails**

Adjusting only the hue without changing contrast or shadow angle produces an unconvincing lighting impression.

**Key terms**
- color temperature: a scale from warm (orange) to cool (blue) light
- value: lightness or darkness of a color
- saturation: degree of colorfulness

**Quiz**

Q1: Golden hour light is generally …
- A) Cool and harsh
- B) Warm and lower-angle ✓
- C) Neutral and flat
- D) Green-dominant

*Explanation: Low-angle sunlight shifts warmer and stretches shadows.*

Q2: To recreate convincing time-of-day, you should coordinate …
- A) Only hue
- B) Palette plus light behavior ✓
- C) Only shadow sharpness
- D) Only saturation

*Explanation: Believable lighting needs multiple linked parameters.*

---

## Station 6 — Paint Workbench

### Puzzle 16: Vibrant Green Mixing

**Introduction**

Vivid green usually comes from a clean yellow-blue pair with compatible bias. Not all pigments mix equally cleanly.

If hidden complement contamination enters the mix, chroma drops fast and greens become muddy. Selection and cleanliness both matter.

**How to win**

Select a clean cool yellow and a clean warm blue to mix — the swatch should reach a vivid, unsullied green.

**Why this fails**

Pigments with hidden red or orange bias introduce complement contamination that neutralizes the green chroma.

**Key terms**
- chroma: the intensity or purity of a color
- complement: the color directly opposite on the color wheel
- pigment bias: the hidden secondary hue leaning of a paint

**Quiz**

Q1: What is the key to a vibrant mixed green?
- A) Any yellow and any blue
- B) A clean yellow-blue pairing with low contamination ✓
- C) Adding black
- D) Adding red

*Explanation: Bias and contamination strongly affect green chroma.*

Q2: What usually causes muddy green in this context?
- A) Too little paint
- B) Complement contamination ✓
- C) Using one pigment only
- D) Using cool hues

*Explanation: Hidden opposite-bias pigments neutralize saturation.*

---

### Puzzle 17: Mud Monster

**Introduction**

Complementary pairs are powerful neutralizers. A little can be useful, but too many mixed together quickly create dull mud.

Intentional mixing means limiting opposing pairs and preserving separation until you know exactly what neutral you want.

**How to win**

Add pigments one at a time and stop before the mix becomes a dull neutral — the goal is a rich dark, not mud.

**Why this fails**

Each additional complement pair neutralizes chroma further; too many makes an irreversibly dull brown.

**Key terms**
- complement: the color directly opposite on the color wheel
- chroma: the intensity or purity of a color
- saturation: degree of colorfulness

**Quiz**

Q1: What happens when too many complements are mixed together?
- A) Color gets cleaner
- B) Color neutralizes into mud ✓
- C) Value increases only
- D) Hue rotates predictably

*Explanation: Multiple complement interactions can collapse chroma quickly.*

Q2: A practical anti-mud strategy is to …
- A) Mix everything at once
- B) Limit complement pair additions ✓
- C) Use only white paint
- D) Avoid saturation entirely

*Explanation: Controlled additions keep mixtures intentional.*

---

### Puzzle 18: Optical Mixing

**Introduction**

Optical mixing happens in the viewer's eye when tiny pure dots sit side by side. The eye blends them at distance.

Because pigments stay unmixed on the surface, color can feel brighter than physical mixing on a palette.

**How to win**

Place pure colored dots side by side without mixing them — step back and the eye blends them into a new color.

**Why this fails**

Physically mixing the dots on the canvas loses the brightness advantage because pigments combine subtractively.

**Key terms**
- optical mixing: color blending that happens in the viewer's eye rather than on the canvas
- additive: mixing by adding light wavelengths together
- subtractive: mixing by absorbing wavelengths from reflected light

**Quiz**

Q1: Optical mixing occurs mainly …
- A) On the palette
- B) In the viewer's perception ✓
- C) In drying medium
- D) In grayscale only

*Explanation: The blend is perceptual, not physically premixed pigment.*

Q2: Why use pure dots for this effect?
- A) To reduce value
- B) To preserve pigment intensity ✓
- C) To avoid contrast
- D) To flatten form

*Explanation: Keeping dots pure retains stronger local color energy.*

---

## Station 7 — Design Studio

### Puzzle 19: 60/30/10 Balance

**Introduction**

The 60/30/10 rule gives compositions stable proportion: dominant, supporting, and accent roles.

Balanced proportion prevents visual noise and helps viewers understand hierarchy instantly.

**How to win**

Set proportion sliders so the dominant color covers ~60%, the secondary ~30%, and the accent ~10%.

**Why this fails**

Equal proportions remove hierarchy — the viewer has no clear entry point and the composition feels noisy.

**Key terms**
- hue: the named quality of a color such as red, blue, or yellow
- saturation: degree of colorfulness
- value: lightness or darkness of a color

**Quiz**

Q1: In the 60/30/10 rule, the dominant color should be about …
- A) 10%
- B) 30%
- C) 60% ✓
- D) 90%

*Explanation: Dominant color typically covers around 60%.*

Q2: What is the main benefit of this proportion rule?
- A) Faster rendering
- B) Clear hierarchy and harmony ✓
- C) Eliminating accents
- D) Removing contrast

*Explanation: It creates a readable balance of emphasis.*

---

### Puzzle 20: Color and Emotion

**Introduction**

Explores common color–emotion associations and how context changes meaning.

Red often signals urgency, blue trust, yellow optimism, and green growth — though cultural context can shift these baselines.

**How to win**

Arrange colors to match the target emotional palette while noting contextual cues.

**Why this fails**

Emotional associations are broadly consistent but vary by culture and context.

**Key terms**
- saturation: degree of colorfulness
- value: lightness or darkness of a color

**Quiz**

Q1: Which color is most commonly associated with calm in Western contexts?
- A) Blue ✓
- B) Red
- C) Yellow

*Explanation: Blue is frequently linked to calm and stability in many Western studies.*

Q2: If a user in a different cultural region finds your 'calm' palette unsettling, what should you do?
- A) Offer a regional variant or let users choose alternative palettes ✓
- B) Insist blue is universally calming
- C) Remove color from the interface entirely

*Explanation: Associations differ across cultures; allow customization where possible.*

---

### Puzzle 21: Chromatic Vibration

**Introduction**

Strong vibration appears when complementary hues meet at similar value and high saturation. The edge can seem to shimmer.

If value contrast becomes too high, the boundary stabilizes. Equal value with complementary hue is the unstable sweet spot.

**How to win**

Set two complementary hues to the same brightness level — the edge between them should shimmer or appear to vibrate.

**Why this fails**

If value contrast is too high, the eye reads a clear light/dark boundary and the vibration effect disappears.

**Key terms**
- complement: the color directly opposite on the color wheel
- value: lightness or darkness of a color
- chroma: the intensity or purity of a color
- chromatic vibration: optical shimmer at the border of complementary equal-value colors

**Quiz**

Q1: Chromatic vibration is strongest when hues are …
- A) Analogous and low saturation
- B) Complementary and high saturation ✓
- C) Monochrome and low value
- D) Random and neutral

*Explanation: Complementary high-chroma pairs intensify boundary conflict.*

Q2: What value relationship increases vibration?
- A) Large value contrast
- B) Equal or near-equal value ✓
- C) Pure black against white
- D) Any random value

*Explanation: Near-equal value reduces clear edge priority and boosts shimmer.*

---

# Implementation Status (March 2026)

This section tracks implementation against this story plan and `game-architecture.md`.

## Bug Fixes Applied (March 2026 — post-Design Studio merge)

- **Puzzle-list hiding on solve (puzzle 19–21):** `addCheckButton` in `legacyGame.ts` was clearing `activeStationId` whenever `finalCanvasUnlocked` was already true, collapsing to studio view on every solve in Station 7. Fixed to only clear on the locked→unlocked transition.
- **Pet count HUD overflow:** `updateHud()` hardcoded `/18`; replaced with dynamic `progress.total`.
- **Chromatic Vibration (puzzle-21) never solved:** Complement-distance formula `Math.abs(((hueB - hueA + 540) % 360) - 180)` yielded 180 (not 0) for true complements (e.g. hueA=0, hueB=180). Replaced with `(((hueB - hueA) % 360) + 360) % 360` giving normalised delta, then `|delta - 180|`.
- **Practice mode always failing for puzzle-20 and puzzle-21:** `validatePuzzleInput()` switch had no cases for these two puzzles; added correct validators matching their core logic.
- All progression values (milestone thresholds, final-canvas unlock, auto-solve loop, HUD total) are now fully dynamic — no hardcoded 18s remain in the codebase.
- 22/22 unit tests pass; TypeScript build clean after fixes.

---

## Completed in code (`src/`)

- Modular architecture scaffold: scene manager, station manager, puzzle manager, pet manager, save system
- Domain models: player, station, puzzle, pet, puzzle states/types, station types, pet types
- Story content mapping: 6 main stations + 1 bonus station, 18 core puzzles + 3 bonus puzzles (21 total), 18 core pets + 3 bonus pets (21 total), caretaker intro lines, final canvas requirements
- Progression flow:
	- first station unlocked at start
	- puzzle chaining inside each station
	- next station unlock on station completion
	- final canvas unlock at 18 pets
- Color engine utilities: RGB/CMY mix, complement, atmospheric perspective, optical mixing
- Puzzle validation rules implemented for all 21 puzzles with story-specific checks
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
	- Puzzle-19 (Color Balance 60/30/10): interactive composition bar showing primary/secondary/accent proportions with live hue pickers and percentage sliders; bonus station unlocks after completing all 6 main stations
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
  - Pet collection milestones: 6 pets → "Color Apprentice", 12 → "Palette Keeper", 21 → "Chromatic Master" (threshold is dynamic — always the full puzzle count)
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