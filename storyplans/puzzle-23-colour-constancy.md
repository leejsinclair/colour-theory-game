# Puzzle 23 — Colour Constancy

## Overview

**Concept:**  
The visual system compensates for lighting conditions, causing perceived colour to differ from actual surface colour.

**Core Idea:**  
Players must identify the *true surface colour* of an object by comparing it across multiple lighting environments.

**Difficulty Tier:**  
Advanced (multi-context reasoning)

**Recommended Placement:**  
Station 8 — *Perception Lab* (or late Station 7 if no new station is added)

---

## Learning Goals

- Distinguish between:
  - apparent colour (lighting-dependent)
  - surface colour (intrinsic property)
- Understand that perception is an *interpretation*, not a direct reading
- Build comparison-based reasoning across multiple scenes

---

## Player-Facing Introduction (Text)

# Puzzle 23 — Colour Constancy

## Introduction

Colour is not as fixed as it appears.

What you perceive as the “true” colour of an object is not determined solely by the light entering your eyes, but by how your brain interprets that light in context. This phenomenon is known as **colour constancy** — the ability of the visual system to maintain the perceived colour of objects despite changes in lighting conditions.

For example, a white sheet of paper appears white whether viewed in bright sunlight, warm indoor lighting, or shadow. In reality, the wavelengths of light reaching your eyes are very different in each case. Your brain actively compensates for these differences, using surrounding colours, assumed light sources, and prior experience to stabilise perception.

This process is usually helpful — it allows us to navigate a changing world reliably. However, it can also lead to striking visual illusions, where the same colour appears dramatically different depending on its context.

In this puzzle, you will explore how surrounding colours and implied lighting conditions can alter perception, challenging your intuition about what is “really” there.

Understanding colour constancy is essential not only in art and design, but also in fields like computer vision, photography, and user interface design — wherever accurate or intentional colour perception matters.

---

## Core Mechanic

### Scene Setup

The player is shown **three simultaneous panels**:

1. Warm Light (Tungsten / Orange bias)
2. Cool Light (Daylight / Blue bias)
3. Neutral Light (Grey-balanced)

Each panel contains:
- The same object (e.g. cube, tile, sphere)
- Identical material properties
- Different lighting colour casts

---

### Player Task

Select the true surface colour from 4 swatches.

Constraints:
- One correct answer (surface colour)
- Three distractors:
  - Warm-shifted version
  - Cool-shifted version
  - Incorrect hue

---

## Interaction Flow

1. Player observes all three panels
2. Player compares colour shifts across lighting
3. Player selects one of four swatches
4. System evaluates answer
5. Feedback is shown
6. Repeat for 3 rounds (increasing subtlety)

---

## Optional Assist Mechanic (Recommended)

### Option A — Focus Toggle
Hover or click isolates the object (removes background influence)

### Option B — Neutral Flash
Briefly shows object under neutral light (1–2 seconds)

### Option C — Greyscale Mode
Temporarily removes colour to emphasise value consistency

---

## Success Condition

Player correctly identifies the surface colour in all 3 rounds

---

## Failure States & Feedback

### lighting_bias_misread
Trigger: Player selects a colour matching one specific lighting condition

Feedback:
That colour matches how the object appears under a specific light source.  
The true surface colour remains consistent — compare all scenes to find what does not change.

---

### context_ignored
Trigger: Player answers quickly without observing multiple panels

Feedback:
This puzzle cannot be solved from a single view.  
Compare the object across all lighting conditions.

---

### incorrect_hue_selection
Trigger: Completely incorrect hue

Feedback:
The surface colour is consistent across all scenes.  
Look for the underlying hue beneath the lighting shifts.

---

## Difficulty Scaling (3 Rounds)

### Round 1 — Obvious Shift
- Strong warm vs cool contrast
- Neutral panel clearly readable

### Round 2 — Moderate Shift
- Less saturated lighting
- Distractors more similar

### Round 3 — Subtle / Ambiguous
- Minimal neutral reference
- Lighting differences closer together
- Requires careful comparison

---

## Data Model (Example)

```ts
type LightingCondition = "warm" | "cool" | "neutral";

interface Puzzle23Round {
  baseColor: RGB; // true surface colour
  lighting: {
    warm: RGB;
    cool: RGB;
    neutral: RGB;
  };
  options: RGB[];
  correctIndex: number;
}
```

---

## Colour Transformation (Implementation Hint)

- Warm light:
  - increase red/orange channels
  - slightly reduce blue

- Cool light:
  - increase blue
  - slightly reduce red

- Maintain relative luminance to avoid giving away answer via brightness

---

## UI Requirements

- 3-panel layout (horizontal or triangular)
- Consistent object position across panels
- Clear separation of lighting environments
- Swatches displayed below panels
- Selection highlight + confirm interaction

---

## Reward

Constancy Chameleon  
A chameleon that refuses to change colour — it remains constant regardless of environment.

---

## Quiz

### Q1: Why does a white shirt appear orange under candlelight but still look “white”?

A) The shirt changes colour  
B) The brain corrects for the light source ✓  
C) Shadows alter the colour  
D) The eye switches to greyscale  

Explanation:  
The visual system compensates for lighting conditions to maintain stable perception of surfaces.

---

### Q2: What can colour constancy cause?

A) Perfect colour accuracy  
B) Perceived colours differing from actual wavelengths ✓  
C) Stronger complementary contrast  
D) Increased brightness perception  

Explanation:  
The brain’s correction can override raw sensory input, leading to differing interpretations.

---

## Key Terms

- colour constancy: the brain’s adjustment of perceived colour based on lighting  
- apparent colour: how a surface looks under specific illumination  
- surface colour: the intrinsic reflectance of a material  

---

## Implementation Notes

- Keep object geometry simple (cube or sphere)
- Avoid textures that introduce noise
- Ensure colour shifts are noticeable but not exaggerated