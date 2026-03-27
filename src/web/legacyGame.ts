import { getDemoSolution } from "../content/demoSolutions";
import { puzzleLearningContent, type LearningQuizQuestion } from "../content/puzzleLearningContent";
import { Game } from "../game/Game";
import { SceneType } from "../types/gameTypes";
import { renderPuzzleById } from "./puzzles";
import { mountMuiCheckbox, mountMuiSelect, mountMuiSlider, renderMuiMilestoneChips, upgradeMuiButtons } from "./muiControls";
import { diagnoseFailure } from "./puzzles/diagnose";
import { FAILURE_EXPLANATIONS, type FailureReasonCode } from "./puzzles/failureReasons";
import { mountChromaTreeExplorer } from "./puzzles/ChromaTreeExplorer";
import { marked } from "marked";
import "./styles.css";

const progressEl = document.getElementById("progress") as HTMLPreElement;
const puzzleListEl = document.getElementById("puzzle-list") as HTMLDivElement;
const autoSolveButton = document.getElementById("auto-solve") as HTMLButtonElement;
const resetButton = document.getElementById("reset") as HTMLButtonElement;
const hudScoreValue = document.getElementById("hud-score-value") as HTMLElement;
const hudPetsValue = document.getElementById("hud-pets-value") as HTMLElement;
const hudStreakValue = document.getElementById("hud-streak-value") as HTMLElement;
const milestoneBadgesEl = document.getElementById("milestone-badges") as HTMLElement;
const petCollectionEl = document.getElementById("pet-collection") as HTMLElement;
const toastContainerEl = document.getElementById("toast-container") as HTMLElement;
const infoModalEl = document.getElementById("info-modal") as HTMLElement;
const infoModalTitleEl = document.getElementById("info-modal-title") as HTMLElement;
const infoModalBodyEl = document.getElementById("info-modal-body") as HTMLElement;
const infoModalCloseEl = document.getElementById("info-modal-close") as HTMLButtonElement;

async function openInfoModal(puzzleId: string): Promise<void> {
  const url = new URL(`puzzle-info/${puzzleId}.md`, location.href).href;

  try {
    const resp = await fetch(url);
    if (resp.ok) {
      const mdText = await resp.text();
      const lines = mdText.split("\n");
      const titleLine = lines[0].replace(/^#{1,6}\s*/, "").trim();
      const bodyMd = lines.slice(1).join("\n");
      const bodyHtml = await marked.parse(bodyMd);

      infoModalTitleEl.textContent = titleLine;
      infoModalBodyEl.innerHTML = bodyHtml;

      infoModalBodyEl.querySelectorAll("a").forEach((a) => {
        a.setAttribute("target", "_blank");
        a.setAttribute("rel", "noopener noreferrer");
      });

      infoModalEl.removeAttribute("hidden");
      infoModalCloseEl.focus();
      return;
    }
  } catch {
    // fall through to legacy content
  }

  const learning = puzzleLearningContent[puzzleId];
  if (learning) {
    infoModalTitleEl.textContent = learning.title;
    infoModalBodyEl.innerHTML = "";

    const illustrationWrap = document.createElement("div");
    illustrationWrap.className = "learning-modal-illustration";
    illustrationWrap.innerHTML = learning.illustrationSvg;
    infoModalBodyEl.appendChild(illustrationWrap);

    learning.intro.forEach((paragraph) => {
      const p = document.createElement("p");
      p.textContent = paragraph;
      infoModalBodyEl.appendChild(p);
    });

    if (learning.howToWin) {
      const row = document.createElement("p");
      row.className = "learning-meta learning-meta--how";
      row.innerHTML = `<strong>How to win:</strong> ${learning.howToWin}`;
      infoModalBodyEl.appendChild(row);
    }

    if (learning.whyFailed) {
      const row = document.createElement("p");
      row.className = "learning-meta learning-meta--why";
      row.innerHTML = `<strong>Why this fails:</strong> ${learning.whyFailed}`;
      infoModalBodyEl.appendChild(row);
    }

    if (learning.tooltips && learning.tooltips.length > 0) {
      const row = document.createElement("p");
      row.className = "learning-meta learning-meta--tooltips";
      row.innerHTML = `<strong>Key terms:</strong> ${learning.tooltips.join(" · ")}`;
      infoModalBodyEl.appendChild(row);
    }

    infoModalEl.removeAttribute("hidden");
    infoModalCloseEl.focus();
    return;
  }

  const concept = puzzleConcepts[puzzleId];
  if (!concept) {
    return;
  }

  infoModalTitleEl.textContent = concept.title;
  infoModalBodyEl.innerHTML = "";
  for (const line of concept.body.split("\n")) {
    if (line.trim()) {
      const p = document.createElement("p");
      p.textContent = line;
      infoModalBodyEl.appendChild(p);
    }
  }
  infoModalEl.removeAttribute("hidden");
  infoModalCloseEl.focus();
}

function closeInfoModal(): void {
  infoModalEl.setAttribute("hidden", "");
}

infoModalCloseEl.addEventListener("click", closeInfoModal);

infoModalEl.addEventListener("click", (e) => {
  if (e.target === infoModalEl) {
    closeInfoModal();
  }
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !infoModalEl.hasAttribute("hidden")) {
    closeInfoModal();
  }
});

const PET_SPRITE_HREF = "assets/pets/pets.png";
const PET_SPRITE_NATURAL_WIDTH = 680;
const PET_SPRITE_NATURAL_HEIGHT = 386;

/** Sprite centres in the 680x386 pets sprite viewBox. */
const PET_SPRITE_CENTRES: Record<string, { cx: number; cy: number }> = {
  "pet-01": { cx: 48, cy: 62 },
  "pet-02": { cx: 145, cy: 62 },
  "pet-03": { cx: 243, cy: 62 },
  "pet-04": { cx: 340, cy: 62 },
  "pet-05": { cx: 437, cy: 62 },
  "pet-06": { cx: 535, cy: 62 },
  "pet-07": { cx: 632, cy: 62 },
  "pet-08": { cx: 48, cy: 182 },
  "pet-09": { cx: 145, cy: 182 },
  "pet-10": { cx: 243, cy: 182 },
  "pet-11": { cx: 340, cy: 182 },
  "pet-12": { cx: 437, cy: 182 },
  "pet-13": { cx: 535, cy: 182 },
  "pet-14": { cx: 632, cy: 182 },
  "pet-15": { cx: 48, cy: 302 },
  "pet-16": { cx: 145, cy: 302 },
  "pet-17": { cx: 243, cy: 302 },
  "pet-18": { cx: 340, cy: 302 },
  "pet-19": { cx: 437, cy: 302 },
  "pet-20": { cx: 535, cy: 302 },
  "pet-21": { cx: 632, cy: 302 },
};

/** Pets with lower extents that benefit from a larger crop. */
const PET_SPRITE_LARGE_CROP = new Set(["pet-02", "pet-10", "pet-13"]);

/** All 21 pet IDs in order. */
const ALL_PET_IDS = Array.from({ length: 21 }, (_, i) => `pet-${String(i + 1).padStart(2, "0")}`);

