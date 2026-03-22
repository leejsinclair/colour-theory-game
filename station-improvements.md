Global rules to apply to every puzzle
Replace long intros with a two-line plain description (max two sentences).

Insert the microcopy block (Intro / How to win / Why this failed / Quiz / Accessibility note) immediately after the existing intro paragraph for each puzzle.

Quiz format: two questions — Q1 conceptual, Q2 applied. Each question must include: three options (A correct, B plausible distractor, C plausible distractor) and a one-line Why rationale for the correct option.

Distractor rules: make distractors plausible and tied to common misconceptions; avoid obviously wrong or silly options. Avoid absolutes like “always/never.”

Tooltips: add a one-line tooltip list at the end of the puzzle for any technical terms used (value, chroma, saturation, complement, additive, subtractive).

Accessibility: add **Accessibility note:** line that requires textual feedback for color-only cues and keyboard focusable controls.

Tone & length: keep language plain, active voice, and under 40 words for each microcopy line.

```
**Intro:** [Two-line plain description of what this puzzle demonstrates.]

**How to win:** **How to win:** [One clear action the player must take to succeed.]

**Why this failed:** [One-line explanation of the perceptual principle that causes failure.]

**Quiz:**  
- **Q1 (conceptual):** [Question text]  
  - **A:** [Correct answer] — **Why:** [One-line rationale]  
  - **B:** [Plausible distractor]  
  - **C:** [Plausible distractor]  
- **Q2 (applied):** [Question text]  
  - **A:** [Correct answer] — **Why:** [One-line rationale]  
  - **B:** [Plausible distractor]  
  - **C:** [Plausible distractor]

**Accessibility note:** Provide textual feedback for color-only cues and ensure controls are keyboard accessible.

**Tooltips:** **value**; **chroma**; **saturation**; **complement**; **additive**; **subtractive**.
```

Per‑puzzle edit instructions
Use the exact phrasing guidance below for each named puzzle. Replace bracketed text with puzzle‑specific values where indicated.

Station 1 — RGB White Light
Intro: Replace existing intro with: **Intro:** Demonstrates additive color mixing used by light sources such as screens and projectors. Learn how red, green and blue combine to make white light.

How to win: **How to win:** Make the center patch appear white by adjusting the three sliders to match emitted light proportions.

Why this failed: **Why this failed:** Overlapping emitted wavelengths add, so mismatched intensities produce tinted whites.

Quiz Q1 (conceptual):

Question: Why do screens use red, green and blue to make many colors?

A (correct): Because emitted light wavelengths add to form other colors. — Why: Additive mixing combines light intensities to create new perceived colors.

B: Because pigments reflect those three colors.

C: Because human eyes only see red, green and blue.

Quiz Q2 (applied):

Question: If you increase the green slider while red and blue stay the same, what happens to the perceived color?

A (correct): It shifts toward green and may become lighter. — Why: Adding more green increases that wavelength’s contribution and overall luminance.

B: It becomes darker because colors cancel out.

C: It turns into a neutral grey.

Accessibility: Ensure textual labels for slider values and a non‑color success message.

Station 3 — Chromatic Black
Intro: **Intro:** Shows how dark areas can retain subtle hue rather than becoming neutral black; useful for painting and shadow work.

How to win: **How to win:** Make the shadowed patch match the reference by adjusting local chroma and hue.

Why this failed: **Why this failed:** Low luminance reduces perceived saturation but hue bias remains, so shadows keep a tint.

Quiz Q1 (conceptual):

Question: Why can a shadowed area still look slightly colored?

A (correct): Because low light reduces brightness but not all hue information disappears. — Why: Perception preserves hue cues even at low luminance.

B: Because shadows create new pigments.

C: Because the eye cannot see color in dark areas at all.

Quiz Q2 (applied):

Question: When matching a painted shadow, which slider is most important to adjust first?

A (correct): Chroma (saturation) to keep the hue visible without raising brightness. — Why: Lowering chroma keeps the tint while preserving darkness.

