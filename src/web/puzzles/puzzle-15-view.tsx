import React from "react";
import { createRoot } from "react-dom/client";
import { PuzzleRenderDeps, PuzzleRenderer } from "./types";

const renderPuzzle15Imperative = (deps: PuzzleRenderDeps): void => {
  const {
    zone,
    wrapper,
    puzzleId,
    ensureState,
    addSlider,
    addCheckButton,
  } = deps;

    // ── Chromatic Mastery – Time of Day Puzzle ───────────────────────────────
    // Stage 1: match color palettes to times of day
    // Stage 2: adjust sun controls to recreate golden hour

    const PALETTES: Array<{ id: string; label: string; swatches: string[] }> = [
      { id: "A", label: "Palette A", swatches: ["#a8c8e8", "#f5e6a0", "#c8cad0", "#9ab89a", "#b8d8e8"] },
      { id: "B", label: "Palette B", swatches: ["#6080b0", "#50c050", "#e8c020", "#505060", "#60a0d0"] },
      { id: "C", label: "Palette C", swatches: ["#e87030", "#e0a020", "#a05030", "#f0c040", "#c098b8"] },
      { id: "D", label: "Palette D", swatches: ["#203070", "#704090", "#202060", "#6068a0", "#404878"] },
    ];
    const SLOTS: Array<{ id: string; label: string; correctPaletteId: string }> = [
      { id: "morning", label: "Morning", correctPaletteId: "A" },
      { id: "midday", label: "Midday", correctPaletteId: "B" },
      { id: "goldenHour", label: "Golden Hour", correctPaletteId: "C" },
      { id: "afterSunset", label: "After Sunset", correctPaletteId: "D" },
    ];

    const s = ensureState(puzzleId, {
      stage: 1 as 1 | 2,
      selected: null as string | null,
      assignments: {} as Record<string, string>,
      stage1Complete: false,
      sunHeight: 0.5,
      atmosphere: 0.5,
      colorTemp: 0.5,
    });

    // ── Caretaker intro ────────────────────────────────────────────────────
    const intro = document.createElement("div");
    intro.className = "phase-guide";
    intro.textContent =
      "The sun paints the world with different colors throughout the day. " +
      "If you learn how light changes, you can restore the landscape.";
    zone.appendChild(intro);

    // ── Stage indicator ────────────────────────────────────────────────────
    const stageIndicator = document.createElement("div");
    stageIndicator.className = "phase-indicator";
    stageIndicator.dataset.stage = String(s.stage);
    zone.appendChild(stageIndicator);

    // ── Stage 1 container ─────────────────────────────────────────────────
    const stage1El = document.createElement("div");
    stage1El.className = "tod-stage";

    const paletteGuide = document.createElement("div");
    paletteGuide.className = "mini-label";
    paletteGuide.textContent = "Click a palette to select it, then click a time-of-day card to assign it.";
    stage1El.appendChild(paletteGuide);

    // Palette tiles (draggable / clickable)
    const paletteTray = document.createElement("div");
    paletteTray.className = "tod-palette-tray";

    const paletteBtns: Record<string, HTMLButtonElement> = {};

    PALETTES.forEach((pal) => {
      const btn = document.createElement("button");
      btn.className = "tod-palette-btn";
      btn.dataset.paletteId = pal.id;
      btn.setAttribute("aria-label", `Select ${pal.label}`);

      const lbl = document.createElement("span");
      lbl.className = "tod-palette-name";
      lbl.textContent = pal.label;
      btn.appendChild(lbl);

      const swatchRow = document.createElement("div");
      swatchRow.className = "tod-swatch-row";
      pal.swatches.forEach((color) => {
        const sw = document.createElement("div");
        sw.className = "tod-swatch";
        sw.style.background = color;
        swatchRow.appendChild(sw);
      });
      btn.appendChild(swatchRow);

      btn.addEventListener("click", () => {
        if (s.stage !== 1) return;
        const alreadyAssigned = Object.values(s.assignments).includes(pal.id);
        if (alreadyAssigned) return;
        s.selected = s.selected === pal.id ? null : pal.id;
        updateStage1();
      });

      paletteBtns[pal.id] = btn;
      paletteTray.appendChild(btn);
    });
    stage1El.appendChild(paletteTray);

    // Landscape drop slots
    const slotGrid = document.createElement("div");
    slotGrid.className = "tod-slot-grid";

    const slotEls: Record<string, HTMLDivElement> = {};

    SLOTS.forEach((slot) => {
      const card = document.createElement("div");
      card.className = "tod-slot";
      card.dataset.slotId = slot.id;

      const slotLabel = document.createElement("div");
      slotLabel.className = "tod-slot-label";
      slotLabel.textContent = slot.label;
      card.appendChild(slotLabel);

      const slotContent = document.createElement("div");
      slotContent.className = "tod-slot-content";
      card.appendChild(slotContent);

      card.addEventListener("click", () => {
        if (s.stage !== 1 || !s.selected) return;
        s.assignments[slot.id] = s.selected;
        s.selected = null;
        checkStage1Complete();
        updateStage1();
        syncStages();
      });

      slotEls[slot.id] = card;
      slotGrid.appendChild(card);
    });
    stage1El.appendChild(slotGrid);

    const stage1Feedback = document.createElement("div");
    stage1Feedback.className = "mini-label";
    stage1El.appendChild(stage1Feedback);

    const resetStage1Btn = document.createElement("button");
    resetStage1Btn.className = "btn btn-secondary";
    resetStage1Btn.textContent = "Reset Palettes";
    resetStage1Btn.addEventListener("click", () => {
      s.assignments = {};
      s.selected = null;
      s.stage1Complete = false;
      s.stage = 1;
      updateStage1();
      syncStages();
    });
    stage1El.appendChild(resetStage1Btn);

    zone.appendChild(stage1El);

    // ── Stage 2 container ─────────────────────────────────────────────────
    const stage2El = document.createElement("div");
    stage2El.className = "tod-stage";

    const postcardGuide = document.createElement("div");
    postcardGuide.className = "phase-guide";
    postcardGuide.textContent =
      "Target postcard: Golden Hour – warm orange sunlight, long shadows, soft glowing horizon. " +
      "Adjust the controls below until the window view matches.";
    stage2El.appendChild(postcardGuide);

    // Visual window scene
    const windowBoard = document.createElement("div");
    windowBoard.className = "tod-window-board";
    const windowSky = document.createElement("div");
    windowSky.className = "tod-window-sky";
    const windowSun = document.createElement("div");
    windowSun.className = "tod-window-sun";
    const windowGround = document.createElement("div");
    windowGround.className = "tod-window-ground";
    const windowShadow = document.createElement("div");
    windowShadow.className = "tod-window-shadow";
    windowGround.appendChild(windowShadow);
    windowSky.appendChild(windowSun);
    windowBoard.appendChild(windowSky);
    windowBoard.appendChild(windowGround);
    stage2El.appendChild(windowBoard);

    const stage2Feedback = document.createElement("div");
    stage2Feedback.className = "mini-label";
    stage2El.appendChild(stage2Feedback);

    const stage2Checklist = document.createElement("div");
    stage2Checklist.className = "mini-label";
    stage2El.appendChild(stage2Checklist);

    const updateStage2 = (): void => {
      // Sun position: sunHeight=0 → sun near horizon, sunHeight=1 → sun near top
      const sunTopPct = 68 - s.sunHeight * 60;
      const sunLeftPct = 50 + (s.sunHeight - 0.5) * 30;
      windowSun.style.top = `${sunTopPct}%`;
      windowSun.style.left = `${sunLeftPct}%`;

      // Sky color changes with colorTemp (cool ↔ warm) and sunHeight
      const hue = Math.round(220 - s.colorTemp * 190);        // 220 = cool blue, 30 = warm orange
      const sat = Math.round(30 + s.colorTemp * 50 * (1 - s.sunHeight * 0.4));
      const light = Math.round(38 + (1 - s.sunHeight) * 24);
      const hazeAlpha = s.atmosphere * 0.55;
      windowSky.style.background =
        `linear-gradient(180deg, hsl(${hue}, ${sat}%, ${light + 14}%), hsl(${hue - 10}, ${sat + 8}%, ${light}%))`;
      windowSky.style.filter = `blur(0)`;
      windowBoard.style.filter = s.atmosphere > 0.5
        ? `blur(${((s.atmosphere - 0.5) * 2).toFixed(2)}px)`
        : "none";
      windowBoard.style.setProperty("--haze-alpha", String(hazeAlpha));

      // Shadow: low sun (low sunHeight) → longer shadow
      const MIN_SHADOW_WIDTH = 8;
      const SHADOW_WIDTH_RANGE = 6;
      const MIN_SHADOW_LENGTH = 20;
      const MAX_SHADOW_LENGTH = 70;
      const shadowWidth = Math.round(MIN_SHADOW_WIDTH + s.sunHeight * SHADOW_WIDTH_RANGE);
      const shadowLength = Math.round(MIN_SHADOW_LENGTH + (1 - s.sunHeight) * MAX_SHADOW_LENGTH);
      windowShadow.style.width = `${shadowWidth}px`;
      windowShadow.style.height = `${shadowLength}px`;

      // Ground color warms with colorTemp
      const groundHue = Math.round(25 + s.colorTemp * 30);
      windowGround.style.background = `linear-gradient(180deg, hsl(${groundHue}, ${20 + s.colorTemp * 35}%, ${28 + s.colorTemp * 10}%), hsl(${groundHue - 5}, ${18 + s.colorTemp * 28}%, ${20 + s.colorTemp * 8}%))`;

      // Sun glow: warm temp → orange glow (hue ~40), cool temp → blue glow (hue ~180)
      const MIN_GLOW_HUE = 40;
      const GLOW_HUE_RANGE = 140;
      const glowHue = Math.round(MIN_GLOW_HUE + (1 - s.colorTemp) * GLOW_HUE_RANGE);
      const glowAlpha = 0.25 + s.colorTemp * 0.45;
      windowSun.style.background = `radial-gradient(circle, rgba(255,240,180,${glowAlpha}), hsl(${glowHue}, 95%, 65%) 40%, transparent 72%)`;

      const heightOk = s.sunHeight < 0.35;
      const tempOk = s.colorTemp > 0.70;
      const atmosOk = s.atmosphere >= 0.40 && s.atmosphere <= 0.60;
      const heightIcon = heightOk ? "✓" : "…";
      const tempIcon = tempOk ? "✓" : "…";
      const atmosIcon = atmosOk ? "✓" : "…";
      stage2Checklist.textContent =
        `Sun height ${heightIcon} | Color temperature ${tempIcon} | Atmosphere ${atmosIcon}`;

      if (heightOk && tempOk && atmosOk) {
        stage2Feedback.textContent = "Golden hour achieved! The Sun Finch has arrived. ✓";
      } else {
        const hints: string[] = [];
        if (!heightOk) hints.push("lower the sun toward the horizon");
        if (!tempOk) hints.push("warm the color temperature toward orange");
        if (!atmosOk) hints.push("set atmosphere to a moderate haze");
        stage2Feedback.textContent = `Adjust: ${hints.join("; ")}.`;
      }
    };

    addSlider(stage2El, "Sun Height (low = near horizon)", s.sunHeight, 0, 1, 0.01, (v) => {
      s.sunHeight = v;
      updateStage2();
    });
    addSlider(stage2El, "Atmosphere (haze)", s.atmosphere, 0, 1, 0.01, (v) => {
      s.atmosphere = v;
      updateStage2();
    });
    addSlider(stage2El, "Color Temperature (cool ← → warm)", s.colorTemp, 0, 1, 0.01, (v) => {
      s.colorTemp = v;
      updateStage2();
    });

    zone.appendChild(stage2El);

    // ── Helpers ───────────────────────────────────────────────────────────
    function checkStage1Complete(): void {
      const allAssigned = SLOTS.every((sl) => Boolean(s.assignments[sl.id]));
      if (!allAssigned) return;
      const allCorrect = SLOTS.every((sl) => s.assignments[sl.id] === sl.correctPaletteId);
      if (allCorrect) {
        s.stage1Complete = true;
        s.stage = 2;
      } else {
        stage1Feedback.textContent = "The sun's color changes as it moves across the sky. Try again!";
        s.assignments = {};
        s.selected = null;
      }
    }

    function updateStage1(): void {
      PALETTES.forEach((pal) => {
        const btn = paletteBtns[pal.id];
        const isAssigned = Object.values(s.assignments).includes(pal.id);
        const isSelected = s.selected === pal.id;
        btn.classList.toggle("--assigned", isAssigned);
        btn.classList.toggle("--selected", isSelected);
        btn.disabled = isAssigned;
      });

      SLOTS.forEach((slot) => {
        const card = slotEls[slot.id];
        const assignedId = s.assignments[slot.id];
        const content = card.querySelector(".tod-slot-content") as HTMLDivElement;
        if (assignedId) {
          const pal = PALETTES.find((p) => p.id === assignedId)!;
          content.textContent = pal.label;
          card.classList.add("--assigned");
        } else {
          content.textContent = s.selected ? "← click to assign" : "";
          card.classList.remove("--assigned");
        }
        card.classList.toggle("--drop-ready", Boolean(s.selected) && !assignedId);
      });

      stage1Feedback.textContent = s.selected
        ? `${PALETTES.find((p) => p.id === s.selected)!.label} selected – now click a time-of-day card.`
        : "";
    }

    function syncStages(): void {
      stageIndicator.dataset.stage = String(s.stage);
      if (s.stage === 1) {
        stageIndicator.textContent = "Stage 1 – Match the Palette";
        stage1El.style.display = "";
        stage2El.style.display = "none";
      } else {
        stageIndicator.textContent = "Stage 2 – Control the Sun";
        stage1El.style.display = "none";
        stage2El.style.display = "";
        updateStage2();
      }
    }

    updateStage1();
    syncStages();

    addCheckButton(wrapper, puzzleId, () => ({
      palettesMatched: s.stage1Complete,
      sunHeight: s.sunHeight,
      colorTemperature: s.colorTemp,
      atmosphere: s.atmosphere,
    }));
};

type Puzzle15ViewProps = {
  deps: PuzzleRenderDeps;
};

function Puzzle15View({ deps }: Puzzle15ViewProps): null {
  React.useEffect(() => {
    renderPuzzle15Imperative(deps);
  }, [deps]);

  return null;
}

export const renderPuzzle15: PuzzleRenderer = (deps: PuzzleRenderDeps) => {
  createRoot(deps.zone).render(<Puzzle15View deps={deps} />);
};