/** Pet display names for tooltips. */
const PET_NAMES: Record<string, string> = {
  "pet-01": "Glow Sprite",
  "pet-02": "Ink Octopus",
  "pet-03": "Shadow Cat",
  "pet-04": "Shadow Mouse",
  "pet-05": "Gradient Hedgehog",
  "pet-06": "Chroma Gecko",
  "pet-07": "Prism Fox",
  "pet-08": "Palette Parrot",
  "pet-09": "Mood Bat",
  "pet-10": "Chameleon Lizard",
  "pet-11": "Contrast Frog",
  "pet-12": "Neutral Turtle",
  "pet-13": "Sky Jelly",
  "pet-14": "Air Sprite",
  "pet-15": "Sun Finch",
  "pet-16": "Paint Slime",
  "pet-17": "Mud Blob",
  "pet-18": "Dot Bee",
  "pet-19": "Harmony Dove",
  "pet-20": "Empathy Moth",
  "pet-21": "Vibration Hummingbird",
};

/** Build a CSS-sprite div for one pet slot. */
function createPetSpriteDiv(
  petId: string,
  collected: boolean,
  options: { includeLabel?: boolean } = {},
): HTMLDivElement {
  const sprite = document.createElement("div");
  const centre = PET_SPRITE_CENTRES[petId] ?? { cx: 48, cy: 62 };
  const includeLabel = options.includeLabel ?? true;
  const cropHalf = PET_SPRITE_LARGE_CROP.has(petId) ? 44 : 40;
  const cropWidth = cropHalf * 2;
  const cropHeight = cropWidth + (includeLabel ? 24 : 0);
  const cropX = centre.cx - cropHalf;
  const cropY = centre.cy - cropHalf;
  const scaleX = PET_SPRITE_NATURAL_WIDTH / cropWidth;
  const scaleY = PET_SPRITE_NATURAL_HEIGHT / cropHeight;

  // Position based on crop rectangle origin so labels remain in frame.
  const posX = ((-cropX / cropWidth) / (1 - scaleX)) * 100;
  const posY = ((-cropY / cropHeight) / (1 - scaleY)) * 100;

  sprite.className = "pet-sprite";
  if (!collected) {
    sprite.classList.add("pet-sprite--locked");
  }

  sprite.setAttribute("role", "img");
  sprite.setAttribute("aria-label", `${PET_NAMES[petId] ?? petId}${collected ? " (collected)" : ""}`);
  sprite.style.backgroundImage = `url(${PET_SPRITE_HREF})`;
  sprite.style.backgroundRepeat = "no-repeat";
  sprite.style.backgroundSize = `${scaleX * 100}% ${scaleY * 100}%`;
  sprite.style.backgroundPosition = `${posX}% ${posY}%`;
  sprite.style.backgroundColor = collected ? "#ffffff" : "#d8dbe3";

  return sprite;
}

/** Rebuild the 2-row pet sprite grid below the scoreboard. */
let _lastCollectedSnapshot = "";

function renderPetCollection(): void {
  const collectedIds = new Set(game.petManager.getUnlockedPets().map((p) => p.id));
  const snapshot = ALL_PET_IDS.map((id) => (collectedIds.has(id) ? "1" : "0")).join("");

  // Skip full DOM rebuild when the collected set hasn't changed
  if (snapshot === _lastCollectedSnapshot) {
    return;
  }
  _lastCollectedSnapshot = snapshot;

  petCollectionEl.innerHTML = "";

  for (const petId of ALL_PET_IDS) {
    const collected = collectedIds.has(petId);
    const wrapper = document.createElement("div");
    wrapper.className = `pet-slot${collected ? " pet-slot--collected" : ""}`;
    wrapper.title = `${PET_NAMES[petId] ?? petId}${collected ? "" : " (not yet collected)"}`;
    const sprite = createPetSpriteDiv(petId, collected, { includeLabel: true });
    sprite.classList.add("pet-sprite--grid");
    wrapper.appendChild(sprite);
    petCollectionEl.appendChild(wrapper);
  }
}

let game = new Game();
let activeStationId: string | null = null;
let practicePuzzleId: string | null = null;
let showChromaTreeExplorer = false;

/** Show a brief floating reward toast message. */
function showToast(
  message: string,
  options: { kind?: "default" | "success"; icon?: string; petId?: string } = {},
): void {
  const el = document.createElement("div");
  const kind = options.kind ?? "default";
  el.className = `toast${kind === "success" ? " toast--success" : ""}`;

  if (options.petId) {
    const iconWrap = document.createElement("span");
    iconWrap.className = "toast-icon toast-icon--pet";
    const sprite = createPetSpriteDiv(options.petId, true, { includeLabel: false });
    sprite.classList.add("pet-sprite--toast");
    iconWrap.appendChild(sprite);
    el.appendChild(iconWrap);
  } else if (options.icon) {
    const iconEl = document.createElement("span");
    iconEl.className = "toast-icon";
    iconEl.textContent = options.icon;
    el.appendChild(iconEl);
  }

  const textEl = document.createElement("span");
  textEl.className = "toast-text";
  textEl.textContent = message;
  el.appendChild(textEl);

  toastContainerEl.appendChild(el);
  setTimeout(() => {
    el.style.animation = "toast-out 280ms ease forwards";
    setTimeout(() => el.remove(), 300);
  }, 2200);
}

/** Refresh the HUD score/pets/streak tiles, milestone badges, and pet collection. */
function updateHud(): void {
  const progress = game.getProgress();
  hudScoreValue.textContent = String(progress.score);
  hudPetsValue.textContent = `${progress.petsCollected}/${progress.total}`;
  hudStreakValue.textContent = String(progress.bestStreak);

  renderMuiMilestoneChips(milestoneBadgesEl, progress.petMilestonesUnlocked);

  // Rebuild pet collection sprite grid
  renderPetCollection();
}

const puzzleObjectives: Record<string, string> = {
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
};

const puzzleConcepts: Record<string, { title: string; body: string }> = {
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
};

const artPalette = ["#0d8db0", "#ec7755", "#2f9e44", "#f0b429", "#6f42c1", "#1f2030"];
let selectedArtColor = artPalette[0];
const artPad = {
  cols: 18,
  rows: 10,
  pixels: [] as string[],
};

const puzzleUiState = new Map<string, unknown>();
const learningUiState = new Map<string, LearningUiState>();

const LOCAL_SAVE_KEY = "ctg:web-progress:v1";

type LocalProgressSnapshot = {
  completedPuzzleIds: string[];
  activeStationId: string | null;
  practicePuzzleId: string | null;
  learningProgressByPuzzle?: Record<string, { quizPassed: boolean }>;
};

type LearningProgress = Record<string, { quizPassed: boolean }>;

type LearningStage = "intro" | "quiz" | "puzzle";

type LearningUiState = {
  stage: LearningStage;
  selections: number[];
  feedback: string;
};

let skipNextPersist = false;
let learningProgressByPuzzle: LearningProgress = {};

function getSolvedPuzzleIds(): string[] {
  return game.stationManager
    .getAllStations()
    .flatMap((station) => station.puzzles)
    .filter((puzzle) => puzzle.solved)
    .map((puzzle) => puzzle.id);
}

