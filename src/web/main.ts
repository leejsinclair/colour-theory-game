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
  meta.innerHTML = `<strong>${title}</strong><div class="puzzle-meta">${puzzleId} | ${state}</div>`;

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
    replayButton.textContent = "Replay";
    replayButton.addEventListener("click", () => {
      const input = getDemoSolution(puzzleId);
      game.completePuzzle(puzzleId, input);
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
    const solved = game.completePuzzle(puzzleId, inputFactory());
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
  if (!isArtPuzzle && renderLockedOrSolvedControls(wrapper, puzzleId, state)) {
    puzzleListEl.appendChild(wrapper);
    return;
  }

  const zone = createInteractionZone(wrapper);

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
    const s = ensureState(puzzleId, { bwOnly: true, readability: 0.5 });
    addCheckbox(zone, "Use only black/white", s.bwOnly, (v) => { s.bwOnly = v; });
    addSlider(zone, "Blur readability", s.readability, 0, 1, 0.01, (v) => { s.readability = v; });
    addCheckButton(wrapper, puzzleId, () => ({ usesOnlyBlackAndWhite: s.bwOnly, blurReadability: s.readability }));
  } else if (puzzleId === "puzzle-05") {
    const s = ensureState(puzzleId, { values: "0.05,0.2,0.4,0.6,0.8,0.95", image: false });
    const input = document.createElement("input");
    input.className = "text-input";
    input.value = s.values;
    input.addEventListener("input", () => { s.values = input.value; });
    zone.appendChild(input);
    addCheckbox(zone, "Hidden image appears", s.image, (v) => { s.image = v; });
    addCheckButton(wrapper, puzzleId, () => ({
      orderedValues: s.values.split(",").map((part: string) => Number(part.trim())).filter((n: number) => !Number.isNaN(n)),
      hiddenImageRevealed: s.image,
    }));
  } else if (puzzleId === "puzzle-06") {
    const s = ensureState(puzzleId, { red: true, green: true, blue: true, peaks: false });
    addCheckbox(zone, "Explored red branch", s.red, (v) => { s.red = v; });
    addCheckbox(zone, "Explored green branch", s.green, (v) => { s.green = v; });
    addCheckbox(zone, "Explored blue branch", s.blue, (v) => { s.blue = v; });
    addCheckbox(zone, "Observed different chroma peaks", s.peaks, (v) => { s.peaks = v; });
    addCheckButton(wrapper, puzzleId, () => ({ exploredHues: [s.red ? "red" : "", s.green ? "green" : "", s.blue ? "blue" : ""].filter(Boolean), discoveredDifferentChromaPeaks: s.peaks }));
  } else if (puzzleId === "puzzle-07") {
    const s = ensureState(puzzleId, { a: "red", b: "green" });
    addSelect(zone, "Color A", ["red", "green", "blue", "orange", "yellow", "purple"], s.a, (v) => { s.a = v; });
    addSelect(zone, "Color B", ["red", "green", "blue", "orange", "yellow", "purple"], s.b, (v) => { s.b = v; });
    addCheckButton(wrapper, puzzleId, () => ({ selectedColorA: s.a, selectedColorB: s.b }));
  } else if (puzzleId === "puzzle-08") {
    const s = ensureState(puzzleId, { h1: 0, h2: 120, h3: 240 });
    addSlider(zone, "Hue 1", s.h1, 0, 360, 1, (v) => { s.h1 = v; });
    addSlider(zone, "Hue 2", s.h2, 0, 360, 1, (v) => { s.h2 = v; });
    addSlider(zone, "Hue 3", s.h3, 0, 360, 1, (v) => { s.h3 = v; });
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
    const s = ensureState(puzzleId, { difference: 0.5, adjusted: false });
    addSlider(zone, "Perceived difference", s.difference, 0, 1, 0.01, (v) => { s.difference = v; });
    addCheckbox(zone, "Backgrounds adjusted", s.adjusted, (v) => { s.adjusted = v; });
    addCheckButton(wrapper, puzzleId, () => ({ perceivedDifference: s.difference, backgroundsAdjusted: s.adjusted }));
  } else if (puzzleId === "puzzle-11") {
    const s = ensureState(puzzleId, { orangeAround: false, changedGrey: false });
    addCheckbox(zone, "Use orange surroundings", s.orangeAround, (v) => { s.orangeAround = v; });
    addCheckbox(zone, "Changed grey square", s.changedGrey, (v) => { s.changedGrey = v; });
    addCheckButton(wrapper, puzzleId, () => ({ usedOrangeSurroundings: s.orangeAround, greySquareChanged: s.changedGrey }));
  } else if (puzzleId === "puzzle-12") {
    const s = ensureState(puzzleId, { neutralCount: 1, contrast: 0.4 });
    addSlider(zone, "Neutral mixes count", s.neutralCount, 0, 5, 1, (v) => { s.neutralCount = v; });
    addSlider(zone, "Accent contrast", s.contrast, 0, 1, 0.01, (v) => { s.contrast = v; });
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
    const s = ensureState(puzzleId, { warm: false, onTime: false, blueHour: false });
    addCheckbox(zone, "Warm palette mixed", s.warm, (v) => { s.warm = v; });
    addCheckbox(zone, "Completed before nightfall", s.onTime, (v) => { s.onTime = v; });
    addCheckbox(zone, "Adapted palette to blue hour", s.blueHour, (v) => { s.blueHour = v; });
    addCheckButton(wrapper, puzzleId, () => ({ warmPaletteMixed: s.warm, completedBeforeNightfall: s.onTime, adaptedToBlueHour: s.blueHour }));
  } else if (puzzleId === "puzzle-16") {
    const s = ensureState(puzzleId, { phthalo: false, hansa: false, mud: 0.5 });

    // Live pigment mix preview
    const previewRow = document.createElement("div");
    previewRow.className = "color-preview-row";
    const previewSwatch = document.createElement("div");
    previewSwatch.className = "color-preview-swatch";
    const previewLabel = document.createElement("div");
    previewLabel.className = "color-preview-label";
    previewRow.appendChild(previewSwatch);
    previewRow.appendChild(previewLabel);

    const updateMixPreview = (): void => {
      if (s.phthalo && s.hansa && s.mud <= 0.25) {
        const sat = Math.round(70 - s.mud * 100);
        previewSwatch.style.background = `hsl(115, ${sat}%, 38%)`;
        previewLabel.textContent = "Vibrant green! ✓";
      } else if (s.phthalo && s.hansa) {
        const sat = Math.max(5, 30 - Math.round((s.mud - 0.25) * 60));
        previewSwatch.style.background = `hsl(80, ${sat}%, 32%)`;
        previewLabel.textContent = "Muddy green — reduce mud level";
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
    };

    addCheckbox(zone, "Add Phthalo Blue", s.phthalo, (v) => { s.phthalo = v; updateMixPreview(); });
    addCheckbox(zone, "Add Hansa Yellow", s.hansa, (v) => { s.hansa = v; updateMixPreview(); });
    addSlider(zone, "Mud level", s.mud, 0, 1, 0.01, (v) => { s.mud = v; updateMixPreview(); });
    zone.appendChild(previewRow);
    updateMixPreview();
    addCheckButton(wrapper, puzzleId, () => ({ pigments: [s.phthalo ? "phthalo blue" : "", s.hansa ? "hansa yellow" : ""].filter(Boolean), mudLevel: s.mud }));
  } else if (puzzleId === "puzzle-17") {
    const s = ensureState(puzzleId, { complements: 2, muddy: true });
    addSlider(zone, "Complement pairs added", s.complements, 0, 4, 1, (v) => { s.complements = v; });
    addCheckbox(zone, "Result turned muddy", s.muddy, (v) => { s.muddy = v; });
    addCheckButton(wrapper, puzzleId, () => ({ complementPairsAdded: s.complements, muddyResult: s.muddy }));
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
