import { PuzzleRenderDeps, PuzzleRenderer } from "./types";

export const renderPuzzle02: PuzzleRenderer = (deps: PuzzleRenderDeps) => {
  const {
    zone,
    wrapper,
    puzzleId,
    ensureState,
    addSlider,
    addCheckButton,
  } = deps;

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
};
