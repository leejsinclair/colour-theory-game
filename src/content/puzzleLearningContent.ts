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
  howToWin?: string;
  whyFailed?: string;
  tooltips?: string[];
  accessibilityNote?: string;
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
      "Demonstrates additive color mixing used by light sources such as screens and projectors.",
      "Learn how red, green and blue combine to make white light.",
    ],
    illustrationSvg: makePuzzleIllustration("Additive light overlap", "#ef4444", "#22c55e", "#3b82f6"),
    howToWin: "Make the center patch appear white by adjusting the three sliders to match emitted light proportions.",
    whyFailed: "Overlapping emitted wavelengths add, so mismatched intensities produce tinted whites.",
    tooltips: ["additive: mixing by adding light wavelengths together", "subtractive: mixing by absorbing wavelengths"],
    accessibilityNote: "Ensure textual labels for slider values and a non-color success message.",
    quiz: [
      {
        prompt: "Why do screens use red, green and blue to make many colors?",
        options: ["Because emitted light wavelengths add to form other colors", "Because pigments reflect those three colors", "Because human eyes only see red, green and blue"],
        correctIndex: 0,
        explanation: "Additive mixing combines light intensities to create new perceived colors.",
      },
      {
        prompt: "If you increase the green slider while red and blue stay the same, what happens?",
        options: ["It shifts toward green and may become lighter", "It becomes darker because colors cancel out", "It turns into a neutral grey"],
        correctIndex: 0,
        explanation: "Adding more green increases that wavelength's contribution and overall luminance.",
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
    howToWin: "Adjust the cyan, magenta, and yellow sliders until the mixed swatch matches the target color.",
    whyFailed: "Each ink absorbs a different part of white light, so unbalanced channels shift the result away from the target hue.",
    tooltips: ["subtractive: mixing by absorbing wavelengths from reflected light", "value: lightness or darkness of a color", "chroma: the intensity or purity of a color"],
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
      "Shows how dark areas can retain subtle hue rather than becoming neutral black; useful for painting and shadow work.",
      "Complementary pigments neutralize toward dark neutrals while preserving subtle color life.",
    ],
    illustrationSvg: makePuzzleIllustration("Complement mixes for rich darks", "#2563eb", "#f97316", "#111827"),
    howToWin: "Make the shadowed patch match the reference by adjusting local chroma and hue.",
    whyFailed: "Low luminance reduces perceived saturation but hue bias remains, so shadows keep a tint.",
    tooltips: ["chroma: the intensity or purity of a color", "complement: the color directly opposite on the color wheel", "value: lightness or darkness of a color"],
    accessibilityNote: "Provide a text description of the shadow difference and keyboard controls for adjustments.",
    quiz: [
      {
        prompt: "Why can a shadowed area still look slightly colored?",
        options: ["Because low light reduces brightness but not all hue information disappears", "Because shadows create new pigments", "Because the eye cannot see color in dark areas at all"],
        correctIndex: 0,
        explanation: "Perception preserves hue cues even at low luminance.",
      },
      {
        prompt: "When matching a painted shadow, which slider is most important to adjust first?",
        options: ["Chroma (saturation) to keep the hue visible without raising brightness", "Hue only; brightness never matters", "Increase brightness to remove the tint"],
        correctIndex: 0,
        explanation: "Lowering chroma keeps the tint while preserving darkness.",
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
    howToWin: "Paint each block so the statue remains clearly readable when the screen blurs — use strong light-dark contrast.",
    whyFailed: "When values are too similar, the blur makes the subject disappear into the background.",
    tooltips: ["value: lightness or darkness of a color", "contrast: the difference in value between adjacent areas"],
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
    howToWin: "Drag the tiles into order from darkest to lightest — the hidden image appears when the sequence is correct.",
    whyFailed: "Out-of-order values break the tonal gradient and the hidden structure stays invisible.",
    tooltips: ["value: lightness or darkness of a color", "value ladder: a sequence of tones arranged from dark to light"],
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
      "Explains that maximum saturation (chroma) varies by hue; some colors reach higher vividness than others.",
      "Understanding hue-specific chroma limits helps you avoid muddy mixes and place saturation where it naturally works best.",
    ],
    illustrationSvg: makePuzzleIllustration("Hue-specific chroma peaks", "#eab308", "#22c55e", "#4338ca"),
    howToWin: "Match the vividness of the target by adjusting chroma while keeping hue constant.",
    whyFailed: "Different hues have different maximum chroma, so equal slider values don't always match perceived vividness.",
    tooltips: ["chroma: the intensity or purity of a color", "saturation: similar to chroma; degree of colorfulness", "peak chroma: highest saturation a hue can reach", "value: lightness or darkness of a color"],
    accessibilityNote: "Add textual guidance explaining vividness differences.",
    quiz: [
      {
        prompt: "What does 'peak chroma' mean?",
        options: ["The highest saturation a hue can reach before it changes appearance", "The brightest possible color regardless of hue", "When a color becomes black"],
        correctIndex: 0,
        explanation: "Each hue has a different maximum saturation in a given color space.",
      },
      {
        prompt: "If two hues use the same chroma slider value but one looks more vivid, why?",
        options: ["Because that hue's peak chroma is higher, so the same value maps to stronger appearance", "Because the screen is broken", "Because vividness is unrelated to chroma"],
        correctIndex: 0,
        explanation: "Perceptual mapping between numeric chroma and visible vividness differs by hue.",
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
    howToWin: "Identify and select the color that sits directly opposite each given swatch on the color wheel.",
    whyFailed: "Choosing an adjacent or nearby hue instead of the true opposite leaves contrast too low and the pair loses energy.",
    tooltips: ["complement: the color directly opposite on the color wheel", "hue: the named quality of a color such as red, blue, or yellow"],
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
    howToWin: "Choose three hues roughly 120° apart and assign one as the dominant color with the others as accents.",
    whyFailed: "Giving all three hues equal area creates visual noise — one hue must lead for the palette to feel balanced.",
    tooltips: ["hue: the named quality of a color such as red, blue, or yellow", "saturation: degree of colorfulness", "triadic: three hues spaced evenly around the color wheel"],
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
    howToWin: "Build a palette that matches the emotional prompt by combining hue temperature, value contrast, and saturation level.",
    whyFailed: "Changing only one dimension (e.g., hue alone) rarely shifts the emotional read — all three dimensions work together.",
    tooltips: ["hue: the named quality of a color such as red, blue, or yellow", "value: lightness or darkness of a color", "saturation: degree of colorfulness"],
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
    howToWin: "Adjust the background colors until both center squares look identical — that is when context is neutralized.",
    whyFailed: "A lighter background makes the center appear darker, and vice versa, so mismatched backgrounds hide the equality.",
    tooltips: ["simultaneous contrast: a color's appearance shifts depending on neighboring colors", "value: lightness or darkness of a color"],
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
      "Demonstrates simultaneous contrast: surrounding colors change how a neutral patch is perceived.",
      "Orange context pushes neighboring gray toward a blue impression — a practical way to suggest cool light indirectly.",
    ],
    illustrationSvg: makePuzzleIllustration("Warm surround, cool gray", "#fb923c", "#9ca3af", "#60a5fa"),
    howToWin: "Adjust the surround color so the central grey appears bluish to match the target.",
    whyFailed: "Warm surrounds bias neutrals toward cool complements, and vice versa.",
    tooltips: ["complement: the color directly opposite on the color wheel", "saturation: degree of colorfulness", "simultaneous contrast: a color's appearance shifts depending on neighboring colors"],
    accessibilityNote: "Provide a text description of the contrast effect and an option to toggle high-contrast mode.",
    quiz: [
      {
        prompt: "Which surrounding color will make a neutral grey appear bluer?",
        options: ["Orange", "Green", "Black"],
        correctIndex: 0,
        explanation: "Orange is the warm complement that shifts perceived neutral toward blue.",
      },
      {
        prompt: "If the grey still looks neutral after adding orange surround, what should you try?",
        options: ["Increase the surround's saturation or brightness to strengthen the contrast effect", "Make the grey darker; contrast doesn't depend on surround intensity", "Change the grey's hue to red"],
        correctIndex: 0,
        explanation: "Stronger surrounding chroma/brightness increases contrast-driven perceptual shifts.",
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
    howToWin: "Mix neutral grays and browns for most of the composition so the single bright accent color stands out clearly.",
    whyFailed: "Adding too many saturated areas competes with the accent and flattens the visual hierarchy.",
    tooltips: ["saturation: degree of colorfulness", "chroma: the intensity or purity of a color", "complement: the color directly opposite on the color wheel"],
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
    howToWin: "Paint each depth plane with progressively cooler, lighter, and less saturated tones as objects move into the distance.",
    whyFailed: "Using the same chroma and edge sharpness at every distance removes the depth cues that make space readable.",
    tooltips: ["saturation: degree of colorfulness", "chroma: the intensity or purity of a color", "value: lightness or darkness of a color", "atmospheric perspective: the effect of air on distant color"],
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
    howToWin: "Increase the atmospheric scattering slider to shift distant objects toward a cooler, hazier blue tone.",
    whyFailed: "Too little scattering keeps distant objects the same warm color as near ones, collapsing perceived depth.",
    tooltips: ["Rayleigh scattering: air molecules deflect short wavelengths more than long ones", "wavelength: the physical property that determines a light color", "value: lightness or darkness of a color"],
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
    howToWin: "Match the sliders to the target time of day by coordinating light color temperature, shadow length, and contrast level.",
    whyFailed: "Adjusting only the hue without changing contrast or shadow angle produces an unconvincing lighting impression.",
    tooltips: ["color temperature: a scale from warm (orange) to cool (blue) light", "value: lightness or darkness of a color", "saturation: degree of colorfulness"],
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
    howToWin: "Select a clean cool yellow and a clean warm blue to mix — the swatch should reach a vivid, unsullied green.",
    whyFailed: "Pigments with hidden red or orange bias introduce complement contamination that neutralizes the green chroma.",
    tooltips: ["chroma: the intensity or purity of a color", "complement: the color directly opposite on the color wheel", "pigment bias: the hidden secondary hue leaning of a paint"],
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
    howToWin: "Add pigments one at a time and stop before the mix becomes a dull neutral — the goal is a rich dark, not mud.",
    whyFailed: "Each additional complement pair neutralizes chroma further; too many makes an irreversibly dull brown.",
    tooltips: ["complement: the color directly opposite on the color wheel", "chroma: the intensity or purity of a color", "saturation: degree of colorfulness"],
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
    howToWin: "Place pure colored dots side by side without mixing them — step back and the eye blends them into a new color.",
    whyFailed: "Physically mixing the dots on the canvas loses the brightness advantage because pigments combine subtractively.",
    tooltips: ["optical mixing: color blending that happens in the viewer's eye rather than on the canvas", "additive: mixing by adding light wavelengths together", "subtractive: mixing by absorbing wavelengths from reflected light"],
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
    howToWin: "Set proportion sliders so the dominant color covers ~60%, the secondary ~30%, and the accent ~10%.",
    whyFailed: "Equal proportions remove hierarchy — the viewer has no clear entry point and the composition feels noisy.",
    tooltips: ["hue: the named quality of a color such as red, blue, or yellow", "saturation: degree of colorfulness", "value: lightness or darkness of a color"],
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
      "Explores common color–emotion associations and how context changes meaning.",
      "Red often signals urgency, blue trust, yellow optimism, and green growth — though cultural context can shift these baselines.",
    ],
    illustrationSvg: makePuzzleIllustration("Psychology of color cues", "#ef4444", "#3b82f6", "#22c55e"),
    howToWin: "Arrange colors to match the target emotional palette while noting contextual cues.",
    whyFailed: "Emotional associations are broadly consistent but vary by culture and context.",
    tooltips: ["saturation: degree of colorfulness", "value: lightness or darkness of a color"],
    accessibilityNote: "Emotional cues must not be the only signal for important UI states.",
    quiz: [
      {
        prompt: "Which color is most commonly associated with calm in Western contexts?",
        options: ["Blue", "Red", "Yellow"],
        correctIndex: 0,
        explanation: "Blue is frequently linked to calm and stability in many Western studies.",
      },
      {
        prompt: "If a user in a different cultural region finds your 'calm' palette unsettling, what should you do?",
        options: ["Offer a regional variant or let users choose alternative palettes", "Insist blue is universally calming", "Remove color from the interface entirely"],
        correctIndex: 0,
        explanation: "Associations differ across cultures; allow customization where possible.",
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
    howToWin: "Set two complementary hues to the same brightness level — the edge between them should shimmer or appear to vibrate.",
    whyFailed: "If value contrast is too high, the eye reads a clear light/dark boundary and the vibration effect disappears.",
    tooltips: ["complement: the color directly opposite on the color wheel", "value: lightness or darkness of a color", "chroma: the intensity or purity of a color", "chromatic vibration: optical shimmer at the border of complementary equal-value colors"],
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
