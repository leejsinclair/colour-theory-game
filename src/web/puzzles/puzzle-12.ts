import { PuzzleRenderDeps, PuzzleRenderer } from "./types";

export const renderPuzzle12: PuzzleRenderer = (deps: PuzzleRenderDeps) => {
  const {
    zone,
    wrapper,
    puzzleId,
    ensureState,
    addSlider,
    addCheckButton,
  } = deps;

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
};
