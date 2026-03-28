export const puzzleObjectives: Record<string, string> = {
  "puzzle-01": "Align red, green, and blue beams so they overlap into white light.",
  "puzzle-02": "Match the target swatch by dialing cyan, magenta, and yellow correctly.",
  "puzzle-03": "Mix complementary pigments to create a rich luminous black.",
  "puzzle-04": "Keep the grayscale structure readable when the image is blurred.",
  "puzzle-05": "Order value tiles from darkest to lightest to reveal the hidden mark.",
  "puzzle-06": "Explore each hue branch and discover that chroma peaks differ by hue.",
  "puzzle-07": "Pick true complementary pairs across the wheel.",
  "puzzle-08": "Space three hues around 120deg apart to form a triadic harmony.",
  "puzzle-09": "Match each mood to its correct colour palette.",
  "puzzle-10": "Adjust surrounds until the two identical center squares look the same.",
  "puzzle-11": "Use orange context to make the fixed grey square read as cooler/blue.",
  "puzzle-12": "Use neutrals so a single accent color stands out clearly.",
  "puzzle-13": "Apply depth cues: softer edges, lower saturation, and cooler distance hues.",
  "puzzle-14": "Increase atmospheric scattering so far objects shift toward blue.",
  "puzzle-15": "Stage 1: drag each palette onto its time-of-day card. Stage 2: adjust sun, atmosphere, and temperature to recreate golden hour.",
  "puzzle-16": "Choose one yellow-family and one blue-family pigment, then keep contamination low for vibrant green.",
  "puzzle-17": "Avoid overmixing complements to prevent muddy results.",
  "puzzle-18": "Paint pure color dots and reach enough coverage for optical blending.",
  "puzzle-19": "Allocate 60% to primary, 30% to secondary, and 10% to accent so the proportions sum to 100%.",
  "puzzle-20": "Match each colour swatch to its primary psychological association: red→excitement, blue→trust, yellow→optimism, green→growth.",
  "puzzle-21": "Tune two hues to be complementary and balance their lightness until optical vibration reaches 100%.",
  "puzzle-23": "Compare warm, cool, and neutral lighting views, then choose the swatch that represents the object's true surface colour.",
};

