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
  selectedArtColor = artPalette[0];
  render();
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

function makePuzzleButton(puzzleId: string, title: string, state: string): HTMLButtonElement {
  const button = document.createElement("button");
  button.className = "btn";
  button.textContent = state === "solved" ? "Solved" : "Solve";
  button.disabled = state !== "available";
  button.addEventListener("click", () => {
    game.completePuzzle(puzzleId, getDemoSolution(puzzleId));
    if (game.getProgress().finalCanvasUnlocked) {
      activeStationId = null;
    }
    render();
  });

  const wrapper = document.createElement("div");
  wrapper.className = "puzzle-item";

  const meta = document.createElement("div");
  meta.innerHTML = `<strong>${title}</strong><div class="puzzle-meta">${puzzleId} | ${state}</div>`;

  wrapper.appendChild(meta);
  wrapper.appendChild(button);
  puzzleListEl.appendChild(wrapper);
  return button;
}

function renderArtStationMiniGame(container: HTMLDivElement): void {
  const card = document.createElement("div");
  card.className = "art-game-card";

  const heading = document.createElement("div");
  heading.className = "art-game-heading";
  heading.innerHTML = "<strong>Art Station Mini Game</strong><div class=\"puzzle-meta\">Paint dots, build a palette, and practice optical mixing.</div>";
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

  const controls = document.createElement("div");
  controls.className = "action-row";
  const clearButton = document.createElement("button");
  clearButton.className = "btn";
  clearButton.textContent = "Clear Pad";
  clearButton.addEventListener("click", () => {
    artPad.pixels.fill("#ffffff");
    updatePuzzlePanel();
  });
  controls.appendChild(clearButton);
  card.appendChild(controls);

  const padCtx = paintCanvas.getContext("2d");
  if (!padCtx) {
    return;
  }

  const cellW = paintCanvas.width / artPad.cols;
  const cellH = paintCanvas.height / artPad.rows;

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
        enterButton.addEventListener("click", () => tryEnterNearbyStation(station.id));

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
    makePuzzleButton(puzzle.id, puzzle.title, puzzle.state);
  });

  if (activeStationId === "station-06") {
    renderArtStationMiniGame(puzzleListEl);
  }
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
