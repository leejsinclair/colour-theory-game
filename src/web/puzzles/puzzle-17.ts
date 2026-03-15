import { PuzzleRenderDeps, PuzzleRenderer } from "./types";

export const renderPuzzle17: PuzzleRenderer = (deps: PuzzleRenderDeps) => {
  const {
    zone,
    wrapper,
    puzzleId,
    ensureState,
    addCheckButton,
  } = deps;

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
      btn.className = "btn btn-secondary";
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
    resetBtn.className = "btn btn-secondary";
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
};
