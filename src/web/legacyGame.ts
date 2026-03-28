import { getDemoSolution } from "../content/demoSolutions";
import { puzzleLearningContent } from "../content/puzzleLearningContent";
import { Game } from "../game/Game";
import { SceneType } from "../types/gameTypes";
import { renderPuzzleById } from "./puzzles";
import { mountMuiCheckbox, mountMuiSelect, mountMuiSlider, renderMuiMilestoneChips, upgradeMuiButtons } from "./muiControls";
import { diagnoseFailure } from "./puzzles/diagnose";
import { FAILURE_EXPLANATIONS } from "./puzzles/failureReasons";
import "./styles.css";
import { puzzleObjectives } from "./puzzleContent";
import { circularHueDistance, shuffleArray, validatePuzzleInput } from "./puzzleValidation";
import { type LearningProgress, readLocalProgress, saveLocalProgress, clearLocalProgress } from "./localProgress";
import { ALL_PET_IDS, PET_NAMES, createPetSpriteDiv } from "./petSprites";
import { clearResultAnalysis, triggerFailFeedback } from "./legacy/resultFeedback";
import {
  type LearningUiState,
  addChromaTreeButton,
  addReviewIntroButton,
  getLearningUiState,
  renderLearningIntro,
  renderLearningQuiz,
} from "./legacy/learningFlow";
import {
  type ArtPadState,
  renderArtStationMiniGame as renderArtStationMiniGameCard,
} from "./legacy/artStationMiniGame";
import { initInfoModal } from "./legacy/infoModal";

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

// Wire up the info modal (open/close, Chroma Tree explorer, event listeners).
const { openInfoModal, createChromaTreeActionButton } = initInfoModal({
  modal: document.getElementById("info-modal") as HTMLElement,
  title: document.getElementById("info-modal-title") as HTMLElement,
  body: document.getElementById("info-modal-body") as HTMLElement,
  closeBtn: document.getElementById("info-modal-close") as HTMLButtonElement,
});

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

const artPalette = ["#0d8db0", "#ec7755", "#2f9e44", "#f0b429", "#6f42c1", "#1f2030"];
let selectedArtColor = artPalette[0];
const artPad: ArtPadState = {
  cols: 18,
  rows: 10,
  pixels: [],
};

const puzzleUiState = new Map<string, unknown>();
const learningUiState = new Map<string, LearningUiState>();

let skipNextPersist = false;
let learningProgressByPuzzle: LearningProgress = {};

/** Collect all solved puzzle IDs in puzzle-number order. */
function getSolvedPuzzleIds(): string[] {
  return game.stationManager
    .getAllStations()
    .flatMap((station) => station.puzzles)
    .filter((puzzle) => puzzle.solved)
    .map((puzzle) => puzzle.id);
}

/**
 * Persist the current game state to localStorage.
 * Skips one call when `skipNextPersist` is set (used after a forced reset).
 */
function persistLocalProgress(): void {
  if (skipNextPersist) {
    skipNextPersist = false;
    return;
  }

  saveLocalProgress({
    completedPuzzleIds: getSolvedPuzzleIds(),
    activeStationId,
    practicePuzzleId,
    learningProgressByPuzzle,
  });
}

/**
 * Read the localStorage snapshot and replay completed puzzles, then
 * restore the scene and active-station context.
 */
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

/**
 * Create a fresh Game instance, reset all UI state, optionally restore
 * saved progress, do an initial render, and fire the `ctg:ready` event.
 */
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

/**
 * Return the stored per-puzzle UI state, creating and caching an initial
 * value the first time a given puzzle is seen.
 */
function ensureState<T>(puzzleId: string, initial: T): T {
  const existing = puzzleUiState.get(puzzleId) as T | undefined;
  if (existing) {
    return existing;
  }

  puzzleUiState.set(puzzleId, initial);
  return initial;
}

/** Switch to puzzle scene for the given station and trigger a re-render. */
function enterStation(stationId: string): void {
  activeStationId = stationId;
  game.sceneManager.transitionScene(SceneType.PuzzleScene);
  render();
}

/** Return to the studio lobby and trigger a re-render. */
function leaveStation(): void {
  activeStationId = null;
  game.sceneManager.transitionScene(SceneType.StudioScene);
  render();
}

/**
 * Find the next unlocked station after `currentStationId`.
 * Tries sequential order first; falls back to any unlocked incomplete station.
 */
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

/** Navigate directly to the next unlocked station from the current one. */
function goToNextStation(currentStationId: string): void {
  const nextStation = getNextStationFor(currentStationId);
  if (!nextStation) {
    return;
  }

  practicePuzzleId = null;
  enterStation(nextStation.id);
}

