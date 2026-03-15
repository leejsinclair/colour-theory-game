import { PuzzleRenderDeps, PuzzleRenderer } from "./types";

export const renderPuzzle11: PuzzleRenderer = (deps: PuzzleRenderDeps) => {
  const {
    zone,
    wrapper,
    puzzleId,
    ensureState,
    addSlider,
    addCheckButton,
    circularHueDistance,
  } = deps;

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
};
