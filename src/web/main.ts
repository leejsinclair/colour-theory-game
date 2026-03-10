import { getDemoSolution } from "../content/demoSolutions";
import { Game } from "../game/Game";
import { SceneType } from "../types/gameTypes";
import "./styles.css";

type NodePoint = {
  x: number;
  y: number;
  hue: number;
};

type TransitionState = {
  active: boolean;
  startedAt: number;
  durationMs: number;
  label: string;
};

const canvas = document.getElementById("studio-canvas") as HTMLCanvasElement;
const progressEl = document.getElementById("progress") as HTMLPreElement;
const puzzleListEl = document.getElementById("puzzle-list") as HTMLDivElement;
const autoSolveButton = document.getElementById("auto-solve") as HTMLButtonElement;
const resetButton = document.getElementById("reset") as HTMLButtonElement;

function requireContext2D(target: HTMLCanvasElement): CanvasRenderingContext2D {
  const value = target.getContext("2d");
  if (!value) {
    throw new Error("Canvas context unavailable");
  }
  return value;
}

const ctx = requireContext2D(canvas);

let game = new Game();
let activeStationId: string | null = null;
let practicePuzzleId: string | null = null;

const transition: TransitionState = {
  active: false,
  startedAt: 0,
  durationMs: 520,
  label: "",
};

const stationSceneFlavor: Record<string, { title: string; subtitle: string; tint: string }> = {
  "station-01": {
    title: "Light Laboratory",
    subtitle: "Tune beams, mirrors, and additive light alignment.",
    tint: "rgba(255, 190, 140, 0.28)",
  },
  "station-02": {
    title: "Value Sketchboard",
    subtitle: "Read forms by value before color.",
    tint: "rgba(165, 178, 204, 0.32)",
  },
  "station-03": {
    title: "Color Wheel Table",
    subtitle: "Build harmony with complements and triads.",
    tint: "rgba(235, 194, 100, 0.28)",
  },
  "station-04": {
    title: "Optical Illusion Wall",
    subtitle: "Perception changes color more than pigment does.",
    tint: "rgba(219, 130, 189, 0.3)",
  },
  "station-05": {
    title: "Window Landscape",
    subtitle: "Depth emerges from atmosphere and value compression.",
    tint: "rgba(120, 183, 227, 0.3)",
  },
  "station-06": {
    title: "Paint Workbench",
    subtitle: "Pigment craft: clean mixes and optical blending.",
    tint: "rgba(136, 208, 156, 0.3)",
  },
};

const puzzleObjectives: Record<string, string> = {
  "puzzle-01": "Align red, green, and blue beams so they overlap into white light.",
  "puzzle-02": "Match the target swatch by dialing cyan, magenta, and yellow correctly.",
  "puzzle-03": "Mix complementary pigments to create a rich luminous black.",
  "puzzle-04": "Keep the grayscale structure readable when the image is blurred.",
  "puzzle-05": "Order value tiles from darkest to lightest to reveal the hidden mark.",
  "puzzle-06": "Explore each hue branch and discover that chroma peaks differ by hue.",
  "puzzle-07": "Pick true complementary pairs across the wheel.",
  "puzzle-08": "Space three hues around 120deg apart to form a triadic harmony.",
  "puzzle-09": "Build palette tags that fit the selected emotional prompt.",
  "puzzle-10": "Adjust surrounds until the two identical center squares look the same.",
  "puzzle-11": "Use orange context to make the fixed grey square read as cooler/blue.",
  "puzzle-12": "Use neutrals so a single accent color stands out clearly.",
  "puzzle-13": "Apply depth cues: softer edges, lower saturation, and cooler distance hues.",
  "puzzle-14": "Increase atmospheric scattering so far objects shift toward blue.",
  "puzzle-15": "Mix warm sunset colors before nightfall, then adapt to blue hour.",
  "puzzle-16": "Mix phthalo blue + hansa yellow and keep mud low for vibrant green.",
  "puzzle-17": "Avoid overmixing complements to prevent muddy results.",
  "puzzle-18": "Paint pure color dots and reach enough coverage for optical blending.",
};

const artPalette = ["#0d8db0", "#ec7755", "#2f9e44", "#f0b429", "#6f42c1", "#1f2030"];
let selectedArtColor = artPalette[0];
const artPad = {
  cols: 18,
  rows: 10,
  pixels: [] as string[],
};

const puzzleUiState = new Map<string, unknown>();

const player = {
  x: 80,
  y: 460,
  targetX: 80,
  targetY: 460,
  speed: 210,
};

const stationNodes: Record<string, NodePoint> = {
  "station-01": { x: 220, y: 160, hue: 18 },
  "station-02": { x: 140, y: 360, hue: 245 },
  "station-03": { x: 430, y: 360, hue: 45 },
  "station-04": { x: 660, y: 300, hue: 310 },
  "station-05": { x: 820, y: 160, hue: 196 },
  "station-06": { x: 560, y: 110, hue: 126 },
};

const stationLinks: Array<[string, string]> = [
  ["station-01", "station-02"],
  ["station-01", "station-03"],
  ["station-03", "station-04"],
  ["station-04", "station-05"],
  ["station-01", "station-06"],
  ["station-06", "station-05"],
];

function initializeGame(): void {
  game = new Game();
  game.initialize();
  activeStationId = null;
  practicePuzzleId = null;
  transition.active = false;
  player.x = 80;
  player.y = 460;
  player.targetX = 80;
  player.targetY = 460;
  artPad.pixels = new Array(artPad.cols * artPad.rows).fill("#ffffff");
  puzzleUiState.clear();
  selectedArtColor = artPalette[0];
  render();
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
      const req: Record<string, string[]> = {
        "joyful carnival": ["warm", "high contrast", "saturated"],
        "calm ocean": ["blue", "teal", "low contrast"],
        "creepy dungeon": ["desaturated", "green", "dark"],
      };
      const prompt = String(input.prompt).toLowerCase().trim();
      const tags = (input.paletteTags as string[]).map((t) => t.toLowerCase().trim());
      return (req[prompt] ?? []).every((tag) => tags.includes(tag));
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
      return Boolean(input.warmPaletteMixed && input.completedBeforeNightfall && input.adaptedToBlueHour);
    case "puzzle-16": {
      const pigments = (input.pigments as string[]).map((p) => p.toLowerCase());
      return pigments.includes("phthalo blue") && pigments.includes("hansa yellow") && input.mudLevel <= 0.3;
    }
    case "puzzle-17":
      return Boolean(input.complementPairsAdded <= 1 && !input.muddyResult);
    case "puzzle-18":
      return Boolean(input.usedPureDots && !input.mixedOnPalette && input.opticalBlendVisible);
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

function distance(aX: number, aY: number, bX: number, bY: number): number {
  const dx = aX - bX;
  const dy = aY - bY;
  return Math.sqrt(dx * dx + dy * dy);
}

function updatePlayer(deltaSeconds: number): void {
  const dx = player.targetX - player.x;
  const dy = player.targetY - player.y;
  const len = Math.sqrt(dx * dx + dy * dy);

  if (len < 0.2) {
    return;
  }

  const maxStep = player.speed * deltaSeconds;
  if (len <= maxStep) {
    player.x = player.targetX;
    player.y = player.targetY;
    return;
  }

  player.x += (dx / len) * maxStep;
  player.y += (dy / len) * maxStep;
}

function getCanvasPoint(event: MouseEvent): { x: number; y: number } {
  const rect = canvas.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width) * canvas.width;
  const y = ((event.clientY - rect.top) / rect.height) * canvas.height;
  return { x, y };
}

