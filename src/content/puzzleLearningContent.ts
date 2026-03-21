export type LearningQuizQuestion = {
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
};

export type PuzzleLearningContent = {
  title: string;
  intro: [string, string];
  illustrationSvg: string;
  quiz: LearningQuizQuestion[];
};

function makePuzzleIllustration(label: string, c1: string, c2: string, c3: string): string {
  return `<svg viewBox="0 0 340 170" role="img" aria-label="${label} illustration" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#ffffff"/>
        <stop offset="100%" stop-color="#f3f6fa"/>
      </linearGradient>
      <linearGradient id="band" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="${c1}"/>
        <stop offset="50%" stop-color="${c2}"/>
        <stop offset="100%" stop-color="${c3}"/>
      </linearGradient>
    </defs>
    <rect x="2" y="2" width="336" height="166" rx="16" fill="url(#bg)" stroke="rgba(31,32,48,0.2)"/>
    <rect x="18" y="22" width="304" height="30" rx="10" fill="url(#band)" opacity="0.9"/>
    <circle cx="90" cy="102" r="28" fill="${c1}" opacity="0.85"/>
    <circle cx="170" cy="102" r="28" fill="${c2}" opacity="0.85"/>
    <circle cx="250" cy="102" r="28" fill="${c3}" opacity="0.85"/>
    <text x="170" y="150" text-anchor="middle" font-size="15" font-family="Space Grotesk, sans-serif" fill="#1f2030">${label}</text>
  </svg>`;
}