function persistLocalProgress(): void {
  if (skipNextPersist) {
    skipNextPersist = false;
    return;
  }

  const payload: LocalProgressSnapshot = {
    completedPuzzleIds: getSolvedPuzzleIds(),
    activeStationId,
    practicePuzzleId,
    learningProgressByPuzzle,
  };

  try {
    localStorage.setItem(LOCAL_SAVE_KEY, JSON.stringify(payload));
  } catch {
    // Ignore storage failures (private mode/quota) and continue gameplay.
  }
}

function clearLocalProgress(): void {
  try {
    localStorage.removeItem(LOCAL_SAVE_KEY);
  } catch {
    // Ignore storage failures.
  }
}

function readLocalProgress(): LocalProgressSnapshot | null {
  try {
    const raw = localStorage.getItem(LOCAL_SAVE_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as Partial<LocalProgressSnapshot>;
    const completedPuzzleIds = Array.isArray(parsed.completedPuzzleIds)
      ? parsed.completedPuzzleIds.filter((id): id is string => typeof id === "string")
      : [];

    return {
      completedPuzzleIds,
      activeStationId: typeof parsed.activeStationId === "string" ? parsed.activeStationId : null,
      practicePuzzleId: typeof parsed.practicePuzzleId === "string" ? parsed.practicePuzzleId : null,
      learningProgressByPuzzle: typeof parsed.learningProgressByPuzzle === "object" && parsed.learningProgressByPuzzle != null
        ? Object.fromEntries(
          Object.entries(parsed.learningProgressByPuzzle)
            .filter(([id, value]) => typeof id === "string" && typeof value === "object" && value != null)
            .map(([id, value]) => [id, { quizPassed: Boolean((value as { quizPassed?: boolean }).quizPassed) }]),
        )
        : undefined,
    };
  } catch {
    return null;
  }
}

function restoreLocalProgress(): void {
  const snapshot = readLocalProgress();
  if (!snapshot) {
    return;
  }

  learningProgressByPuzzle = snapshot.learningProgressByPuzzle ?? {};

  const orderedPuzzleIds = [...new Set(snapshot.completedPuzzleIds)].sort((a, b) => {
    const ai = Number(a.split("-")[1] ?? 0);
    const bi = Number(b.split("-")[1] ?? 0);
    return ai - bi;
  });

  for (const puzzleId of orderedPuzzleIds) {
    game.completePuzzle(puzzleId, getDemoSolution(puzzleId));
  }

  if (game.getProgress().finalCanvasUnlocked) {
    activeStationId = null;
    practicePuzzleId = null;
    game.sceneManager.transitionScene(SceneType.FinalCanvasScene);
    return;
  }

  const station = snapshot.activeStationId ? game.stationManager.getStation(snapshot.activeStationId) : null;
  if (station?.unlocked) {
    activeStationId = station.id;
    game.sceneManager.transitionScene(SceneType.PuzzleScene);
  } else {
    activeStationId = null;
    game.sceneManager.transitionScene(SceneType.StudioScene);
  }

  if (snapshot.practicePuzzleId) {
    const puzzle = game.puzzleManager.getPuzzle(snapshot.practicePuzzleId);
    practicePuzzleId = puzzle?.solved ? snapshot.practicePuzzleId : null;
  }
}

function initializeGame(options: { restoreFromLocal?: boolean } = {}): void {
  const restoreFromLocal = options.restoreFromLocal ?? true;
  game = new Game();
  game.initialize();
  activeStationId = null;
  practicePuzzleId = null;
  artPad.pixels = new Array(artPad.cols * artPad.rows).fill("#ffffff");
  puzzleUiState.clear();
  learningUiState.clear();
  learningProgressByPuzzle = {};
  selectedArtColor = artPalette[0];
  _lastCollectedSnapshot = "";

  if (restoreFromLocal) {
    restoreLocalProgress();
  }

  render();
  window.dispatchEvent(new Event("ctg:ready"));
}

function circularHueDistance(a: number, b: number): number {
  const d = Math.abs((((a - b) % 360) + 360) % 360);
  return Math.min(d, 360 - d);
}

function shuffleArray<T>(items: T[]): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function isTriadValid(h1: number, h2: number, h3: number): boolean {
  const values = [h1, h2, h3].map((h) => ((h % 360) + 360) % 360).sort((a, b) => a - b);
  const gaps = [
    (values[1] - values[0] + 360) % 360,
    (values[2] - values[1] + 360) % 360,
    (values[0] + 360 - values[2]) % 360,
  ];
  return gaps.every((gap) => Math.abs(gap - 120) <= 15);
}

function validatePuzzleInput(puzzleId: string, input: any): boolean {
  switch (puzzleId) {
    case "puzzle-01":
      return Boolean(input.redBeam && input.greenBeam && input.blueBeam && input.overlap);
    case "puzzle-02": {
      const tol = 0.08;
      return Math.abs(input.cyan - input.target.cyan) <= tol && Math.abs(input.magenta - input.target.magenta) <= tol && Math.abs(input.yellow - input.target.yellow) <= tol;
    }
    case "puzzle-03": {
      const pair = [input.pigments?.[0], input.pigments?.[1]].map((p: string) => String(p).toLowerCase()).sort().join("+");
      return ["blue+orange", "green+red", "purple+yellow"].includes(pair) && Boolean(input.luminousShadow);
    }
    case "puzzle-04":
      return Boolean(input.usesOnlyBlackAndWhite && input.blurReadability >= 0.75);
    case "puzzle-05":
      return Array.isArray(input.orderedValues) && input.orderedValues.length >= 5 && input.orderedValues.every((v: number, i: number, arr: number[]) => i === 0 || v >= arr[i - 1]) && Boolean(input.hiddenImageRevealed);
    case "puzzle-06":
      return Array.isArray(input.exploredHues) && input.exploredHues.length >= 3 && Boolean(input.discoveredDifferentChromaPeaks);
    case "puzzle-07": {
      const map: Record<string, string> = { red: "green", green: "red", blue: "orange", orange: "blue", yellow: "purple", purple: "yellow" };
      return map[String(input.selectedColorA).toLowerCase()] === String(input.selectedColorB).toLowerCase();
    }
    case "puzzle-08":
      return isTriadValid(input.hueAngles[0], input.hueAngles[1], input.hueAngles[2]);
    case "puzzle-09": {
      const correct: Record<string, string> = {
        "joyful carnival": "C",
        "calm ocean": "A",
        "creepy dungeon": "B",
        "romantic sunset": "D",
        "focused studio": "A",
        "mystical and premium": "D",
      };
      const sel = (input as { selections?: Record<string, string> }).selections;
      return sel != null && Object.entries(correct).every(([mood, id]) => sel[mood] === id);
    }
    case "puzzle-10":
      return Boolean(input.backgroundsAdjusted && input.perceivedDifference <= 0.05);
    case "puzzle-11":
      return Boolean(input.usedOrangeSurroundings && !input.greySquareChanged);
    case "puzzle-12":
      return Boolean(input.neutralCount >= 2 && input.accentContrast >= 0.65);
    case "puzzle-13":
      return Boolean(input.edgeSharpnessDropsWithDistance && input.saturationDropsWithDistance && input.hueShiftsCoolerWithDistance);
    case "puzzle-14":
      return Boolean(input.farObjectsShiftBlue && input.scatteringStrength >= 0.7);
    case "puzzle-15":
      return Boolean(
        input.palettesMatched &&
        input.sunHeight < 0.35 &&
        input.colorTemperature > 0.70 &&
        input.atmosphere >= 0.40 &&
        input.atmosphere <= 0.60,
      );
    case "puzzle-16": {
      const pigments = (input.pigments as string[]).map((p) => p.toLowerCase().trim());
      if (pigments.length !== 2) {
        return false;
      }

      const yellowFamily = new Set([
        "hansa yellow", "cadmium lemon", "nickel azo yellow", "bismuth vanadate yellow",
        "indian yellow", "aureolin", "cadmium yellow medium", "naples yellow",
        "raw sienna", "yellow ochre",
      ]);
      const blueFamily = new Set([
        "phthalo blue", "cerulean blue", "cobalt teal", "manganese blue",
        "cobalt blue", "ultramarine", "prussian blue", "indanthrone blue",
        "phthalo blue red shade", "french ultramarine",
      ]);
      const hasYellow = pigments.some((pigment) => yellowFamily.has(pigment));
      const hasBlue = pigments.some((pigment) => blueFamily.has(pigment));
      return hasYellow && hasBlue && input.mudLevel <= 0.16;
    }
    case "puzzle-17":
      return Boolean((input.mudLevel ?? 1) < 0.58);
    case "puzzle-18":
      return Boolean(input.usedPureDots && !input.mixedOnPalette && input.opticalBlendVisible);
    case "puzzle-19":
      return (
        Math.abs(input.primaryPct - 60) <= 5 &&
        Math.abs(input.secondaryPct - 30) <= 5 &&
        Math.abs(input.accentPct - 10) <= 3 &&
        Math.abs(input.primaryPct + input.secondaryPct + input.accentPct - 100) <= 2
      );
    case "puzzle-20": {
      const correct: Record<string, string> = {
        red: "excitement",
        blue: "trust",
        yellow: "optimism",
        green: "growth",
      };
      const mappings = input.mappings as Record<string, string> | undefined;
      return mappings != null && Object.entries(correct).every(([color, emotion]) => mappings[color] === emotion);
    }
    case "puzzle-21": {
      const normalizedDelta = (((input.hueB - input.hueA) % 360) + 360) % 360;
      const diff = Math.abs(normalizedDelta - 180);
      return diff <= 20 && Boolean(input.valueBalanced);
    }
    default:
      return false;
  }
}

function ensureState<T>(puzzleId: string, initial: T): T {
  const existing = puzzleUiState.get(puzzleId) as T | undefined;
  if (existing) {
    return existing;
  }

  puzzleUiState.set(puzzleId, initial);
  return initial;
}

function enterStation(stationId: string): void {
  activeStationId = stationId;
  game.sceneManager.transitionScene(SceneType.PuzzleScene);
  render();
}

function leaveStation(): void {
  activeStationId = null;
  game.sceneManager.transitionScene(SceneType.StudioScene);
  render();
}

function getNextStationFor(currentStationId: string) {
  const stations = game.stationManager.getAllStations();
  const currentIndex = stations.findIndex((station) => station.id === currentStationId);

  if (currentIndex < 0) {
    return null;
  }

  const sequentialNext = stations.slice(currentIndex + 1).find((station) => station.unlocked);
  if (sequentialNext) {
    return sequentialNext;
  }

  return stations.find((station) => station.id !== currentStationId && station.unlocked && !station.completed) ?? null;
}

function goToNextStation(currentStationId: string): void {
  const nextStation = getNextStationFor(currentStationId);
  if (!nextStation) {
    return;
  }

  practicePuzzleId = null;
  enterStation(nextStation.id);
}

function updateProgressPanel(): void {
  progressEl.textContent = "";
  updateHud();
}

function makePuzzleCard(puzzleId: string, title: string, state: string): HTMLDivElement {
  const wrapper = document.createElement("div");
  wrapper.className = "puzzle-item";

  const meta = document.createElement("div");
  const objective = puzzleObjectives[puzzleId] ?? "Complete the puzzle objective.";
  meta.innerHTML = `<strong>${title}</strong><div class="puzzle-meta">${puzzleId} | ${state}</div><div class="puzzle-objective">Objective: ${objective}</div>`;

  wrapper.appendChild(meta);

  const infoBtn = document.createElement("button");
  infoBtn.className = "info-btn";
  infoBtn.textContent = "i";
  infoBtn.setAttribute("aria-label", `Learn about ${title}`);
  infoBtn.addEventListener("click", () => openInfoModal(puzzleId));
  wrapper.appendChild(infoBtn);

  return wrapper;
}

function renderLockedOrSolvedControls(wrapper: HTMLDivElement, puzzleId: string, state: string): boolean {
  if (state === "locked") {
    const label = document.createElement("span");
    label.className = "pill locked";
    label.textContent = "Locked";
    wrapper.appendChild(label);
    return true;
  }

  if (state === "solved") {
    const label = document.createElement("span");
    label.className = "pill solved";
    label.textContent = "Solved";
    wrapper.appendChild(label);

    const replayButton = document.createElement("button");
    replayButton.className = "btn btn-secondary";
    replayButton.textContent = "Practice";
    replayButton.addEventListener("click", () => {
      practicePuzzleId = puzzleId;
      puzzleUiState.delete(puzzleId);
      learningUiState.delete(puzzleId);
      if (puzzleId === "puzzle-18") {
        artPad.pixels.fill("#ffffff");
      }
      render();
    });
    wrapper.appendChild(replayButton);

    if (puzzleLearningContent[puzzleId]) {
      addReviewIntroButton(wrapper, puzzleId);
    }

    return true;
  }

  return false;
}

/**
 * Remove any existing Result Analysis panel from a puzzle wrapper.
 * Called at the start of each new attempt so stale feedback is cleared.
 */
function clearResultAnalysis(wrapper: HTMLDivElement): void {
  wrapper.querySelector(".result-analysis")?.remove();
}

/**
 * Render a "Result Analysis" panel inside the puzzle wrapper, listing
 * player-facing explanations for the detected failure reasons.
 *
 * The panel occupies the full grid width (grid-column: 1/-1) and sits below
 * the puzzle controls.  It is removed on the next check attempt.
 */
function showResultAnalysis(
  wrapper: HTMLDivElement,
  reasons: FailureReasonCode[],
): void {
  if (reasons.length === 0) {
    return;
  }

  const panel = document.createElement("div");
  panel.className = "result-analysis";

  const title = document.createElement("div");
  title.className = "result-analysis__title";
  title.textContent = "Result Analysis";
  panel.appendChild(title);

  const list = document.createElement("ul");
  list.className = "result-analysis__list";

  for (const code of reasons) {
    const item = document.createElement("li");
    item.className = "result-analysis__item";
    item.textContent = FAILURE_EXPLANATIONS[code];
    list.appendChild(item);
  }

  panel.appendChild(list);
  wrapper.appendChild(panel);
}

/**
 * Trigger a CSS shake animation on a puzzle wrapper on failure, and show a
 * Result Analysis panel when specific failure reasons are available.
 *
 * Reading a layout property forces a reflow, which lets the browser restart
 * the shake animation even when the class is removed and re-added in the same
 * event-loop tick.
 */
function triggerFailFeedback(
  wrapper: HTMLDivElement,
  button: HTMLButtonElement,
  reasons: FailureReasonCode[] = [],
): void {
  button.textContent = "Try Again";
  wrapper.classList.remove("--failed");
  wrapper.getBoundingClientRect(); // force reflow
  wrapper.classList.add("--failed");
  showResultAnalysis(wrapper, reasons);
  setTimeout(() => {
    button.textContent = "Check";
    wrapper.classList.remove("--failed");
  }, 900);
}

function addCheckButton(wrapper: HTMLDivElement, puzzleId: string, inputFactory: () => unknown): void {
  const controls = document.createElement("div");
  controls.className = "action-row";

  const button = document.createElement("button");
  button.className = "btn btn-primary";
  button.textContent = "Check";
  button.addEventListener("click", () => {
    const input = inputFactory();
    const puzzleMeta = game.puzzleManager.getPuzzle(puzzleId);
    const puzzle = game.puzzleManager.getPuzzle(puzzleId);
    const wasFinalCanvasUnlocked = game.getProgress().finalCanvasUnlocked;
    // Compute failure reasons once so both branches can reuse the same result.
    const failureReasons = diagnoseFailure(puzzleId, input);
    clearResultAnalysis(wrapper);
    if (puzzle?.solved) {
      const valid = validatePuzzleInput(puzzleId, input as any);
      if (!valid) {
        triggerFailFeedback(wrapper, button, failureReasons);
        return;
      }

      const practiceEvent = game.practiceComplete(puzzleId, true);
      if (practiceEvent && practiceEvent.delta > 0) {
        showToast(practiceEvent.reason, { kind: "success", icon: "🎯" });
        updateHud();
      }
      button.textContent = "Practiced ✓";
      setTimeout(() => {
        button.textContent = "Check";
      }, 900);
      return;
    }

    const scoreEvent = game.completePuzzle(puzzleId, input);
    if (!scoreEvent) {
      triggerFailFeedback(wrapper, button, failureReasons);
      return;
    }

    showToast(scoreEvent.reason, { kind: "success", icon: "🏆" });

    if (scoreEvent.reason.includes("Pet Rescued") && puzzleMeta) {
      const petName = PET_NAMES[puzzleMeta.rewardPetId] ?? "New Pet";
      showToast(`Pet unlocked: ${petName}`, { kind: "success", petId: puzzleMeta.rewardPetId });
    }

    if (scoreEvent.reason.includes("Station Complete") && puzzleMeta) {
      const stationName = game.stationManager.getStation(puzzleMeta.stationId)?.name ?? "Station";
      showToast(`Level complete: ${stationName}`, { kind: "success", icon: "✅" });
    }

    const isFinalCanvasUnlocked = game.getProgress().finalCanvasUnlocked;
    if (!wasFinalCanvasUnlocked && isFinalCanvasUnlocked) {
      activeStationId = null;
    }
    render();
  });

  const learnButton = document.createElement("button");
  learnButton.className = "btn btn-secondary";
  learnButton.textContent = "Learn";
  learnButton.addEventListener("click", () => {
    void openInfoModal(puzzleId);
  });

  controls.appendChild(button);
  controls.appendChild(learnButton);
  wrapper.appendChild(controls);
}

function addMiniLabel(container: HTMLElement, text: string): void {
  const label = document.createElement("div");
  label.className = "mini-label";
  label.textContent = text;
  container.appendChild(label);
}

function addSlider(container: HTMLElement, label: string, value: number, min = 0, max = 1, step = 0.01, onInput: (value: number) => void): HTMLInputElement {
  return mountMuiSlider(container, label, value, min, max, step, onInput);
}

function addSelect(container: HTMLElement, label: string, options: string[], current: string, onChange: (value: string) => void): HTMLSelectElement {
  return mountMuiSelect(container, label, options, current, onChange);
}

function addCheckbox(container: HTMLElement, label: string, checked: boolean, onChange: (checked: boolean) => void): HTMLInputElement {
  return mountMuiCheckbox(container, label, checked, onChange);
}

function createInteractionZone(wrapper: HTMLDivElement): HTMLDivElement {
  const zone = document.createElement("div");
  zone.className = "mini-zone";
  wrapper.appendChild(zone);
  return zone;
}

function getLearningUiState(puzzleId: string, initialStage: LearningStage, questionCount: number): LearningUiState {
  const existing = learningUiState.get(puzzleId);
  if (existing) {
    return existing;
  }

  const next: LearningUiState = {
    stage: initialStage,
    selections: new Array(questionCount).fill(-1),
    feedback: "",
  };

  learningUiState.set(puzzleId, next);
  return next;
}

function addReviewIntroButton(container: HTMLElement, puzzleId: string): void {
  const reviewButton = document.createElement("button");
  reviewButton.className = "btn btn-secondary learning-review-btn";
  reviewButton.textContent = "Review Introduction";
  reviewButton.addEventListener("click", () => openInfoModal(puzzleId));
  container.appendChild(reviewButton);
}

function addChromaTreeToggle(container: HTMLElement): void {
  const toggleButton = document.createElement("button");
  toggleButton.className = "btn learning-tool-toggle-btn";
  toggleButton.textContent = showChromaTreeExplorer ? "Hide Chroma Tree" : "Explore Chroma Tree";
  toggleButton.addEventListener("click", () => {
    showChromaTreeExplorer = !showChromaTreeExplorer;
    render();
  });
  container.appendChild(toggleButton);

  if (showChromaTreeExplorer) {
    const mountDiv = document.createElement("div");
    mountDiv.style.gridColumn = "1 / -1";
    container.appendChild(mountDiv);
    mountChromaTreeExplorer(mountDiv);
  }
}

function renderLearningIntro(zone: HTMLDivElement, puzzleId: string, onStartQuiz: () => void): void {
  const learning = puzzleLearningContent[puzzleId];
  if (!learning) {
    return;
  }

  const card = document.createElement("div");
  card.className = "learning-card learning-card--intro";

  const title = document.createElement("h4");
  title.className = "learning-title";
  title.textContent = learning.title;
  card.appendChild(title);

  const illustration = document.createElement("div");
  illustration.className = "learning-illustration";
  illustration.innerHTML = learning.illustrationSvg;
  card.appendChild(illustration);

  learning.intro.forEach((paragraph) => {
    const p = document.createElement("p");
    p.className = "learning-paragraph";
    p.textContent = paragraph;
    card.appendChild(p);
  });

  if (learning.howToWin) {
    const row = document.createElement("p");
    row.className = "learning-meta learning-meta--how";
    row.innerHTML = `<strong>How to win:</strong> ${learning.howToWin}`;
    card.appendChild(row);
  }

  if (learning.whyFailed) {
    const row = document.createElement("p");
    row.className = "learning-meta learning-meta--why";
    row.innerHTML = `<strong>Why this fails:</strong> ${learning.whyFailed}`;
    card.appendChild(row);
  }

  if (learning.tooltips && learning.tooltips.length > 0) {
    const row = document.createElement("p");
    row.className = "learning-meta learning-meta--tooltips";
    row.innerHTML = `<strong>Key terms:</strong> ${learning.tooltips.join(" · ")}`;
    card.appendChild(row);
  }

  const controls = document.createElement("div");
  controls.className = "action-row";

  const startButton = document.createElement("button");
  startButton.className = "btn btn-primary";
  startButton.textContent = "Start Quiz";
  startButton.addEventListener("click", onStartQuiz);
  controls.appendChild(startButton);

  const learnButton = document.createElement("button");
  learnButton.className = "btn btn-secondary";
  learnButton.textContent = "Learn";
  learnButton.addEventListener("click", () => {
    void openInfoModal(puzzleId);
  });
  controls.appendChild(learnButton);

  card.appendChild(controls);

  zone.appendChild(card);
}

function evaluateLearningQuiz(questions: LearningQuizQuestion[], selections: number[]): { passed: boolean; score: number; outOf: number; feedback: string } {
  let correct = 0;

  for (let i = 0; i < questions.length; i += 1) {
    if (selections[i] === questions[i].correctIndex) {
      correct += 1;
    }
  }

  const passed = correct === questions.length;
  const feedback = passed
    ? `Perfect score: ${correct}/${questions.length}. Puzzle unlocked.`
    : `Score ${correct}/${questions.length}. You need 100% to unlock this puzzle.`;

  return { passed, score: correct, outOf: questions.length, feedback };
}

function renderLearningQuiz(zone: HTMLDivElement, puzzleId: string, uiState: LearningUiState): void {
  const learning = puzzleLearningContent[puzzleId];
  if (!learning) {
    return;
  }

  const card = document.createElement("div");
  card.className = "learning-card learning-card--quiz";

  const title = document.createElement("h4");
  title.className = "learning-title";
  title.textContent = `Quiz: ${learning.title}`;
  card.appendChild(title);

  learning.quiz.forEach((question, questionIndex) => {
    const block = document.createElement("fieldset");
    block.className = "learning-question";

    const legend = document.createElement("legend");
    legend.textContent = `${questionIndex + 1}. ${question.prompt}`;
    block.appendChild(legend);

    question.options.forEach((option, optionIndex) => {
      const label = document.createElement("label");
      label.className = "learning-option";

      const input = document.createElement("input");
      input.type = "radio";
      input.name = `${puzzleId}-q-${questionIndex}`;
      input.checked = uiState.selections[questionIndex] === optionIndex;
      input.addEventListener("change", () => {
        uiState.selections[questionIndex] = optionIndex;
      });

      const text = document.createElement("span");
      text.textContent = option;

      label.appendChild(input);
      label.appendChild(text);
      block.appendChild(label);
    });

    if (uiState.feedback) {
      const explanation = document.createElement("div");
      explanation.className = "learning-explanation";
      explanation.textContent = `Tip: ${question.explanation}`;
      block.appendChild(explanation);
    }

    card.appendChild(block);
  });

  const controls = document.createElement("div");
  controls.className = "action-row";

  const submitButton = document.createElement("button");
  submitButton.className = "btn btn-primary";
  submitButton.textContent = "Submit Quiz";
  submitButton.addEventListener("click", () => {
    const unanswered = uiState.selections.some((value) => value < 0);
    if (unanswered) {
      uiState.feedback = "Answer every question before submitting.";
      render();
      return;
    }

    const result = evaluateLearningQuiz(learning.quiz, uiState.selections);
    uiState.feedback = result.feedback;

    if (result.passed) {
      learningProgressByPuzzle[puzzleId] = { quizPassed: true };
      uiState.stage = "puzzle";
      showToast("Quiz passed. Puzzle unlocked.", { kind: "success", icon: "📘" });
    }

    render();
  });
  controls.appendChild(submitButton);

  const learnButton = document.createElement("button");
  learnButton.className = "btn btn-secondary";
  learnButton.textContent = "Learn";
  learnButton.addEventListener("click", () => {
    void openInfoModal(puzzleId);
  });
  controls.appendChild(learnButton);

  const backButton = document.createElement("button");
  backButton.className = "btn btn-secondary";
  backButton.textContent = "Back to Intro";
  backButton.addEventListener("click", () => {
    uiState.stage = "intro";
    uiState.feedback = "";
    render();
  });
  controls.appendChild(backButton);

  card.appendChild(controls);

  const feedback = document.createElement("div");
  feedback.className = "mini-label learning-feedback";
  feedback.textContent = uiState.feedback || "Get every answer correct to unlock puzzle play.";
  card.appendChild(feedback);

  zone.appendChild(card);
}

function renderPuzzleMiniGame(puzzleId: string, title: string, state: string): void {
  const wrapper = makePuzzleCard(puzzleId, title, state);
  const isArtPuzzle = puzzleId === "puzzle-18";
  const isPractice = practicePuzzleId === puzzleId;
  if (!isArtPuzzle && !isPractice && renderLockedOrSolvedControls(wrapper, puzzleId, state)) {
    puzzleListEl.appendChild(wrapper);
    return;
  }

  const zone = createInteractionZone(wrapper);
  const learning = puzzleLearningContent[puzzleId];
  const puzzle = game.puzzleManager.getPuzzle(puzzleId);
  const isSolved = Boolean(puzzle?.solved);
  const hasQuizPass = Boolean(learningProgressByPuzzle[puzzleId]?.quizPassed);
  const shouldGate = Boolean(learning) && state === "available" && !isSolved && !isPractice && !hasQuizPass;

  if (shouldGate && learning) {
    const learningState = getLearningUiState(puzzleId, "intro", learning.quiz.length);

    if (learningState.stage === "intro") {
      renderLearningIntro(zone, puzzleId, () => {
        learningState.stage = "quiz";
        render();
      });
    } else {
      renderLearningQuiz(zone, puzzleId, learningState);
    }

    puzzleListEl.appendChild(wrapper);
    return;
  }

  const renderResult = renderPuzzleById(puzzleId, {
    zone,
    wrapper,
    puzzleId,
    state,
    ensureState,
    addMiniLabel,
    addSlider,
    addSelect,
    addCheckbox,
    addCheckButton,
    circularHueDistance,
    shuffleArray,
    render,
    renderArtStationMiniGame,
    appendWrapper: () => {
      puzzleListEl.appendChild(wrapper);
    },
  });

  if (!renderResult) {
    addCheckButton(wrapper, puzzleId, () => getDemoSolution(puzzleId));
  }

  if (isPractice) {
    const practiceBanner = document.createElement("div");
    practiceBanner.className = "mini-label";
    practiceBanner.textContent = "Practice mode: this puzzle is already solved, but you can replay interactions.";
    wrapper.appendChild(practiceBanner);
  }

  if (learning) {
    addReviewIntroButton(wrapper, puzzleId);
    if (puzzleId === "puzzle-06") {
      addChromaTreeToggle(wrapper);
    }
  }

  if (renderResult?.appended) {
    return;
  }

  puzzleListEl.appendChild(wrapper);
}

function getArtCoverage(): number {
  const colored = artPad.pixels.filter((pixel) => pixel !== "#ffffff").length;
  return colored / artPad.pixels.length;
}

function renderArtStationMiniGame(container: HTMLElement, wrapper: HTMLDivElement, puzzleId: string, state: string): void {
  const card = document.createElement("div");
  card.className = "art-game-card";

  const heading = document.createElement("div");
  heading.className = "art-game-heading";
  heading.innerHTML = "<strong>Art Station Mini Game</strong><div class=\"puzzle-meta\">Paint dots of pure color. Step back to see optical mixing at work.</div>";
  card.appendChild(heading);

  const swatchRow = document.createElement("div");
  swatchRow.className = "swatch-row";
  artPalette.forEach((color) => {
    const swatch = document.createElement("button");
    swatch.className = `swatch ${selectedArtColor === color ? "is-active" : ""}`;
    swatch.style.background = color;
    swatch.title = color;
    swatch.addEventListener("click", () => {
      selectedArtColor = color;
      updatePuzzlePanel();
    });
    swatchRow.appendChild(swatch);
  });
  card.appendChild(swatchRow);

  const paintCanvas = document.createElement("canvas");
  paintCanvas.className = "paint-pad";
  paintCanvas.width = 360;
  paintCanvas.height = 200;
  card.appendChild(paintCanvas);

  const opticalPreviewWrap = document.createElement("div");
  opticalPreviewWrap.className = "optical-preview-wrap";
  const opticalPreviewLabel = document.createElement("div");
  opticalPreviewLabel.className = "mini-label";
  opticalPreviewLabel.textContent = "Distance view (tiled blend preview)";
  const opticalPreviewCanvas = document.createElement("canvas");
  opticalPreviewCanvas.className = "optical-preview-canvas";
  opticalPreviewCanvas.width = 180;
  opticalPreviewCanvas.height = 100;
  opticalPreviewWrap.appendChild(opticalPreviewLabel);
  opticalPreviewWrap.appendChild(opticalPreviewCanvas);
  card.appendChild(opticalPreviewWrap);

  // Coverage bar
  const coverageWrap = document.createElement("div");
  coverageWrap.className = "coverage-wrap";
  const coverageTrack = document.createElement("div");
  coverageTrack.className = "coverage-bar-track";
  const coverageFill = document.createElement("div");
  coverageFill.className = "coverage-bar-fill";
  coverageFill.style.width = "0%";
  coverageTrack.appendChild(coverageFill);
  const coverageLabel = document.createElement("div");
  coverageLabel.className = "coverage-bar-label";
  coverageWrap.appendChild(coverageTrack);
  coverageWrap.appendChild(coverageLabel);
  card.appendChild(coverageWrap);

  const controls = document.createElement("div");
  controls.className = "action-row";
  const clearButton = document.createElement("button");
  clearButton.className = "btn btn-secondary";
  clearButton.textContent = "Clear Pad";
  clearButton.addEventListener("click", () => {
    artPad.pixels.fill("#ffffff");
    render();
  });
  controls.appendChild(clearButton);
  card.appendChild(controls);

  if (state === "available") {
    addCheckButton(wrapper, puzzleId, () => {
      const usedColors = new Set(artPad.pixels.filter((pixel) => pixel !== "#ffffff"));
      return {
        usedPureDots: getArtCoverage() >= 0.12,
        mixedOnPalette: false,
        opticalBlendVisible: usedColors.size >= 3,
      };
    });
  }

  const padCtx = paintCanvas.getContext("2d");
  const previewCtx = opticalPreviewCanvas.getContext("2d");
  if (!padCtx || !previewCtx) {
    return;
  }

  const cellW = paintCanvas.width / artPad.cols;
  const cellH = paintCanvas.height / artPad.rows;
  const previewCols = 9;
  const previewRows = 5;
  const sampleW = artPad.cols / previewCols;
  const sampleH = artPad.rows / previewRows;
  const previewCellW = opticalPreviewCanvas.width / previewCols;
  const previewCellH = opticalPreviewCanvas.height / previewRows;

  const hexToRgb = (hex: string): [number, number, number] => {
    const h = hex.replace("#", "");
    if (h.length !== 6) {
      return [255, 255, 255];
    }
    const r = Number.parseInt(h.slice(0, 2), 16);
    const g = Number.parseInt(h.slice(2, 4), 16);
    const b = Number.parseInt(h.slice(4, 6), 16);
    return [r, g, b];
  };

  const renderOpticalPreview = (): void => {
    for (let py = 0; py < previewRows; py += 1) {
      for (let px = 0; px < previewCols; px += 1) {
        const startX = Math.floor(px * sampleW);
        const endX = Math.min(artPad.cols, Math.floor((px + 1) * sampleW));
        const startY = Math.floor(py * sampleH);
        const endY = Math.min(artPad.rows, Math.floor((py + 1) * sampleH));

        let r = 0;
        let g = 0;
        let b = 0;
        let count = 0;
        for (let y = startY; y < endY; y += 1) {
          for (let x = startX; x < endX; x += 1) {
            const idx = y * artPad.cols + x;
            const [pr, pg, pb] = hexToRgb(artPad.pixels[idx]);
            r += pr;
            g += pg;
            b += pb;
            count += 1;
          }
        }

        const rr = Math.round(r / Math.max(1, count));
        const gg = Math.round(g / Math.max(1, count));
        const bb = Math.round(b / Math.max(1, count));
        previewCtx.fillStyle = `rgb(${rr}, ${gg}, ${bb})`;
        previewCtx.fillRect(px * previewCellW, py * previewCellH, previewCellW, previewCellH);
      }
    }

    previewCtx.strokeStyle = "rgba(31, 32, 48, 0.16)";
    for (let x = 0; x <= previewCols; x += 1) {
      previewCtx.beginPath();
      previewCtx.moveTo(x * previewCellW, 0);
      previewCtx.lineTo(x * previewCellW, opticalPreviewCanvas.height);
      previewCtx.stroke();
    }
    for (let y = 0; y <= previewRows; y += 1) {
      previewCtx.beginPath();
      previewCtx.moveTo(0, y * previewCellH);
      previewCtx.lineTo(opticalPreviewCanvas.width, y * previewCellH);
      previewCtx.stroke();
    }
  };

  const updateCoverage = (): void => {
    const pct = Math.round(getArtCoverage() * 100);
    coverageFill.style.width = `${pct}%`;
    const ready = pct >= 12;
    coverageFill.classList.toggle("--ready", ready);
    coverageLabel.textContent = ready
      ? `Coverage: ${pct}% ✓ Optical mixing visible!`
      : `Coverage: ${pct}% — paint more dots (need 12%)`;
  };

  const drawPad = (): void => {
    for (let row = 0; row < artPad.rows; row += 1) {
      for (let col = 0; col < artPad.cols; col += 1) {
        const idx = row * artPad.cols + col;
        padCtx.fillStyle = artPad.pixels[idx];
        padCtx.fillRect(col * cellW, row * cellH, cellW, cellH);
      }
    }

    padCtx.strokeStyle = "rgba(31, 32, 48, 0.12)";
    for (let col = 0; col <= artPad.cols; col += 1) {
      padCtx.beginPath();
      padCtx.moveTo(col * cellW, 0);
      padCtx.lineTo(col * cellW, paintCanvas.height);
      padCtx.stroke();
    }
    for (let row = 0; row <= artPad.rows; row += 1) {
      padCtx.beginPath();
      padCtx.moveTo(0, row * cellH);
      padCtx.lineTo(paintCanvas.width, row * cellH);
      padCtx.stroke();
    }

    updateCoverage();
    renderOpticalPreview();
  };

  const paintAt = (clientX: number, clientY: number): void => {
    const rect = paintCanvas.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * paintCanvas.width;
    const y = ((clientY - rect.top) / rect.height) * paintCanvas.height;
    const col = Math.max(0, Math.min(artPad.cols - 1, Math.floor(x / cellW)));
    const row = Math.max(0, Math.min(artPad.rows - 1, Math.floor(y / cellH)));
    artPad.pixels[row * artPad.cols + col] = selectedArtColor;
    drawPad();
  };

  let isPainting = false;
  paintCanvas.addEventListener("pointerdown", (event) => {
    isPainting = true;
    paintCanvas.setPointerCapture(event.pointerId);
    paintAt(event.clientX, event.clientY);
  });
  paintCanvas.addEventListener("pointermove", (event) => {
    if (!isPainting) {
      return;
    }
    paintAt(event.clientX, event.clientY);
  });
  paintCanvas.addEventListener("pointerup", () => {
    isPainting = false;
  });
  paintCanvas.addEventListener("pointerleave", () => {
    isPainting = false;
  });

  drawPad();
  container.appendChild(card);
}

function updatePuzzlePanel(): void {
  puzzleListEl.innerHTML = "";
  const scene = game.sceneManager.getCurrentScene();

  if (scene === SceneType.StudioScene) {
    const hint = document.createElement("div");
    hint.className = "puzzle-item";
    hint.innerHTML = "<div><strong>Studio Exploration</strong><div class=\"puzzle-meta\">All stations are shown below. Locked stations are disabled.</div></div>";
    puzzleListEl.appendChild(hint);

    game
      .stationManager
      .getAllStations()
      .forEach((station) => {
        const wrapper = document.createElement("div");
        wrapper.className = "puzzle-item";

        const info = document.createElement("div");
        const solved = station.puzzles.filter((puzzle) => puzzle.solved).length;
        info.innerHTML = `<strong>${station.name}</strong><div class=\"puzzle-meta\">${solved}/${station.puzzles.length} solved${station.unlocked ? "" : " • Locked"}</div>`;

        const enterButton = document.createElement("button");
        enterButton.className = station.unlocked ? "btn btn-primary" : "btn";
        enterButton.textContent = station.unlocked ? "Enter" : "Locked";
        enterButton.disabled = !station.unlocked;
        if (station.unlocked) {
          enterButton.addEventListener("click", () => enterStation(station.id));
        }

        wrapper.appendChild(info);
        wrapper.appendChild(enterButton);
        puzzleListEl.appendChild(wrapper);
      });

    upgradeMuiButtons(puzzleListEl);
    return;
  }

  if (scene === SceneType.FinalCanvasScene) {
    const message = document.createElement("div");
    message.className = "puzzle-item";
    message.innerHTML = "<div><strong>Grand Canvas Unlocked</strong><div class=\"puzzle-meta\">All pets are free. You can now paint the final masterpiece.</div></div>";
    puzzleListEl.appendChild(message);

    const backWrapper = document.createElement("div");
    backWrapper.className = "puzzle-item";
    const backInfo = document.createElement("div");
    backInfo.innerHTML = "<strong>Explore Unlocked Studio</strong><div class=\"puzzle-meta\">Return to station scenes and keep experimenting.</div>";
    const backButton = document.createElement("button");
    backButton.className = "btn btn-secondary";
    backButton.textContent = "Return";
    backButton.addEventListener("click", () => {
      game.sceneManager.transitionScene(SceneType.StudioScene);
      render();
    });
    backWrapper.appendChild(backInfo);
    backWrapper.appendChild(backButton);
    puzzleListEl.appendChild(backWrapper);
    upgradeMuiButtons(puzzleListEl);
    return;
  }

  if (!activeStationId) {
    return;
  }

  const station = game.stationManager.getStation(activeStationId);
  if (!station) {
    return;
  }

  const nextStation = getNextStationFor(station.id);

  const backWrapper = document.createElement("div");
  backWrapper.className = "puzzle-item";
  const label = document.createElement("div");
  label.innerHTML = `<strong>${station.name}</strong><div class=\"puzzle-meta\">Puzzle Scene</div>`;
  const backButton = document.createElement("button");
  backButton.className = "btn btn-secondary";
  backButton.textContent = "Back";
  backButton.addEventListener("click", () => leaveStation());
  backWrapper.appendChild(label);
  backWrapper.appendChild(backButton);
  puzzleListEl.appendChild(backWrapper);

  station.puzzles.forEach((puzzle) => {
    renderPuzzleMiniGame(puzzle.id, puzzle.title, puzzle.state);
  });

  if (station.completed && nextStation) {
    const completionWrapper = document.createElement("div");
    completionWrapper.className = "station-complete-cta";

    const copyBlock = document.createElement("div");
    copyBlock.className = "station-complete-cta__copy";

    const completionMessage = document.createElement("p");
    completionMessage.className = "station-complete-cta__message";
    completionMessage.textContent = "You’ve completed all puzzles in this station.";

    const nextHint = document.createElement("div");
    nextHint.className = "station-complete-cta__hint";
    nextHint.textContent = `Next station: ${nextStation.name}`;

    const nextButton = document.createElement("button");
    nextButton.className = "btn btn-accent station-complete-cta__button";
    nextButton.textContent = "Station Complete! Go to Next Station →";
    nextButton.setAttribute("aria-label", `Station complete. Go to next station: ${nextStation.name}`);
    nextButton.addEventListener("click", () => goToNextStation(station.id));

    copyBlock.appendChild(completionMessage);
    copyBlock.appendChild(nextHint);
    completionWrapper.appendChild(copyBlock);
    completionWrapper.appendChild(nextButton);
    puzzleListEl.appendChild(completionWrapper);
  }

  upgradeMuiButtons(puzzleListEl);
}

function render(): void {
  updateProgressPanel();
  updatePuzzlePanel();
  persistLocalProgress();
}

autoSolveButton.addEventListener("click", () => {
  const totalPuzzles = game.getProgress().total;
  for (let i = 1; i <= totalPuzzles; i += 1) {
    const puzzleId = `puzzle-${String(i).padStart(2, "0")}`;
    game.completePuzzle(puzzleId, getDemoSolution(puzzleId));
  }

  if (game.getProgress().finalCanvasUnlocked) {
    activeStationId = null;
  }

  render();
});

resetButton.addEventListener("click", () => {
  clearLocalProgress();
  skipNextPersist = true;
  initializeGame({ restoreFromLocal: false });
});

initializeGame();