B: Hue only; brightness never matters.

C: Increase brightness to remove the tint.

Accessibility: Provide a text description of the shadow difference and keyboard controls for adjustments.

Station 6 — Chroma Peaks
Intro: **Intro:** Explains that maximum saturation (chroma) varies by hue; some colors reach higher vividness than others.

How to win: **How to win:** Match the vividness of the target by adjusting chroma while keeping hue constant.

Why this failed: **Why this failed:** Different hues have different maximum chroma, so equal slider values don’t always match perceived vividness.

Quiz Q1 (conceptual):

Question: What does “peak chroma” mean?

A (correct): The highest saturation a hue can reach before it changes appearance. — Why: Each hue has a different maximum saturation in a given color space.

B: The brightest possible color regardless of hue.

C: When a color becomes black.

Quiz Q2 (applied):

Question: If two hues use the same chroma slider value but one looks more vivid, why?

A (correct): Because that hue’s peak chroma is higher, so the same numeric value maps to stronger appearance. — Why: Perceptual mapping between numeric chroma and visible vividness differs by hue.

B: Because the screen is broken.

C: Because vividness is unrelated to chroma.

Tooltips: Add peak = highest saturation for a hue to the Tooltips line.

Accessibility: Add textual guidance explaining vividness differences.

Station 11 — Make Grey Look Blue
Intro: **Intro:** Demonstrates simultaneous contrast: surrounding colors change how a neutral patch is perceived.

How to win: **How to win:** Adjust the surround color so the central grey appears bluish to match the target.

Why this failed: **Why this failed:** Warm surrounds bias neutrals toward cool complements, and vice versa.

Quiz Q1 (conceptual):

Question: Which surrounding color will make a neutral grey appear bluer?

A (correct): Orange. — Why: Orange is the warm complement that shifts perceived neutral toward blue.

B: Green.

C: Black.

Quiz Q2 (applied):

Question: If the grey still looks neutral after adding orange surround, what should you try next?

A (correct): Increase the surround’s saturation or brightness to strengthen the contrast effect. — Why: Stronger surrounding chroma/brightness increases contrast-driven shifts.

B: Make the grey darker; contrast doesn’t depend on surround intensity.

C: Change the grey’s hue to red.

Accessibility: Provide a text description of the contrast effect and an option to toggle high‑contrast mode.

Station 20 — Emotional Mapping
Intro: **Intro:** Explores common color–emotion associations and how context changes meaning.

How to win: **How to win:** Arrange colors to match the target emotional palette while noting contextual cues.

Why this failed: **Why this failed:** Emotional associations are common but vary by culture and context.

Quiz Q1 (conceptual):

Question: Which color is most commonly associated with calm in Western contexts?

A (correct): Blue. — Why: Blue is frequently linked to calm and stability in many Western studies.

B: Red.

C: Yellow.

Quiz Q2 (applied):

Question: If a user in a different cultural region finds your “calm” palette unsettling, what should you do?

A (correct): Offer a regional variant or let users choose alternative palettes. — Why: Associations differ across cultures; allow customization.

B: Insist blue is universally calming.

C: Remove color from the interface entirely.

Accessibility: Add a note that emotional cues must not be the only signal for important UI states.

Catch‑all for any other puzzle not listed
For every other puzzle section in storyplan.md that Copilot finds:

Apply the Microcopy template exactly.

Q1 should test the core perceptual principle the puzzle demonstrates.

Q2 should be an applied troubleshooting question (what to change if the effect persists).

Make distractors reflect two common misconceptions about that principle.

Add Accessibility and Tooltips lines.

QA checks to include in the PR
Add a unit test that parses storyplan.md and asserts each puzzle section contains How to win: and Why this failed:.

Add a unit test that each quiz question includes a — Why: rationale line for the correct option.

Add a lint rule or CI check that flags quiz options containing the phrase They cancel out and suggests replacement.