export const puzzleConcepts: Record<string, { title: string; body: string }> = {
  "puzzle-01": {
    title: "Additive Color Mixing (RGB Light)",
    body: "Light mixes additively: red + green = yellow, red + blue = magenta, green + blue = cyan, and red + green + blue together create white. This is how screens and stage lighting work — each beam adds brightness. Overlapping all three primary light beams at full intensity produces pure white light.",
  },
  "puzzle-02": {
    title: "Subtractive Color Mixing (CMY Print)",
    body: "Ink and pigment absorb (subtract) light rather than emitting it. The three subtractive primaries are Cyan, Magenta, and Yellow. Mixing all three at full strength absorbs most visible wavelengths, producing black. Adjusting each channel shifts the hue, saturation, and lightness of the printed result.",
  },
  "puzzle-03": {
    title: "Chromatic Black",
    body: "A pure black from the tube can look flat and lifeless. Painters mix complementary pigments — colors opposite each other on the color wheel (e.g. red + green, blue + orange) — to create rich, luminous darks called chromatic blacks. These blacks carry hidden color that makes shadows vibrate with life rather than sink into dullness.",
  },
  "puzzle-04": {
    title: "Value Structure and the Squint Test",
    body: "Value is the lightness or darkness of a color, independent of hue. A strong value structure keeps a painting readable even at a distance or when squinted at — details blur away, leaving only the pattern of lights and darks. Artists use the squint test to check that the big shapes read clearly before adding color.",
  },
  "puzzle-05": {
    title: "The Value Scale",
    body: "A value scale runs from pure black (0) through a series of grays to pure white (10). Training your eye to see and sort values accurately is foundational to painting and design. Hidden imagery only becomes visible when values are arranged in the correct order, revealing the underlying structure of the image.",
  },
  "puzzle-06": {
    title: "Chroma Tree and Hue-Dependent Saturation",
    body: "Chroma (saturation) does not peak at the same value for every hue. Yellow reaches maximum chroma near a light value, while blue-violet peaks near a dark value. This is the Munsell color system's key insight: each hue climbs its own 'chroma tree,' and ignoring this leads to muddy mixes. Understanding where each hue's chroma peaks helps you mix cleaner, more vibrant colors.",
  },
  "puzzle-07": {
    title: "Complementary Color Pairs",
    body: "Complementary colors sit directly opposite each other on the color wheel: red–green, blue–orange, yellow–purple. When placed side by side they intensify each other through simultaneous contrast. When mixed as pigments they neutralize each other toward gray or brown. Knowing true complements is essential for creating vibrant color contrast and controlled neutrals.",
  },
  "puzzle-08": {
    title: "Triadic Color Harmony",
    body: "A triadic harmony uses three hues spaced equally around the color wheel — approximately 120° apart. This creates a vibrant, balanced palette with high contrast while still feeling unified. Examples include red–yellow–blue (primary triad) and orange–green–violet (secondary triad). One hue typically dominates while the others serve as accents.",
  },
  "puzzle-09": {
    title: "Color Psychology and Mood Palettes",
    body: "Color carries emotional associations shaped by culture and biology. Warm, saturated hues (reds, oranges, yellows) feel energetic and festive. Cool, desaturated hues (blues, grays) feel calm or melancholy. Low contrast palettes feel quiet; high contrast palettes feel dynamic. Designers and artists deliberately build palettes to evoke specific emotional responses in the viewer.",
  },
  "puzzle-10": {
    title: "Simultaneous Contrast and the Same-Square Illusion",
    body: "The famous checker-shadow illusion demonstrates that our brain judges color relative to its surroundings, not in absolute terms. Two physically identical gray squares can look dramatically different depending on what sits next to them. This simultaneous contrast effect means context is as powerful as pigment — a color 'changes' simply by changing its neighbors.",
  },
  "puzzle-11": {
    title: "Color Relativity: Making Grey Look Blue",
    body: "Surrounding a neutral gray with warm orange tones causes the gray to appear cooler and bluer by contrast — even though the gray itself never changes. This is simultaneous color contrast in action: the visual system exaggerates differences between adjacent colors. Artists exploit this to suggest cool shadows without using much actual blue pigment.",
  },
  "puzzle-12": {
    title: "The Neutral Hero Principle",
    body: "A single accent color gains maximum impact when surrounded by neutrals — grays, off-whites, or desaturated earth tones. Neutrals don't compete; they recede and let the accent pop. Overusing saturated colors dilutes their power. Deliberately reserving saturation for one key element creates visual hierarchy and draws the eye exactly where you want it.",
  },
  "puzzle-13": {
    title: "Atmospheric Perspective and Landscape Depth",
    body: "Objects further away look lighter, less saturated, and cooler in hue because particles in the atmosphere scatter and absorb light. Near objects have sharp edges, rich color, and strong contrast. Far objects shift toward pale blue-gray. This gradient of value, saturation, and hue temperature is one of the most powerful tools for creating the illusion of depth in landscape art.",
  },
  "puzzle-14": {
    title: "Rayleigh Scattering",
    body: "The sky is blue because air molecules scatter short (blue) wavelengths of sunlight more than long (red) wavelengths — a phenomenon called Rayleigh scattering. The same physics makes distant mountains appear blue-gray. Increasing simulated atmospheric scattering shifts far objects toward blue, accurately mimicking how deep atmosphere desaturates and cools distant forms.",
  },
  "puzzle-15": {
    title: "Time-of-Day Light and Golden Hour",
    body: "The color temperature of sunlight changes dramatically across the day. At noon, light is white-blue and harsh with short shadows. At golden hour — roughly the first and last hour of sunlight — the sun is near the horizon, light travels through more atmosphere, and short wavelengths scatter away, leaving warm orange-amber light with long soft shadows. Mastering these shifts is essential for convincing landscape and plein-air painting.",
  },
  "puzzle-16": {
    title: "Clean Pigment Mixing: Vibrant Green",
    body: "Not all yellows and blues make equally clean greens. Pair one yellow-family pigment with one blue-family pigment and watch for hidden red or purple bias that can muddy the result. Cooler, green-leaning pigments usually produce clearer mixes, while contamination quickly lowers saturation.",
  },
  "puzzle-17": {
    title: "Mud Prevention: Avoiding Complement Overload",
    body: "When complementary pigments (colors opposite on the color wheel) are mixed, they neutralize each other toward brown or gray mud. In Mud Monster, red touches raise base mud directly and also add extra neutralising pressure, so the real goal is keeping the effective mud bar below the fail threshold.",
  },
  "puzzle-18": {
    title: "Optical Color Mixing and Pointillism",
    body: "Pointillist painters like Seurat and Signac discovered that small dots of pure, unmixed color placed close together are blended by the eye and brain at a distance — a phenomenon called optical mixing. Unlike palette mixing, this keeps each pigment's full intensity. The result is a luminous, vibrating surface that feels more colorful than any single mixed pigment could achieve.",
  },
  "puzzle-19": {
    title: "The 60/30/10 Color Balance Rule",
    body: "The 60/30/10 rule is a classic proportion guideline used by interior designers and artists to create balanced, harmonious compositions. The dominant color fills roughly 60% of the space, establishing the mood and tone. A secondary color takes up about 30%, adding depth and supporting the primary. An accent color occupies just 10%, providing a focal point and visual interest without overwhelming the eye. Together, these proportions ensure the composition feels cohesive yet dynamic.",
  },
  "puzzle-20": {
    title: "Colour Psychology: Emotional Associations",
    body: "Colours carry powerful psychological associations shaped by biology, culture, and experience. Red stimulates the nervous system, evoking excitement, urgency, and passion — which is why it is used in warning signs and sale banners. Blue is linked to trust, calm, and stability, making it a favourite in corporate and healthcare design. Yellow activates optimism, warmth, and attention — the most visible colour in daylight. Green connects us to nature, balance, and growth. Understanding these associations allows artists and designers to guide emotional responses before a viewer reads a single word.",
  },
  "puzzle-21": {
    title: "Chromatic Vibration: Colour Boundaries That Shimmer",
    body: "When two highly saturated complementary colours — colours directly opposite each other on the colour wheel — are placed side by side at the same lightness (value), the boundary between them appears to vibrate or shimmer. This optical effect, studied by Josef Albers and the Op Art movement, occurs because the eye oscillates between the two hues, unable to lock onto either as figure or ground. The vibration is strongest when: (1) the hues are true complements, (2) their lightness is equal, and (3) saturation is high. Reducing any of these factors quiets the effect. Artists use chromatic vibration to create dynamic, energetic compositions that seem to pulse with life.",
  },
  "puzzle-23": {
    title: "Colour Constancy: Recovering Surface Colour Under Changing Light",
    body: "Colour constancy is the visual system's ability to keep an object's surface colour relatively stable even when illumination changes. A surface under tungsten light reflects warmer wavelengths than the same surface in blue daylight, yet we often still read it as the same material. The brain estimates the light source, compares neighboring cues, and discounts part of the cast. This is useful for everyday vision, but it also means apparent colour and actual reflected light can disagree. Artists, photographers, and interface designers all need to understand this gap between appearance and inferred surface colour.",
  },
};