/** Clear the progress text element and refresh the HUD tiles and pet grid. */
function updateProgressPanel(): void {
  progressEl.textContent = "";
  updateHud();
}

/** Build the base puzzle card DOM element with title, metadata, and info button. */
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

/**
 * Append locked/solved UI controls to a puzzle card wrapper.
 * Returns `true` when the puzzle is terminal (locked or solved without practice),
 * signalling that no further interaction controls should be rendered.
 */
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
      addReviewIntroButton(wrapper, puzzleId, (id) => {
      void openInfoModal(id);
    });
      if (puzzleId === "puzzle-06") {
        addChromaTreeButton(wrapper, createChromaTreeActionButton);
      }
    }

    return true;
  }

  return false;
}

/**
 * Append a Check button and a Learn button to the puzzle card wrapper.
 * On click, the input factory is called, the result is validated against
 * the game engine, and success/failure feedback is shown.
 */
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
        triggerFailFeedback(wrapper, button, failureReasons, FAILURE_EXPLANATIONS);
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
      triggerFailFeedback(wrapper, button, failureReasons, FAILURE_EXPLANATIONS);
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

/** Append a small descriptive label to a container element. */
function addMiniLabel(container: HTMLElement, text: string): void {
  const label = document.createElement("div");
  label.className = "mini-label";
  label.textContent = text;
  container.appendChild(label);
}

/** Mount a Material UI slider and return the underlying input element. */
function addSlider(container: HTMLElement, label: string, value: number, min = 0, max = 1, step = 0.01, onInput: (value: number) => void): HTMLInputElement {
  return mountMuiSlider(container, label, value, min, max, step, onInput);
}

/** Mount a Material UI select dropdown and return the underlying select element. */
function addSelect(container: HTMLElement, label: string, options: string[], current: string, onChange: (value: string) => void): HTMLSelectElement {
  return mountMuiSelect(container, label, options, current, onChange);
}

/** Mount a Material UI checkbox and return the underlying input element. */
function addCheckbox(container: HTMLElement, label: string, checked: boolean, onChange: (checked: boolean) => void): HTMLInputElement {
  return mountMuiCheckbox(container, label, checked, onChange);
}

/** Create and append a `.mini-zone` interaction container inside the puzzle card wrapper. */
function createInteractionZone(wrapper: HTMLDivElement): HTMLDivElement {
  const zone = document.createElement("div");
  zone.className = "mini-zone";
  wrapper.appendChild(zone);
  return zone;
}

/**
 * Delegate to the extracted art station mini-game renderer, passing in all
 * shared state and callbacks it needs from this module.
 */
function renderArtStationMiniGame(container: HTMLElement, wrapper: HTMLDivElement, puzzleId: string, state: string): void {
  renderArtStationMiniGameCard({
    container,
    wrapper,
    puzzleId,
    state,
    artPalette,
    selectedArtColor,
    setSelectedArtColor: (color: string) => {
      selectedArtColor = color;
    },
    artPad,
    addCheckButton,
    render,
    updatePuzzlePanel,
  });
}

/**
 * Render a full puzzle mini-game card into `puzzleListEl`.
 *
 * For available, unsolved puzzles that have learning content and no quiz pass,
 * the learning gate (intro or quiz) is shown instead of puzzle mechanics.
 * For all other states, the matching puzzle view from `src/web/puzzles` is used.
 */
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
    const learningState = getLearningUiState(learningUiState, puzzleId, "intro", learning.quiz.length);

    if (learningState.stage === "intro") {
      renderLearningIntro({
        zone,
        puzzleId,
        onStartQuiz: () => {
          learningState.stage = "quiz";
          render();
        },
        onOpenInfoModal: (id) => {
          void openInfoModal(id);
        },
        createChromaTreeActionButton,
      });
    } else {
      renderLearningQuiz({
        zone,
        puzzleId,
        uiState: learningState,
        render,
        onOpenInfoModal: (id) => {
          void openInfoModal(id);
        },
        showToast,
        learningProgressByPuzzle,
      });
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
    addReviewIntroButton(wrapper, puzzleId, (id) => {
      void openInfoModal(id);
    });
    if (puzzleId === "puzzle-06") {
      addChromaTreeButton(wrapper, createChromaTreeActionButton);
    }
  }

  if (renderResult?.appended) {
    return;
  }

  puzzleListEl.appendChild(wrapper);
}

/**
 * Re-render the entire puzzle panel based on the current scene.
 *
 * - `StudioScene`: shows the station lobby list.
 * - `FinalCanvasScene`: shows the game-complete message and a Return button.
 * - `PuzzleScene`: shows the active station's puzzle cards.
 */
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

/** Top-level render: refresh the progress panel, puzzle panel, and persist state. */
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