function startTransition(label: string): void {
  transition.active = true;
  transition.startedAt = performance.now();
  transition.label = label;
}

function enterStation(stationId: string): void {
  activeStationId = stationId;
  const stationName = game.stationManager.getStation(stationId)?.name ?? "Station";
  startTransition(`Entering ${stationName}`);
  game.sceneManager.transitionScene(SceneType.PuzzleScene);
  render();
}

function leaveStation(): void {
  startTransition("Returning to Studio");
  activeStationId = null;
  game.sceneManager.transitionScene(SceneType.StudioScene);
  render();
}

function tryEnterNearbyStation(stationId: string): void {
  const node = stationNodes[stationId];
  const nearEnough = distance(player.x, player.y, node.x, node.y) <= 95;
  if (nearEnough) {
    enterStation(stationId);
    return;
  }

  player.targetX = node.x;
  player.targetY = node.y;
}

function findStationAtPoint(x: number, y: number): string | null {
  const stations = game.stationManager.getAllStations();
  for (const station of stations) {
    if (!station.unlocked) {
      continue;
    }

    const node = stationNodes[station.id];
    if (distance(x, y, node.x, node.y) <= 40) {
      return station.id;
    }
  }

  return null;
}

function drawBackground(time: number): void {
  const phase = Math.sin(time / 800) * 6;
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, "#fff9e8");
  gradient.addColorStop(1, "#e8f5ff");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "rgba(60, 90, 150, 0.05)";
  for (let i = 0; i < 4; i += 1) {
    ctx.beginPath();
    ctx.arc(110 + i * 240 + phase, 60 + i * 30, 58 + i * 9, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawStations(time: number): void {
  const stations = game.stationManager.getAllStations();

  stationLinks.forEach(([from, to]) => {
    const a = stationNodes[from];
    const b = stationNodes[to];
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.lineWidth = 4;
    ctx.strokeStyle = "rgba(46, 59, 82, 0.15)";
    ctx.stroke();
  });

  stations.forEach((station, index) => {
    const node = stationNodes[station.id];
    const solvedCount = station.puzzles.filter((p) => p.solved).length;
    const pulse = Math.sin(time / 360 + index) * 3;
    const radius = 34 + pulse + (station.id === activeStationId ? 4 : 0);

    ctx.beginPath();
    if (!station.unlocked) {
      ctx.fillStyle = "rgba(100, 100, 120, 0.35)";
    } else if (station.id === activeStationId) {
      ctx.fillStyle = `hsla(${node.hue}, 85%, 54%, 0.95)`;
    } else {
      ctx.fillStyle = `hsla(${node.hue}, 80%, 58%, 0.85)`;
    }
    ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.lineWidth = 2;
    ctx.strokeStyle = "rgba(30, 30, 40, 0.35)";
    ctx.stroke();

    ctx.fillStyle = "#1f2030";
    ctx.font = "600 14px 'Space Grotesk', sans-serif";
    ctx.fillText(station.name, node.x - 58, node.y + 56);
    ctx.font = "500 12px 'Space Grotesk', sans-serif";
    ctx.fillStyle = "rgba(31, 32, 48, 0.75)";
    ctx.fillText(`${solvedCount}/3 solved`, node.x - 35, node.y + 72);
  });
}

function drawPlayer(time: number): void {
  const bob = Math.sin(time / 220) * 1.5;
  const x = player.x;
  const y = player.y + bob;

  ctx.beginPath();
  ctx.fillStyle = "rgba(13, 141, 176, 0.18)";
  ctx.arc(x, y + 12, 14, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.fillStyle = "#0d8db0";
  ctx.arc(x, y, 10, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.fillStyle = "#f8fdff";
  ctx.arc(x - 3, y - 2, 2, 0, Math.PI * 2);
  ctx.arc(x + 3, y - 2, 2, 0, Math.PI * 2);
  ctx.fill();
}

function drawSceneOverlay(): void {
  const scene = game.sceneManager.getCurrentScene();
  if (scene !== SceneType.PuzzleScene || !activeStationId) {
    return;
  }

  const node = stationNodes[activeStationId];
  const flavor = stationSceneFlavor[activeStationId];

  ctx.fillStyle = flavor.tint;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const gradient = ctx.createRadialGradient(node.x, node.y, 44, node.x, node.y, 240);
  gradient.addColorStop(0, "rgba(255, 255, 255, 0)");
  gradient.addColorStop(1, "rgba(20, 22, 32, 0.42)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
  ctx.fillRect(24, canvas.height - 88, canvas.width - 48, 58);
  ctx.strokeStyle = "rgba(31, 32, 48, 0.2)";
  ctx.lineWidth = 1;
  ctx.strokeRect(24, canvas.height - 88, canvas.width - 48, 58);

  ctx.fillStyle = "#1f2030";
  ctx.font = "700 16px 'Space Grotesk', sans-serif";
  ctx.fillText(flavor.title, 40, canvas.height - 62);
  ctx.font = "500 13px 'Space Grotesk', sans-serif";
  ctx.fillStyle = "rgba(31, 32, 48, 0.78)";
  ctx.fillText(flavor.subtitle, 40, canvas.height - 42);
}

function drawTransitionOverlay(time: number): void {
  if (!transition.active) {
    return;
  }

  const elapsed = time - transition.startedAt;
  const t = Math.min(1, elapsed / transition.durationMs);
  const alpha = t < 0.5 ? t * 1.5 : (1 - t) * 1.5;

  ctx.fillStyle = `rgba(20, 22, 32, ${Math.max(0, alpha * 0.6)})`;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (alpha > 0.02) {
    ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
    ctx.font = "700 24px 'Fraunces', serif";
    const width = ctx.measureText(transition.label).width;
    ctx.fillText(transition.label, canvas.width / 2 - width / 2, canvas.height / 2);
  }

  if (t >= 1) {
    transition.active = false;
  }
}

function updateProgressPanel(): void {
  const progress = game.getProgress();
  const scene = game.sceneManager.getCurrentScene();
  const stationLabel = activeStationId ? game.stationManager.getStation(activeStationId)?.name ?? "Unknown" : "None";
  progressEl.textContent = [
    `Solved Puzzles : ${progress.solved}/${progress.total}`,
    `Pets Collected : ${progress.petsCollected}/18`,
    `Current Scene  : ${scene}`,
    `Active Station : ${stationLabel}`,
    "Tip: Click unlocked stations to enter puzzle mode.",
    `Final Canvas   : ${progress.finalCanvasUnlocked ? "Unlocked" : "Locked"}`,
  ].join("\n");
}

function makePuzzleCard(puzzleId: string, title: string, state: string): HTMLDivElement {
  const wrapper = document.createElement("div");
  wrapper.className = "puzzle-item";

  const meta = document.createElement("div");
  const objective = puzzleObjectives[puzzleId] ?? "Complete the puzzle objective.";
  meta.innerHTML = `<strong>${title}</strong><div class="puzzle-meta">${puzzleId} | ${state}</div><div class="puzzle-objective">Objective: ${objective}</div>`;

  wrapper.appendChild(meta);
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
    replayButton.className = "btn";
    replayButton.textContent = "Practice";
    replayButton.addEventListener("click", () => {
      practicePuzzleId = puzzleId;
      puzzleUiState.delete(puzzleId);
      if (puzzleId === "puzzle-18") {
        artPad.pixels.fill("#ffffff");
      }
      render();
    });
    wrapper.appendChild(replayButton);
    return true;
  }

  return false;
}

function addCheckButton(wrapper: HTMLDivElement, puzzleId: string, inputFactory: () => unknown): void {
  const button = document.createElement("button");
  button.className = "btn btn-accent";
  button.textContent = "Check";
  button.addEventListener("click", () => {
    const input = inputFactory();
    const puzzle = game.puzzleManager.getPuzzle(puzzleId);
    if (puzzle?.solved) {
      const valid = validatePuzzleInput(puzzleId, input as any);
      if (!valid) {
        button.textContent = "Try Again";
        wrapper.classList.remove("--failed");
        wrapper.getBoundingClientRect();
        wrapper.classList.add("--failed");
        setTimeout(() => {
          button.textContent = "Check";
          wrapper.classList.remove("--failed");
        }, 900);
        return;
      }

      button.textContent = "Practiced ✓";
      setTimeout(() => {
        button.textContent = "Check";
      }, 900);
      return;
    }

    const solved = game.completePuzzle(puzzleId, input);
    if (!solved) {
      button.textContent = "Try Again";
      wrapper.classList.remove("--failed");
      // Reading a layout property forces a reflow, which allows the browser to
      // restart the shake CSS animation even when the class is removed and
      // re-added in the same event-loop tick.
      wrapper.getBoundingClientRect();
      wrapper.classList.add("--failed");
      setTimeout(() => {
        button.textContent = "Check";
        wrapper.classList.remove("--failed");
      }, 900);
      return;
    }

    if (game.getProgress().finalCanvasUnlocked) {
      activeStationId = null;
    }
    render();
  });
  wrapper.appendChild(button);
}

function addMiniLabel(container: HTMLElement, text: string): void {
  const label = document.createElement("div");
  label.className = "mini-label";
  label.textContent = text;
  container.appendChild(label);
}

function addSlider(container: HTMLElement, label: string, value: number, min = 0, max = 1, step = 0.01, onInput: (value: number) => void): HTMLInputElement {
  const row = document.createElement("label");
  row.className = "mini-row";
  row.textContent = `${label}: ${value.toFixed(2)}`;
  const slider = document.createElement("input");
  slider.type = "range";
  slider.min = String(min);
  slider.max = String(max);
  slider.step = String(step);
  slider.value = String(value);
  slider.addEventListener("input", () => {
    const next = Number(slider.value);
    row.textContent = `${label}: ${next.toFixed(2)}`;
    row.appendChild(slider);
    onInput(next);
  });
  row.appendChild(slider);
  container.appendChild(row);
  return slider;
}

function addSelect(container: HTMLElement, label: string, options: string[], current: string, onChange: (value: string) => void): HTMLSelectElement {
  const row = document.createElement("label");
  row.className = "mini-row";
  row.textContent = `${label}: `;
  const select = document.createElement("select");
  options.forEach((option) => {
    const item = document.createElement("option");
    item.value = option;
    item.textContent = option;
    if (option === current) {
      item.selected = true;
    }
    select.appendChild(item);
  });
  select.addEventListener("change", () => onChange(select.value));
  row.appendChild(select);
  container.appendChild(row);
  return select;
}

function addCheckbox(container: HTMLElement, label: string, checked: boolean, onChange: (checked: boolean) => void): HTMLInputElement {
  const row = document.createElement("label");
  row.className = "mini-check";
  const input = document.createElement("input");
  input.type = "checkbox";
  input.checked = checked;
  input.addEventListener("change", () => onChange(input.checked));
  row.appendChild(input);
  row.append(label);
  container.appendChild(row);
  return input;
}

function createInteractionZone(wrapper: HTMLDivElement): HTMLDivElement {
  const zone = document.createElement("div");
  zone.className = "mini-zone";
  wrapper.appendChild(zone);
  return zone;
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

  if (isPractice) {
    const practiceBanner = document.createElement("div");
    practiceBanner.className = "mini-label";
    practiceBanner.textContent = "Practice mode: this puzzle is already solved, but you can replay interactions.";
    zone.appendChild(practiceBanner);
  }

  if (puzzleId === "puzzle-01") {
    const s = ensureState(puzzleId, { red: false, green: false, blue: false, overlap: false });

    // Live RGB preview
    const previewRow = document.createElement("div");
    previewRow.className = "color-preview-row";
    const previewSwatch = document.createElement("div");
    previewSwatch.className = "color-preview-swatch";
    previewSwatch.style.background = "#1a1a2e";
    const previewLabel = document.createElement("div");
    previewLabel.className = "color-preview-label";
    previewRow.appendChild(previewSwatch);
    previewRow.appendChild(previewLabel);

    const updateBeamPreview = (): void => {
      const r = s.red && s.overlap ? 255 : 0;
      const g = s.green && s.overlap ? 255 : 0;
      const b = s.blue && s.overlap ? 255 : 0;
      previewSwatch.style.background = s.overlap ? `rgb(${r}, ${g}, ${b})` : "#1a1a2e";
      const parts = [s.red ? "R" : "", s.green ? "G" : "", s.blue ? "B" : ""].filter(Boolean);
      if (!s.overlap) {
        previewLabel.textContent = parts.length > 0 ? `${parts.join("+")} beams — align overlap to mix` : "No beams active";
      } else {
        previewLabel.textContent = parts.length === 3 ? "White light! ✓ All beams aligned" : parts.join("+") || "No beams";
      }
    };

    // Beam toggle buttons
    const btnRow = document.createElement("div");
    btnRow.className = "beam-btns";
    const beamDefs: Array<{ key: "red" | "green" | "blue" | "overlap"; label: string }> = [
      { key: "red", label: "Red Beam" },
      { key: "green", label: "Green Beam" },
      { key: "blue", label: "Blue Beam" },
      { key: "overlap", label: "Align Overlap" },
    ];
    beamDefs.forEach(({ key, label }) => {
      const btn = document.createElement("button");
      btn.className = `beam-btn${s[key] ? " --on" : ""}`;
      btn.dataset.beam = key;
      btn.textContent = label;
      btn.addEventListener("click", () => {
        s[key] = !s[key];
        btn.classList.toggle("--on", s[key]);
        updateBeamPreview();
      });
      btnRow.appendChild(btn);
    });

    zone.appendChild(btnRow);
    zone.appendChild(previewRow);
    updateBeamPreview();
    addCheckButton(wrapper, puzzleId, () => ({ redBeam: s.red, greenBeam: s.green, blueBeam: s.blue, overlap: s.overlap }));
  } else if (puzzleId === "puzzle-02") {
    const s = ensureState(puzzleId, { c: 0.1, m: 0.1, y: 0.1 });

    // Live CMY mix preview
    const previewRow = document.createElement("div");
    previewRow.className = "color-preview-row";
    const previewSwatch = document.createElement("div");
    previewSwatch.className = "color-preview-swatch";
    const targetSwatch = document.createElement("div");
    targetSwatch.className = "color-preview-swatch";
    // Target is C=0.4, M=0.5, Y=0.2 → rgb(153, 127, 204)
    targetSwatch.style.background = "rgb(153, 127, 204)";
    targetSwatch.title = "Target color";
    const previewLabel = document.createElement("div");
    previewLabel.className = "color-preview-label";
    previewRow.appendChild(previewSwatch);
    previewRow.appendChild(targetSwatch);
    previewRow.appendChild(previewLabel);

    const updateCMYPreview = (): void => {
      const r = Math.round(255 * (1 - s.c));
      const g = Math.round(255 * (1 - s.m));
      const b = Math.round(255 * (1 - s.y));
      previewSwatch.style.background = `rgb(${r}, ${g}, ${b})`;
      previewLabel.textContent = "Current → Target";
    };

    addSlider(zone, "Cyan", s.c, 0, 1, 0.01, (v) => { s.c = v; updateCMYPreview(); });
    addSlider(zone, "Magenta", s.m, 0, 1, 0.01, (v) => { s.m = v; updateCMYPreview(); });
    addSlider(zone, "Yellow", s.y, 0, 1, 0.01, (v) => { s.y = v; updateCMYPreview(); });
    zone.appendChild(previewRow);
    updateCMYPreview();
    addCheckButton(wrapper, puzzleId, () => ({ cyan: s.c, magenta: s.m, yellow: s.y, target: { cyan: 0.4, magenta: 0.5, yellow: 0.2 } }));
  } else if (puzzleId === "puzzle-03") {
    const s = ensureState(puzzleId, { a: "blue", b: "orange", luminousShadow: false });
    addSelect(zone, "Pigment A", ["blue", "orange", "red", "green", "yellow", "purple"], s.a, (v) => { s.a = v; });
    addSelect(zone, "Pigment B", ["blue", "orange", "red", "green", "yellow", "purple"], s.b, (v) => { s.b = v; });
    addCheckbox(zone, "Shadow looks luminous", s.luminousShadow, (v) => { s.luminousShadow = v; });
    addCheckButton(wrapper, puzzleId, () => ({ pigments: [s.a, s.b], luminousShadow: s.luminousShadow }));
  } else if (puzzleId === "puzzle-04") {
    const s = ensureState(puzzleId, { tones: [30, 220, 40, 210, 50, 200], blur: true });

    addMiniLabel(zone, "Paint the statue blocks in grayscale so the silhouette stays readable under blur.");

    const blockRow = document.createElement("div");
    blockRow.className = "value-block-row";
    const blocks = s.tones.map((tone: number, idx: number) => {
      const block = document.createElement("button");
      block.className = "value-block";
      block.style.background = `rgb(${tone}, ${tone}, ${tone})`;
      block.title = `Tone ${idx + 1}: ${tone}`;
      block.addEventListener("click", () => {
        s.tones[idx] = (s.tones[idx] + 32) % 256;
        block.style.background = `rgb(${s.tones[idx]}, ${s.tones[idx]}, ${s.tones[idx]})`;
        updateReadability();
      });
      blockRow.appendChild(block);
      return block;
    });
    zone.appendChild(blockRow);

    const blurPreview = document.createElement("div");
    blurPreview.className = "blur-preview";
    blocks.forEach((_, idx) => {
      const stripe = document.createElement("div");
      stripe.className = "blur-stripe";
      stripe.style.background = `rgb(${s.tones[idx]}, ${s.tones[idx]}, ${s.tones[idx]})`;
      blurPreview.appendChild(stripe);
    });
    zone.appendChild(blurPreview);

    const blurToggle = document.createElement("button");
    blurToggle.className = "btn";
    blurToggle.textContent = "Toggle Squint Blur";
    blurToggle.addEventListener("click", () => {
      s.blur = !s.blur;
      blurPreview.style.filter = s.blur ? "blur(4px)" : "none";
    });
    zone.appendChild(blurToggle);

    const readout = document.createElement("div");
    readout.className = "mini-label";
    zone.appendChild(readout);

    const updateReadability = (): void => {
      const min = Math.min(...s.tones);
      const max = Math.max(...s.tones);
      const readability = (max - min) / 255;
      readout.textContent = `Blur readability: ${(readability * 100).toFixed(0)}% (target >= 75%)`;
      [...blurPreview.children].forEach((node, idx) => {
        (node as HTMLElement).style.background = `rgb(${s.tones[idx]}, ${s.tones[idx]}, ${s.tones[idx]})`;
      });
    };
    updateReadability();

    addCheckButton(wrapper, puzzleId, () => {
      const min = Math.min(...s.tones);
      const max = Math.max(...s.tones);
      return { usesOnlyBlackAndWhite: true, blurReadability: (max - min) / 255 };
    });
  } else if (puzzleId === "puzzle-05") {
    const s = ensureState(puzzleId, { tiles: shuffleArray([0.05, 0.2, 0.4, 0.6, 0.8, 0.95]), revealed: false });
    addMiniLabel(zone, "Reorder tiles from darkest to lightest. Correct order reveals hidden icon.");

    const renderTiles = (): void => {
      tilesWrap.innerHTML = "";
      s.tiles.forEach((value: number, idx: number) => {
        const tile = document.createElement("div");
        tile.className = "ladder-tile";
        tile.style.background = `rgb(${Math.round(value * 255)}, ${Math.round(value * 255)}, ${Math.round(value * 255)})`;

        const controls = document.createElement("div");
        controls.className = "ladder-controls";
        const left = document.createElement("button");
        left.className = "btn mini";
        left.textContent = "←";
        left.disabled = idx === 0;
        left.addEventListener("click", () => {
          [s.tiles[idx - 1], s.tiles[idx]] = [s.tiles[idx], s.tiles[idx - 1]];
          renderTiles();
          updateReveal();
        });
        const right = document.createElement("button");
        right.className = "btn mini";
        right.textContent = "→";
        right.disabled = idx === s.tiles.length - 1;
        right.addEventListener("click", () => {
          [s.tiles[idx + 1], s.tiles[idx]] = [s.tiles[idx], s.tiles[idx + 1]];
          renderTiles();
          updateReveal();
        });
        controls.appendChild(left);
        controls.appendChild(right);

        tile.appendChild(controls);
        tilesWrap.appendChild(tile);
      });
    };

    const tilesWrap = document.createElement("div");
    tilesWrap.className = "ladder-wrap";
    zone.appendChild(tilesWrap);

    const reveal = document.createElement("div");
    reveal.className = "hidden-reveal";
    zone.appendChild(reveal);

    const updateReveal = (): void => {
      const ordered = s.tiles.every((v: number, i: number, arr: number[]) => i === 0 || v >= arr[i - 1]);
      s.revealed = ordered;
      reveal.textContent = ordered ? "Hidden image revealed: ⟡" : "Hidden image is scrambled";
      reveal.classList.toggle("is-on", ordered);
    };

    renderTiles();
    updateReveal();
    addCheckButton(wrapper, puzzleId, () => ({ orderedValues: s.tiles, hiddenImageRevealed: s.revealed }));
  } else if (puzzleId === "puzzle-06") {
    const s = ensureState(puzzleId, {
      visited: {} as Record<string, boolean>,
      peakByHue: { red: 4, green: 2, blue: 3 } as Record<string, number>,
      foundPeak: { red: false, green: false, blue: false } as Record<string, boolean>,
    });

    addMiniLabel(zone, "Explore hue branches and find each hue's max chroma node. Peaks differ by hue.");

    const hues = ["red", "green", "blue"];
    const tree = document.createElement("div");
    tree.className = "chroma-tree";

    const status = document.createElement("div");
    status.className = "mini-label";

    const updateStatus = (): void => {
      const foundCount = Object.values(s.foundPeak).filter(Boolean).length;
      status.textContent = `Peaks found: ${foundCount}/3`;
    };

    hues.forEach((hue) => {
      const branch = document.createElement("div");
      branch.className = "chroma-branch";
      const title = document.createElement("div");
      title.className = "mini-label";
      title.textContent = `${hue.toUpperCase()} branch`;
      branch.appendChild(title);

      const nodes = document.createElement("div");
      nodes.className = "chroma-nodes";
      for (let value = 0; value <= 4; value += 1) {
        const key = `${hue}-${value}`;
        const node = document.createElement("button");
        node.className = "chroma-node";
        const sat = 25 + value * 15;
        node.style.background = `hsl(${hue === "red" ? 0 : hue === "green" ? 120 : 220}, ${sat}%, 50%)`;
        node.title = `${hue} value ${value}`;
        node.addEventListener("click", () => {
          s.visited[key] = true;
          node.classList.add("visited");
          if (s.peakByHue[hue] === value) {
            s.foundPeak[hue] = true;
            node.classList.add("peak");
          }
          updateStatus();
        });
        nodes.appendChild(node);
      }
      branch.appendChild(nodes);
      tree.appendChild(branch);
    });

    zone.appendChild(tree);
    zone.appendChild(status);
    updateStatus();

    addCheckButton(wrapper, puzzleId, () => ({
      exploredHues: hues.filter((hue) => Object.keys(s.visited).some((k) => k.startsWith(`${hue}-`))),
      discoveredDifferentChromaPeaks: Object.values(s.foundPeak).every(Boolean),
    }));
  } else if (puzzleId === "puzzle-07") {
    const s = ensureState(puzzleId, { a: "red", b: "green" });
    addSelect(zone, "Color A", ["red", "green", "blue", "orange", "yellow", "purple"], s.a, (v) => { s.a = v; });
    addSelect(zone, "Color B", ["red", "green", "blue", "orange", "yellow", "purple"], s.b, (v) => { s.b = v; });
    addCheckButton(wrapper, puzzleId, () => ({ selectedColorA: s.a, selectedColorB: s.b }));
  } else if (puzzleId === "puzzle-08") {
    const s = ensureState(puzzleId, { h1: 0, h2: 120, h3: 240 });

    const triadStrip = document.createElement("div");
    triadStrip.className = "triad-strip";
    const triadMarks = [0, 1, 2].map(() => {
      const mark = document.createElement("div");
      mark.className = "triad-mark";
      triadStrip.appendChild(mark);
      return mark;
    });

    const triadLabel = document.createElement("div");
    triadLabel.className = "mini-label";

    const renderHueRow = (label: string, key: "h1" | "h2" | "h3"): void => {
      const row = document.createElement("label");
      row.className = "mini-row";

      const top = document.createElement("div");
      top.className = "hue-row";
      const title = document.createElement("span");
      title.textContent = `${label}: ${Math.round(s[key])}deg`;
      const swatch = document.createElement("span");
      swatch.className = "hue-swatch";
      swatch.style.background = `hsl(${s[key]}, 85%, 55%)`;
      top.appendChild(title);
      top.appendChild(swatch);

      const slider = document.createElement("input");
      slider.type = "range";
      slider.min = "0";
      slider.max = "360";
      slider.step = "1";
      slider.value = String(s[key]);
      slider.addEventListener("input", () => {
        s[key] = Number(slider.value);
        title.textContent = `${label}: ${Math.round(s[key])}deg`;
        swatch.style.background = `hsl(${s[key]}, 85%, 55%)`;
        updateTriadVisuals();
      });

      row.appendChild(top);
      row.appendChild(slider);
      zone.appendChild(row);
    };

    const updateTriadVisuals = (): void => {
      const values = [s.h1, s.h2, s.h3].map((h) => ((h % 360) + 360) % 360).sort((a, b) => a - b);
      const gaps = [
        (values[1] - values[0] + 360) % 360,
        (values[2] - values[1] + 360) % 360,
        (values[0] + 360 - values[2]) % 360,
      ];
      const tolerance = 15;
      const good = gaps.every((gap) => Math.abs(gap - 120) <= tolerance);

      [s.h1, s.h2, s.h3].forEach((hue, index) => {
        triadMarks[index].style.left = `${((hue % 360 + 360) % 360) / 360 * 100}%`;
        triadMarks[index].style.background = `hsl(${hue}, 85%, 55%)`;
      });

      triadLabel.textContent = `Gaps: ${Math.round(gaps[0])}deg / ${Math.round(gaps[1])}deg / ${Math.round(gaps[2])}deg${good ? "  triad aligned" : ""}`;
    };

    addMiniLabel(zone, "Aim for roughly equal 120deg spacing between all three hue markers.");
    renderHueRow("Hue 1", "h1");
    renderHueRow("Hue 2", "h2");
    renderHueRow("Hue 3", "h3");
    zone.appendChild(triadStrip);
    zone.appendChild(triadLabel);
    updateTriadVisuals();

    addCheckButton(wrapper, puzzleId, () => ({ hueAngles: [s.h1, s.h2, s.h3] }));
  } else if (puzzleId === "puzzle-09") {
    const s = ensureState(puzzleId, { prompt: "calm ocean", blue: true, teal: true, lowContrast: true, warm: false, highContrast: false, saturated: false, desat: false, green: false, dark: false });
    addSelect(zone, "Prompt", ["joyful carnival", "calm ocean", "creepy dungeon"], s.prompt, (v) => { s.prompt = v; });
    addCheckbox(zone, "Tag: blue", s.blue, (v) => { s.blue = v; });
    addCheckbox(zone, "Tag: teal", s.teal, (v) => { s.teal = v; });
    addCheckbox(zone, "Tag: low contrast", s.lowContrast, (v) => { s.lowContrast = v; });
    addCheckbox(zone, "Tag: warm", s.warm, (v) => { s.warm = v; });
    addCheckbox(zone, "Tag: high contrast", s.highContrast, (v) => { s.highContrast = v; });
    addCheckbox(zone, "Tag: saturated", s.saturated, (v) => { s.saturated = v; });
    addCheckbox(zone, "Tag: desaturated", s.desat, (v) => { s.desat = v; });
    addCheckbox(zone, "Tag: green", s.green, (v) => { s.green = v; });
    addCheckbox(zone, "Tag: dark", s.dark, (v) => { s.dark = v; });
    addCheckButton(wrapper, puzzleId, () => {
      const tags: string[] = [];
      if (s.blue) tags.push("blue");
      if (s.teal) tags.push("teal");
      if (s.lowContrast) tags.push("low contrast");
      if (s.warm) tags.push("warm");
      if (s.highContrast) tags.push("high contrast");
      if (s.saturated) tags.push("saturated");
      if (s.desat) tags.push("desaturated");
      if (s.green) tags.push("green");
      if (s.dark) tags.push("dark");
      return { prompt: s.prompt, paletteTags: tags };
    });
  } else if (puzzleId === "puzzle-10") {
    const s = ensureState(puzzleId, { leftHue: 40, rightHue: 230, leftSat: 65, rightSat: 65, leftLight: 52, rightLight: 52, adjusted: false });

    const board = document.createElement("div");
    board.className = "illusion-board";
    const leftPanel = document.createElement("div");
    leftPanel.className = "illusion-panel";
    const rightPanel = document.createElement("div");
    rightPanel.className = "illusion-panel";
    const leftSquare = document.createElement("div");
    leftSquare.className = "illusion-square";
    const rightSquare = document.createElement("div");
    rightSquare.className = "illusion-square";
    leftPanel.appendChild(leftSquare);
    rightPanel.appendChild(rightSquare);
    board.appendChild(leftPanel);
    board.appendChild(rightPanel);
    zone.appendChild(board);

    const feedback = document.createElement("div");
    feedback.className = "mini-label";
    zone.appendChild(feedback);

    const estimatePerceivedDifference = (): number => {
      const hueDist = circularHueDistance(s.leftHue, s.rightHue) / 180;
      const satAvg = (s.leftSat + s.rightSat) / 200;
      const lightDist = Math.abs(s.leftLight - s.rightLight) / 100;
      const satDist = Math.abs(s.leftSat - s.rightSat) / 100;

      // Perception model: hue mismatch matters less when surrounds are desaturated
      // or close in value. This allows valid solutions with different hues.
      return hueDist * satAvg * 0.55 + lightDist * 0.3 + satDist * 0.15;
    };

    const updateBoard = (): void => {
      leftPanel.style.background = `hsl(${s.leftHue}, ${s.leftSat}%, ${s.leftLight}%)`;
      rightPanel.style.background = `hsl(${s.rightHue}, ${s.rightSat}%, ${s.rightLight}%)`;
      leftSquare.style.background = "#a6a6a6";
      rightSquare.style.background = "#a6a6a6";
      const diff = estimatePerceivedDifference();
      feedback.textContent = `Estimated perception gap: ${(diff * 100).toFixed(1)}% (lower is better, target <= 5%)`;
    };

    addSlider(zone, "Left surround hue", s.leftHue, 0, 360, 1, (v) => { s.leftHue = v; s.adjusted = true; updateBoard(); });
    addSlider(zone, "Right surround hue", s.rightHue, 0, 360, 1, (v) => { s.rightHue = v; s.adjusted = true; updateBoard(); });
    addSlider(zone, "Left saturation", s.leftSat, 0, 100, 1, (v) => { s.leftSat = v; s.adjusted = true; updateBoard(); });
    addSlider(zone, "Right saturation", s.rightSat, 0, 100, 1, (v) => { s.rightSat = v; s.adjusted = true; updateBoard(); });
    addSlider(zone, "Left lightness", s.leftLight, 20, 80, 1, (v) => { s.leftLight = v; s.adjusted = true; updateBoard(); });
    addSlider(zone, "Right lightness", s.rightLight, 20, 80, 1, (v) => { s.rightLight = v; s.adjusted = true; updateBoard(); });

    const matchButton = document.createElement("button");
    matchButton.className = "btn";
    matchButton.textContent = "Normalize Values";
    matchButton.addEventListener("click", () => {
      s.rightLight = s.leftLight;
      s.rightSat = s.leftSat;
      s.adjusted = true;
      render();
    });
    zone.appendChild(matchButton);

    updateBoard();
    addCheckButton(wrapper, puzzleId, () => ({
      perceivedDifference: estimatePerceivedDifference(),
      backgroundsAdjusted: s.adjusted,
    }));
  } else if (puzzleId === "puzzle-11") {
    const s = ensureState(puzzleId, { surroundHue: 30, surroundSat: 70, surroundLight: 50 });

    const board = document.createElement("div");
    board.className = "illusion-board single";
    const panel = document.createElement("div");
    panel.className = "illusion-panel";
    const square = document.createElement("div");
    square.className = "illusion-square";
    panel.appendChild(square);
    board.appendChild(panel);
    zone.appendChild(board);

    const feedback = document.createElement("div");
    feedback.className = "mini-label";
    zone.appendChild(feedback);

    const updateBoard = (): void => {
      panel.style.background = `hsl(${s.surroundHue}, ${s.surroundSat}%, ${s.surroundLight}%)`;
      square.style.background = "#9d9d9d";
      const orangeDistance = circularHueDistance(s.surroundHue, 30);
      const orangeStrength = Math.max(0, 1 - orangeDistance / 45) * (s.surroundSat / 100);
      feedback.textContent = orangeStrength >= 0.6
        ? "Grey appears cooler/blue from warm orange context ✓"
        : "Push toward a stronger orange surround to induce blue shift";
    };

    addSlider(zone, "Surround hue", s.surroundHue, 0, 360, 1, (v) => { s.surroundHue = v; updateBoard(); });
    addSlider(zone, "Surround saturation", s.surroundSat, 0, 100, 1, (v) => { s.surroundSat = v; updateBoard(); });
    addSlider(zone, "Surround lightness", s.surroundLight, 20, 80, 1, (v) => { s.surroundLight = v; updateBoard(); });
    updateBoard();

    addCheckButton(wrapper, puzzleId, () => ({
      usedOrangeSurroundings: circularHueDistance(s.surroundHue, 30) <= 20 && s.surroundSat >= 55,
      greySquareChanged: false,
    }));
  } else if (puzzleId === "puzzle-12") {
    const s = ensureState(puzzleId, { neutralCount: 1, contrast: 0.4, accentHue: 8, accentSat: 80, neutralLight: 55 });

    const board = document.createElement("div");
    board.className = "neutral-hero-board";
    const neutral = document.createElement("div");
    neutral.className = "neutral-field";
    const accent = document.createElement("div");
    accent.className = "accent-chip";
    neutral.appendChild(accent);
    board.appendChild(neutral);
    zone.appendChild(board);

    const feedback = document.createElement("div");
    feedback.className = "mini-label";
    zone.appendChild(feedback);

    const updateBoard = (): void => {
      neutral.style.background = `hsl(30, 12%, ${s.neutralLight}%)`;
      accent.style.background = `hsl(${s.accentHue}, ${s.accentSat}%, 50%)`;
      feedback.textContent = `Neutral fields: ${s.neutralCount} | Accent pop: ${(s.contrast * 100).toFixed(0)}%`;
    };

    addSlider(zone, "Neutral mixes count", s.neutralCount, 0, 5, 1, (v) => { s.neutralCount = v; updateBoard(); });
    addSlider(zone, "Neutral lightness", s.neutralLight, 20, 80, 1, (v) => { s.neutralLight = v; updateBoard(); });
    addSlider(zone, "Accent hue", s.accentHue, 0, 360, 1, (v) => { s.accentHue = v; updateBoard(); });
    addSlider(zone, "Accent saturation", s.accentSat, 0, 100, 1, (v) => { s.accentSat = v; s.contrast = Math.min(1, 0.25 + (s.accentSat / 100) * 0.75); updateBoard(); });
    addSlider(zone, "Accent contrast", s.contrast, 0, 1, 0.01, (v) => { s.contrast = v; updateBoard(); });
    updateBoard();

    addCheckButton(wrapper, puzzleId, () => ({ neutralCount: s.neutralCount, accentContrast: s.contrast }));
  } else if (puzzleId === "puzzle-13") {
    const s = ensureState(puzzleId, { edges: false, sat: false, cool: false });
    addCheckbox(zone, "Edges soften with distance", s.edges, (v) => { s.edges = v; });
    addCheckbox(zone, "Saturation drops with distance", s.sat, (v) => { s.sat = v; });
    addCheckbox(zone, "Hue shifts cooler in distance", s.cool, (v) => { s.cool = v; });
    addCheckButton(wrapper, puzzleId, () => ({ edgeSharpnessDropsWithDistance: s.edges, saturationDropsWithDistance: s.sat, hueShiftsCoolerWithDistance: s.cool }));
  } else if (puzzleId === "puzzle-14") {
    const s = ensureState(puzzleId, { shiftBlue: false, scatter: 0.2 });
    addCheckbox(zone, "Far objects shift blue", s.shiftBlue, (v) => { s.shiftBlue = v; });
    addSlider(zone, "Scattering strength", s.scatter, 0, 1, 0.01, (v) => { s.scatter = v; });
    addCheckButton(wrapper, puzzleId, () => ({ farObjectsShiftBlue: s.shiftBlue, scatteringStrength: s.scatter }));
  } else if (puzzleId === "puzzle-15") {
    const s = ensureState(puzzleId, { timeLeft: 100, warmMix: 0.2, coolMix: 0.1, warmedInTime: false, adapted: false, phase: "sunset" as "sunset" | "bluehour" });

    const board = document.createElement("div");
    board.className = "golden-hour-board";
    const sky = document.createElement("div");
    sky.className = "golden-sky";
    const sun = document.createElement("div");
    sun.className = "golden-sun";
    sky.appendChild(sun);
    board.appendChild(sky);
    zone.appendChild(board);

    const meter = document.createElement("div");
    meter.className = "coverage-wrap";
    const track = document.createElement("div");
    track.className = "coverage-bar-track";
    const fill = document.createElement("div");
    fill.className = "coverage-bar-fill";
    track.appendChild(fill);
    const meterLabel = document.createElement("div");
    meterLabel.className = "coverage-bar-label";
    meter.appendChild(track);
    meter.appendChild(meterLabel);
    zone.appendChild(meter);

    const feedback = document.createElement("div");
    feedback.className = "mini-label";
    zone.appendChild(feedback);

    const updateBoard = (): void => {
      fill.style.width = `${s.timeLeft}%`;
      if (s.phase === "sunset") {
        const hue = 22 + (1 - s.warmMix) * 16;
        sky.style.background = `linear-gradient(180deg, hsl(${hue}, ${50 + s.warmMix * 35}%, 58%), hsl(${30 + s.warmMix * 14}, ${35 + s.warmMix * 30}%, 42%))`;
      } else {
        const cool = Math.max(s.coolMix, 0.3);
        sky.style.background = `linear-gradient(180deg, hsl(${220 + cool * 24}, ${35 + cool * 45}%, 42%), hsl(${245 + cool * 15}, ${35 + cool * 40}%, 22%))`;
      }
      sun.style.left = `${Math.max(4, Math.min(92, s.timeLeft))}%`;
      meterLabel.textContent = s.phase === "sunset"
        ? `Sunset timer: ${Math.round(s.timeLeft)}% daylight remaining`
        : "Blue hour active";
      feedback.textContent = s.phase === "sunset"
        ? `Warm mix: ${(s.warmMix * 100).toFixed(0)}%`
        : `Cool adaptation: ${(s.coolMix * 100).toFixed(0)}%`;
    };

    addSlider(zone, "Warm palette strength", s.warmMix, 0, 1, 0.01, (v) => {
      s.warmMix = v;
      if (s.phase === "sunset" && s.timeLeft > 30 && s.warmMix >= 0.68) {
        s.warmedInTime = true;
      }
      updateBoard();
    });

    addSlider(zone, "Cool adaptation", s.coolMix, 0, 1, 0.01, (v) => {
      s.coolMix = v;
      if (s.phase === "bluehour" && s.coolMix >= 0.55) {
        s.adapted = true;
      }
      updateBoard();
    });

    const advance = document.createElement("button");
    advance.className = "btn";
    advance.textContent = "Advance Time";
    advance.addEventListener("click", () => {
      s.timeLeft = Math.max(0, s.timeLeft - 20);
      if (s.timeLeft === 0) {
        s.phase = "bluehour";
      }
      updateBoard();
    });
    zone.appendChild(advance);

    const triggerBlueHour = document.createElement("button");
    triggerBlueHour.className = "btn";
    triggerBlueHour.textContent = "Shift To Blue Hour";
    triggerBlueHour.addEventListener("click", () => {
      s.phase = "bluehour";
      s.timeLeft = 0;
      updateBoard();
    });
    zone.appendChild(triggerBlueHour);

    updateBoard();
    addCheckButton(wrapper, puzzleId, () => ({
      warmPaletteMixed: s.warmMix >= 0.68,
      completedBeforeNightfall: s.warmedInTime,
      adaptedToBlueHour: s.phase === "bluehour" && s.adapted,
    }));
  } else if (puzzleId === "puzzle-16") {
    const s = ensureState(puzzleId, { phthalo: false, hansa: false, redContam: 0.0, purpleContam: 0.0 });

    // Live pigment mix preview
    const previewRow = document.createElement("div");
    previewRow.className = "color-preview-row";
    const previewSwatch = document.createElement("div");
    previewSwatch.className = "color-preview-swatch";
    const previewLabel = document.createElement("div");
    previewLabel.className = "color-preview-label";
    previewRow.appendChild(previewSwatch);
    previewRow.appendChild(previewLabel);

    const computeMudLevel = (): number => Math.min(1, (s.redContam + s.purpleContam) / 2);

    const updateMixPreview = (): void => {
      const mud = computeMudLevel();
      if (s.phthalo && s.hansa && mud <= 0.25) {
        const sat = Math.round(70 - mud * 100);
        previewSwatch.style.background = `hsl(115, ${sat}%, 38%)`;
        previewLabel.textContent = "Vibrant green! ✓";
      } else if (s.phthalo && s.hansa) {
        const sat = Math.max(5, 30 - Math.round((mud - 0.25) * 60));
        previewSwatch.style.background = `hsl(80, ${sat}%, 32%)`;
        previewLabel.textContent = "Muddy green — reduce contaminant colors";
      } else if (s.phthalo) {
        previewSwatch.style.background = "#0077a3";
        previewLabel.textContent = "Phthalo Blue only";
      } else if (s.hansa) {
        previewSwatch.style.background = "#e8c820";
        previewLabel.textContent = "Hansa Yellow only";
      } else {
        previewSwatch.style.background = "#f0ede8";
        previewLabel.textContent = "No pigments selected";
      }

      addInfo.textContent = `Derived mud: ${(computeMudLevel() * 100).toFixed(0)}%`;
    };

    const addInfo = document.createElement("div");
    addInfo.className = "mini-label";

    addCheckbox(zone, "Add Phthalo Blue", s.phthalo, (v) => { s.phthalo = v; updateMixPreview(); });
    addCheckbox(zone, "Add Hansa Yellow", s.hansa, (v) => { s.hansa = v; updateMixPreview(); });
    addSlider(zone, "Red contaminant", s.redContam, 0, 1, 0.01, (v) => { s.redContam = v; updateMixPreview(); });
    addSlider(zone, "Purple contaminant", s.purpleContam, 0, 1, 0.01, (v) => { s.purpleContam = v; updateMixPreview(); });
    zone.appendChild(previewRow);
    zone.appendChild(addInfo);
    updateMixPreview();
    addCheckButton(wrapper, puzzleId, () => ({
      pigments: [s.phthalo ? "phthalo blue" : "", s.hansa ? "hansa yellow" : ""].filter(Boolean),
      mudLevel: computeMudLevel(),
    }));
  } else if (puzzleId === "puzzle-17") {
    const s = ensureState(puzzleId, {
      complementPairs: 0,
      mud: 0.15,
      recipe: [] as string[],
    });

    const board = document.createElement("div");
    board.className = "mud-monster-board";

    const monster = document.createElement("div");
    monster.className = "mud-monster";
    board.appendChild(monster);

    const meter = document.createElement("div");
    meter.className = "coverage-wrap";
    const track = document.createElement("div");
    track.className = "coverage-bar-track";
    const fill = document.createElement("div");
    fill.className = "coverage-bar-fill";
    track.appendChild(fill);
    const meterLabel = document.createElement("div");
    meterLabel.className = "coverage-bar-label";
    meter.appendChild(track);
    meter.appendChild(meterLabel);
    board.appendChild(meter);

    const stateLabel = document.createElement("div");
    stateLabel.className = "mini-label";
    board.appendChild(stateLabel);

    const recipeLog = document.createElement("div");
    recipeLog.className = "mud-log";
    board.appendChild(recipeLog);

    zone.appendChild(board);

    const controls = document.createElement("div");
    controls.className = "mud-controls";
    zone.appendChild(controls);

    const isMuddy = (): boolean => s.mud >= 0.58 || s.complementPairs > 1;

    const updateMudMonster = (): void => {
      const mud = Math.max(0, Math.min(1, s.mud));
      fill.style.width = `${Math.round(mud * 100)}%`;
      if (mud < 0.4) {
        fill.classList.remove("--danger");
      } else {
        fill.classList.add("--danger");
      }

      const hue = Math.round(118 - mud * 72);
      const sat = Math.round(58 - mud * 34);
      const light = Math.round(46 - mud * 20);
      monster.style.background = `radial-gradient(circle at 35% 28%, rgba(255,255,255,0.35), transparent 40%), hsl(${hue}, ${sat}%, ${light}%)`;

      const muddy = isMuddy();
      monster.textContent = muddy ? "(x_x)" : mud > 0.35 ? "(o_o)" : "(^_^)";
      meterLabel.textContent = `Mud level: ${Math.round(mud * 100)}%`;
      stateLabel.textContent = muddy
        ? `Too many complement clashes (${s.complementPairs}). Keep clashes to 1 or less.`
        : `Stable mix. Complement clashes: ${s.complementPairs}/1 allowed.`;
      recipeLog.textContent = s.recipe.length > 0
        ? `Recipe: ${s.recipe.join(" -> ")}`
        : "Recipe: start with clean green strokes.";
    };

    const addActionButton = (label: string, onClick: () => void): void => {
      const btn = document.createElement("button");
      btn.className = "btn";
      btn.textContent = label;
      btn.addEventListener("click", () => {
        onClick();
        updateMudMonster();
      });
      controls.appendChild(btn);
    };

    addActionButton("Add clean green stroke", () => {
      s.mud = Math.max(0, s.mud - 0.12);
      s.recipe.push("clean");
      if (s.recipe.length > 6) {
        s.recipe.shift();
      }
    });

    addActionButton("Add tiny complement neutralizer", () => {
      s.complementPairs += 1;
      s.mud = Math.min(1, s.mud + 0.22);
      s.recipe.push("neutralizer");
      if (s.recipe.length > 6) {
        s.recipe.shift();
      }
    });

    addActionButton("Dump strong complement pair", () => {
      s.complementPairs += 1;
      s.mud = Math.min(1, s.mud + 0.42);
      s.recipe.push("overmix");
      if (s.recipe.length > 6) {
        s.recipe.shift();
      }
    });

    const resetBtn = document.createElement("button");
    resetBtn.className = "btn";
    resetBtn.textContent = "Reset Bowl";
    resetBtn.addEventListener("click", () => {
      s.complementPairs = 0;
      s.mud = 0.15;
      s.recipe = [];
      updateMudMonster();
    });
    controls.appendChild(resetBtn);

    updateMudMonster();
    addCheckButton(wrapper, puzzleId, () => ({
      complementPairsAdded: s.complementPairs,
      muddyResult: isMuddy(),
    }));
  } else if (puzzleId === "puzzle-18") {
    renderArtStationMiniGame(zone, wrapper, puzzleId, state);
    puzzleListEl.appendChild(wrapper);
    return;
  } else {
    addCheckButton(wrapper, puzzleId, () => getDemoSolution(puzzleId));
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
  clearButton.className = "btn";
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
  if (!padCtx) {
    return;
  }

  const cellW = paintCanvas.width / artPad.cols;
  const cellH = paintCanvas.height / artPad.rows;

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
    hint.innerHTML = "<div><strong>Studio Exploration</strong><div class=\"puzzle-meta\">Move by clicking the map. Click an unlocked station while nearby to enter its puzzle scene.</div></div>";
    puzzleListEl.appendChild(hint);

    game
      .stationManager
      .getAllStations()
      .filter((station) => station.unlocked)
      .forEach((station) => {
        const wrapper = document.createElement("div");
        wrapper.className = "puzzle-item";

        const info = document.createElement("div");
        const solved = station.puzzles.filter((puzzle) => puzzle.solved).length;
        info.innerHTML = `<strong>${station.name}</strong><div class=\"puzzle-meta\">${solved}/3 solved</div>`;

        const enterButton = document.createElement("button");
        enterButton.className = "btn";
        enterButton.textContent = "Enter";
        enterButton.addEventListener("click", () => enterStation(station.id));

        wrapper.appendChild(info);
        wrapper.appendChild(enterButton);
        puzzleListEl.appendChild(wrapper);
      });

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
    backButton.className = "btn";
    backButton.textContent = "Return";
    backButton.addEventListener("click", () => {
      game.sceneManager.transitionScene(SceneType.StudioScene);
      render();
    });
    backWrapper.appendChild(backInfo);
    backWrapper.appendChild(backButton);
    puzzleListEl.appendChild(backWrapper);
    return;
  }

  if (!activeStationId) {
    return;
  }

  const station = game.stationManager.getStation(activeStationId);
  if (!station) {
    return;
  }

  const backWrapper = document.createElement("div");
  backWrapper.className = "puzzle-item";
  const label = document.createElement("div");
  label.innerHTML = `<strong>${station.name}</strong><div class=\"puzzle-meta\">Puzzle Scene</div>`;
  const backButton = document.createElement("button");
  backButton.className = "btn";
  backButton.textContent = "Back";
  backButton.addEventListener("click", () => leaveStation());
  backWrapper.appendChild(label);
  backWrapper.appendChild(backButton);
  puzzleListEl.appendChild(backWrapper);

  station.puzzles.forEach((puzzle) => {
    renderPuzzleMiniGame(puzzle.id, puzzle.title, puzzle.state);
  });
}

function render(time = 0): void {
  drawBackground(time);
  drawStations(time);
  drawPlayer(time);
  drawSceneOverlay();
  drawTransitionOverlay(time);
  updateProgressPanel();
  updatePuzzlePanel();
}

let previousTime = performance.now();

function animate(time: number): void {
  const deltaSeconds = Math.min(0.05, (time - previousTime) / 1000);
  previousTime = time;

  updatePlayer(deltaSeconds);
  drawBackground(time);
  drawStations(time);
  drawPlayer(time);
  drawSceneOverlay();
  drawTransitionOverlay(time);
  requestAnimationFrame(animate);
}

autoSolveButton.addEventListener("click", () => {
  for (let i = 1; i <= 18; i += 1) {
    const puzzleId = `puzzle-${String(i).padStart(2, "0")}`;
    game.completePuzzle(puzzleId, getDemoSolution(puzzleId));
  }

  if (game.getProgress().finalCanvasUnlocked) {
    activeStationId = null;
  }

  render();
});

resetButton.addEventListener("click", () => initializeGame());

canvas.addEventListener("click", (event) => {
  const scene = game.sceneManager.getCurrentScene();
  if (scene !== SceneType.StudioScene) {
    return;
  }

  const point = getCanvasPoint(event);
  const stationId = findStationAtPoint(point.x, point.y);

  if (stationId) {
    tryEnterNearbyStation(stationId);
    render();
    return;
  }

  player.targetX = point.x;
  player.targetY = point.y;
  render();
});

initializeGame();
requestAnimationFrame(animate);