export const puzzleLearningContent: Record<string, PuzzleLearningContent> = {
  "puzzle-01": {
    title: "RGB White Light",
    intro: [
      "Screens and stage lights use additive color. Red, green, and blue beams stack brightness, so combining them creates lighter and lighter results.",
      "When all three beams overlap at full strength, they produce white light. Learning this helps you predict why digital color behaves differently from paint.",
    ],
    illustrationSvg: makePuzzleIllustration("Additive light overlap", "#ef4444", "#22c55e", "#3b82f6"),
    quiz: [
      {
        prompt: "In additive color mixing, what happens when red, green, and blue light overlap?",
        options: ["They produce white", "They produce black", "They produce brown", "They cancel out"],
        correctIndex: 0,
        explanation: "Additive primaries add brightness. Full RGB overlap appears white.",
      },
      {
        prompt: "Which system is additive rather than subtractive?",
        options: ["Ink printing", "Digital displays", "Watercolor pigments", "Oil paint"],
        correctIndex: 1,
        explanation: "Digital displays emit light, so they use additive color mixing.",
      },
    ],
  },
  "puzzle-02": {
    title: "CMY Printing Basics",
    intro: [
      "Pigments and inks work by subtraction: they absorb parts of white light and reflect what remains to your eye.",
      "Cyan, magenta, and yellow are subtractive primaries. Tuning each channel teaches how print color shifts hue and value.",
    ],
    illustrationSvg: makePuzzleIllustration("Subtractive CMY channels", "#06b6d4", "#d946ef", "#eab308"),
    quiz: [
      {
        prompt: "Why is CMY called subtractive?",
        options: ["It emits extra light", "It absorbs wavelengths from white light", "It rotates hue angles", "It uses grayscale only"],
        correctIndex: 1,
        explanation: "Pigments absorb wavelengths, effectively subtracting light from the reflected result.",
      },
      {
        prompt: "Which set is the subtractive primary trio?",
        options: ["Red, green, blue", "Cyan, magenta, yellow", "Orange, purple, green", "Black, white, gray"],
        correctIndex: 1,
        explanation: "CMY are the subtractive primaries used by print workflows.",
      },
    ],
  },
  "puzzle-03": {
    title: "Chromatic Black",
    intro: [
      "Painters often avoid tube black for key shadows because it can flatten form. Instead they mix complements for richer darks.",
      "Complementary pigments neutralize toward dark neutrals while preserving subtle color life. This makes shadows feel luminous instead of dead.",
    ],
    illustrationSvg: makePuzzleIllustration("Complement mixes for rich darks", "#2563eb", "#f97316", "#111827"),
    quiz: [
      {
        prompt: "Why mix complements for black in painting?",
        options: ["To dry paint faster", "To create richer, livelier darks", "To avoid value contrast", "To increase opacity only"],
        correctIndex: 1,
        explanation: "Complementary mixes can produce dark neutrals with hidden chroma.",
      },
      {
        prompt: "Which pair is complementary?",
        options: ["Blue and orange", "Blue and green", "Yellow and orange", "Red and orange"],
        correctIndex: 0,
        explanation: "Blue and orange are opposite on the wheel, so they are complements.",
      },
    ],
  },
  "puzzle-04": {
    title: "Value and Squint Readability",
    intro: [
      "Value means lightness and darkness, independent of hue. Good value structure keeps subjects readable even when detail is blurred.",
      "Artists squint to simplify scenes into big value masses. If the image reads while blurred, the structure is usually strong.",
    ],
    illustrationSvg: makePuzzleIllustration("Blur reveals value structure", "#111827", "#6b7280", "#f9fafb"),
    quiz: [
      {
        prompt: "What does squinting help you evaluate?",
        options: ["Brush texture only", "Fine line detail", "Overall value structure", "Pigment brand quality"],
        correctIndex: 2,
        explanation: "Squinting suppresses detail so light-dark relationships become obvious.",
      },
      {
        prompt: "Value refers to a color's...",
        options: ["Saturation", "Temperature", "Lightness or darkness", "Pigment cost"],
        correctIndex: 2,
        explanation: "Value is the light-dark scale of a color.",
      },
    ],
  },
  "puzzle-05": {
    title: "Ordering a Value Ladder",
    intro: [
      "A value ladder arranges tones from darkest to lightest. Practicing this trains perception for stronger composition decisions.",
      "When values are in the right order, hidden structure appears clearly. Out-of-order values break readability and hierarchy.",
    ],
    illustrationSvg: makePuzzleIllustration("Dark to light sequencing", "#111827", "#6b7280", "#e5e7eb"),
    quiz: [
      {
        prompt: "A value ladder should run from...",
        options: ["Warm to cool", "Dark to light", "Saturated to dull", "Hue A to hue B"],
        correctIndex: 1,
        explanation: "Value ladders are about tonal progression, not hue shifts.",
      },
      {
        prompt: "Why is value ordering useful?",
        options: ["It improves color naming", "It reveals visual structure", "It removes contrast", "It prevents blending"],
        correctIndex: 1,
        explanation: "Correct value order clarifies form and readability.",
      },
    ],
  },
  "puzzle-06": {
    title: "Chroma Peaks by Hue",
    intro: [
      "Not every hue reaches peak saturation at the same value. Yellow peaks higher, while blue-violet often peaks lower.",
      "Understanding hue-specific chroma limits helps you avoid muddy mixes and place saturation where it naturally works best.",
    ],
    illustrationSvg: makePuzzleIllustration("Hue-specific chroma peaks", "#eab308", "#22c55e", "#4338ca"),
    quiz: [
      {
        prompt: "Do all hues peak in chroma at the same value level?",
        options: ["Yes, always", "No, peaks differ by hue", "Only in oil paint", "Only in digital painting"],
        correctIndex: 1,
        explanation: "Each hue has different chroma behavior across value.",
      },
      {
        prompt: "Knowing chroma peaks mainly helps you...",
        options: ["Paint faster", "Mix cleaner color", "Avoid perspective", "Remove shadows"],
        correctIndex: 1,
        explanation: "Hue-aware chroma choices reduce accidental muddiness.",
      },
    ],
  },
  "puzzle-07": {
    title: "Complementary Pairs",
    intro: [
      "Complementary colors sit opposite each other on the color wheel. Side by side they intensify contrast.",
      "Mixed together, complements neutralize toward grays and browns. That dual behavior makes them powerful for both pop and control.",
    ],
    illustrationSvg: makePuzzleIllustration("Opposites on the wheel", "#ef4444", "#16a34a", "#f97316"),
    quiz: [
      {
        prompt: "What is true about complements when placed side by side?",
        options: ["They mute each other visually", "They increase each other's intensity", "They become grayscale", "They lose contrast"],
        correctIndex: 1,
        explanation: "Simultaneous contrast makes complements appear more vivid together.",
      },
      {
        prompt: "Which pair is complementary?",
        options: ["Yellow and purple", "Yellow and orange", "Blue and green", "Red and orange"],
        correctIndex: 0,
        explanation: "Yellow and purple are opposite on most standard wheels.",
      },
    ],
  },
  "puzzle-08": {
    title: "Triadic Harmony",
    intro: [
      "A triad uses three hues spaced evenly around the wheel, roughly 120 degrees apart. This creates energetic but balanced contrast.",
      "Triads work best when one hue leads and the others support. Equal dominance can feel noisy, so hierarchy matters.",
    ],
    illustrationSvg: makePuzzleIllustration("120 deg hue spacing", "#ef4444", "#eab308", "#2563eb"),
    quiz: [
      {
        prompt: "How far apart are triadic hues on the wheel?",
        options: ["About 45 deg", "About 90 deg", "About 120 deg", "About 180 deg"],
        correctIndex: 2,
        explanation: "Triadic palettes are based on near-equal 120 deg spacing.",
      },
      {
        prompt: "A good triad usually has...",
        options: ["No dominant hue", "One dominant hue with supporting accents", "Only neutrals", "Only warm colors"],
        correctIndex: 1,
        explanation: "Hierarchy keeps triads balanced and readable.",
      },
    ],
  },
  "puzzle-09": {
    title: "Mood Palettes",
    intro: [
      "Color combinations carry emotional tone before any words are read. Warm, high-energy palettes feel different from cool, quiet ones.",
      "Palette design combines hue, value contrast, and saturation control. Matching mood requires the full relationship, not a single swatch.",
    ],
    illustrationSvg: makePuzzleIllustration("Emotion through palette", "#f97316", "#0ea5e9", "#64748b"),
    quiz: [
      {
        prompt: "Which palette direction is usually calmer?",
        options: ["High-contrast warm reds", "Cooler, softer contrasts", "Neon complements only", "Pure black and white"],
        correctIndex: 1,
        explanation: "Cool and lower-contrast palettes often read as calmer.",
      },
      {
        prompt: "Mood palettes are built from...",
        options: ["Only hue names", "Hue, value contrast, and saturation", "Brush size only", "Station unlock order"],
        correctIndex: 1,
        explanation: "Emotional tone depends on multiple color dimensions together.",
      },
    ],
  },
  "puzzle-10": {
    title: "Same-Square Illusion",
    intro: [
      "Perceived color depends on surrounding context. Two identical squares can look different when backgrounds shift.",
      "This effect, called simultaneous contrast, proves color is relational. Designers use context shifts to guide attention and perception.",
    ],
    illustrationSvg: makePuzzleIllustration("Context changes perception", "#9ca3af", "#1f2937", "#f3f4f6"),
    quiz: [
      {
        prompt: "In simultaneous contrast, identical center colors can look...",
        options: ["Exactly the same always", "Different because of surroundings", "Invisible", "Fully saturated"],
        correctIndex: 1,
        explanation: "Context shifts how the visual system interprets a color.",
      },
      {
        prompt: "This illusion demonstrates that color perception is...",
        options: ["Absolute", "Random", "Relative", "Mechanical only"],
        correctIndex: 2,
        explanation: "Perception is relative to neighboring colors and values.",
      },
    ],
  },
  "puzzle-11": {
    title: "Make Gray Read Blue",
    intro: [
      "A neutral can appear cooler without changing its pixel value, simply by warming surrounding colors.",
      "Orange context pushes neighboring gray toward a blue impression. This is a practical way to suggest cool light indirectly.",
    ],
    illustrationSvg: makePuzzleIllustration("Warm surround, cool gray", "#fb923c", "#9ca3af", "#60a5fa"),
    quiz: [
      {
        prompt: "To make a gray appear bluer, which surrounding color family helps most?",
        options: ["Orange", "Blue", "Gray", "Green only"],
        correctIndex: 0,
        explanation: "Warm orange context can make a neutral appear relatively cooler.",
      },
      {
        prompt: "In this puzzle, does the gray square itself change?",
        options: ["Yes", "No"],
        correctIndex: 1,
        explanation: "Only the surroundings change; the gray remains fixed.",
      },
    ],
  },
  "puzzle-12": {
    title: "Neutral Hero",
    intro: [
      "A bright accent has the strongest impact when most of the composition is neutral. Neutrals create breathing room.",
      "If everything is loud, nothing leads. Strategic restraint with saturation builds hierarchy and focus.",
    ],
    illustrationSvg: makePuzzleIllustration("Accent over neutrals", "#78716c", "#a8a29e", "#ef4444"),
    quiz: [
      {
        prompt: "What helps an accent color pop most?",
        options: ["Many competing saturated colors", "Mostly neutral surroundings", "Lower contrast", "Only grayscale accents"],
        correctIndex: 1,
        explanation: "Neutrals reduce competition and emphasize the accent.",
      },
      {
        prompt: "Why avoid many high-saturation focal colors?",
        options: ["It weakens visual hierarchy", "It speeds rendering", "It increases depth automatically", "It fixes values"],
        correctIndex: 0,
        explanation: "Too many accents compete and flatten emphasis.",
      },
    ],
  },
  "puzzle-13": {
    title: "Atmospheric Depth",
    intro: [
      "Distant objects usually look cooler, lighter, and less saturated. Edge contrast also softens with distance.",
      "These cues create depth on flat surfaces. Painting near and far planes with the same chroma and sharpness collapses space.",
    ],
    illustrationSvg: makePuzzleIllustration("Depth via atmosphere", "#475569", "#64748b", "#bfdbfe"),
    quiz: [
      {
        prompt: "As objects move farther away, they usually become...",
        options: ["Warmer and sharper", "Cooler and less saturated", "More contrasted", "More detailed"],
        correctIndex: 1,
        explanation: "Atmosphere tends to cool and desaturate distant forms.",
      },
      {
        prompt: "Which cue commonly decreases with distance?",
        options: ["Edge softness", "Atmospheric haze", "Contrast clarity", "Blue shift"],
        correctIndex: 2,
        explanation: "Perceived contrast clarity drops at distance.",
      },
    ],
  },
  "puzzle-14": {
    title: "Rayleigh Scattering",
    intro: [
      "Air molecules scatter short wavelengths more strongly than long wavelengths. This is why clear skies read blue.",
      "The same principle contributes to distant blue haze. Increasing scattering in a scene should shift far objects toward cooler tones.",
    ],
    illustrationSvg: makePuzzleIllustration("Short wavelengths scatter more", "#1d4ed8", "#38bdf8", "#94a3b8"),
    quiz: [
      {
        prompt: "Rayleigh scattering affects which wavelengths more strongly?",
        options: ["Long red wavelengths", "Short blue wavelengths", "All equally", "Only infrared"],
        correctIndex: 1,
        explanation: "Shorter wavelengths scatter more in the atmosphere.",
      },
      {
        prompt: "A practical visual result is that distant objects often look...",
        options: ["Warmer", "Sharper", "Bluer", "More saturated"],
        correctIndex: 2,
        explanation: "Atmospheric scattering commonly cools distance color.",
      },
    ],
  },
  "puzzle-15": {
    title: "Time-of-Day Palette Shift",
    intro: [
      "Light color temperature changes through the day. Midday tends cooler and higher contrast, while golden hour is warmer with longer shadows.",
      "Strong landscape color decisions depend on matching palette and light behavior together, not one isolated slider.",
    ],
    illustrationSvg: makePuzzleIllustration("Noon to golden hour", "#60a5fa", "#fbbf24", "#f97316"),
    quiz: [
      {
        prompt: "Golden hour light is generally...",
        options: ["Cool and harsh", "Warm and lower-angle", "Neutral and flat", "Green-dominant"],
        correctIndex: 1,
        explanation: "Low-angle sunlight shifts warmer and stretches shadows.",
      },
      {
        prompt: "To recreate convincing time-of-day, you should coordinate...",
        options: ["Only hue", "Palette plus light behavior", "Only shadow sharpness", "Only saturation"],
        correctIndex: 1,
        explanation: "Believable lighting needs multiple linked parameters.",
      },
    ],
  },
  "puzzle-16": {
    title: "Vibrant Green Mixing",
    intro: [
      "Vivid green usually comes from a clean yellow-blue pair with compatible bias. Not all pigments mix equally cleanly.",
      "If hidden complement contamination enters the mix, chroma drops fast and greens become muddy. Selection and cleanliness both matter.",
    ],
    illustrationSvg: makePuzzleIllustration("Clean yellow + blue pairing", "#fde047", "#3b82f6", "#22c55e"),
    quiz: [
      {
        prompt: "What is the key to a vibrant mixed green?",
        options: ["Any yellow and any blue", "A clean yellow-blue pairing with low contamination", "Adding black", "Adding red"],
        correctIndex: 1,
        explanation: "Bias and contamination strongly affect green chroma.",
      },
      {
        prompt: "What usually causes muddy green in this context?",
        options: ["Too little paint", "Complement contamination", "Using one pigment only", "Using cool hues"],
        correctIndex: 1,
        explanation: "Hidden opposite-bias pigments neutralize saturation.",
      },
    ],
  },
  "puzzle-17": {
    title: "Mud Monster",
    intro: [
      "Complementary pairs are powerful neutralizers. A little can be useful, but too many mixed together quickly create dull mud.",
      "Intentional mixing means limiting opposing pairs and preserving separation until you know exactly what neutral you want.",
    ],
    illustrationSvg: makePuzzleIllustration("Limit complement overload", "#8b5cf6", "#22c55e", "#6b7280"),
    quiz: [
      {
        prompt: "What happens when too many complements are mixed together?",
        options: ["Color gets cleaner", "Color neutralizes into mud", "Value increases only", "Hue rotates predictably"],
        correctIndex: 1,
        explanation: "Multiple complement interactions can collapse chroma quickly.",
      },
      {
        prompt: "A practical anti-mud strategy is to...",
        options: ["Mix everything at once", "Limit complement pair additions", "Use only white paint", "Avoid saturation entirely"],
        correctIndex: 1,
        explanation: "Controlled additions keep mixtures intentional.",
      },
    ],
  },
  "puzzle-18": {
    title: "Optical Mixing",
    intro: [
      "Optical mixing happens in the viewer's eye when tiny pure dots sit side by side. The eye blends them at distance.",
      "Because pigments stay unmixed on the surface, color can feel brighter than physical mixing on a palette.",
    ],
    illustrationSvg: makePuzzleIllustration("Pointillist optical blend", "#ef4444", "#3b82f6", "#facc15"),
    quiz: [
      {
        prompt: "Optical mixing occurs mainly...",
        options: ["On the palette", "In the viewer's perception", "In drying medium", "In grayscale only"],
        correctIndex: 1,
        explanation: "The blend is perceptual, not physically premixed pigment.",
      },
      {
        prompt: "Why use pure dots for this effect?",
        options: ["To reduce value", "To preserve pigment intensity", "To avoid contrast", "To flatten form"],
        correctIndex: 1,
        explanation: "Keeping dots pure retains stronger local color energy.",
      },
    ],
  },
  "puzzle-19": {
    title: "60/30/10 Balance",
    intro: [
      "The 60/30/10 rule gives compositions stable proportion: dominant, supporting, and accent roles.",
      "Balanced proportion prevents visual noise and helps viewers understand hierarchy instantly.",
    ],
    illustrationSvg: makePuzzleIllustration("Dominant, secondary, accent", "#0ea5e9", "#334155", "#f97316"),
    quiz: [
      {
        prompt: "In the 60/30/10 rule, the dominant color should be about...",
        options: ["10%", "30%", "60%", "90%"],
        correctIndex: 2,
        explanation: "Dominant color typically covers around 60%.",
      },
      {
        prompt: "What is the main benefit of this proportion rule?",
        options: ["Faster rendering", "Clear hierarchy and harmony", "Eliminating accents", "Removing contrast"],
        correctIndex: 1,
        explanation: "It creates a readable balance of emphasis.",
      },
    ],
  },
  "puzzle-20": {
    title: "Color and Emotion",
    intro: [
      "People often attach emotional meaning to colors before reading any text. These associations influence design communication.",
      "Red often signals urgency, blue trust, yellow optimism, and green growth. Context still matters, but baseline tendencies are useful.",
    ],
    illustrationSvg: makePuzzleIllustration("Psychology of color cues", "#ef4444", "#3b82f6", "#22c55e"),
    quiz: [
      {
        prompt: "Which mapping is commonly used in visual communication?",
        options: ["Blue -> trust", "Blue -> danger", "Green -> urgency", "Red -> calm"],
        correctIndex: 0,
        explanation: "Blue is frequently associated with trust and stability.",
      },
      {
        prompt: "Which color is often linked to growth and balance?",
        options: ["Yellow", "Red", "Green", "Purple"],
        correctIndex: 2,
        explanation: "Green commonly signals growth and natural balance.",
      },
    ],
  },
  "puzzle-21": {
    title: "Chromatic Vibration",
    intro: [
      "Strong vibration appears when complementary hues meet at similar value and high saturation. The edge can seem to shimmer.",
      "If value contrast becomes too high, the boundary stabilizes. Equal value with complementary hue is the unstable sweet spot.",
    ],
    illustrationSvg: makePuzzleIllustration("Complement + equal value shimmer", "#ef4444", "#22c55e", "#111827"),
    quiz: [
      {
        prompt: "Chromatic vibration is strongest when hues are...",
        options: ["Analogous and low saturation", "Complementary and high saturation", "Monochrome and low value", "Random and neutral"],
        correctIndex: 1,
        explanation: "Complementary high-chroma pairs intensify boundary conflict.",
      },
      {
        prompt: "What value relationship increases vibration?",
        options: ["Large value contrast", "Equal or near-equal value", "Pure black against white", "Any random value"],
        correctIndex: 1,
        explanation: "Near-equal value reduces clear edge priority and boosts shimmer.",
      },
    ],
  },
};
