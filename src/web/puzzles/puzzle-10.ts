import { PuzzleRenderDeps, PuzzleRenderer } from "./types";

export const renderPuzzle10: PuzzleRenderer = (deps: PuzzleRenderDeps) => {
  const {
    zone,
    wrapper,
    puzzleId,
    ensureState,
    addSlider,
    addCheckButton,
    circularHueDistance,
    render,
  } = deps;

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
    matchButton.className = "btn btn-secondary";
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
};
