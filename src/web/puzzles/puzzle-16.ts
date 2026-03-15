import { PuzzleRenderDeps, PuzzleRenderer } from "./types";

export const renderPuzzle16: PuzzleRenderer = (deps: PuzzleRenderDeps) => {
  const {
    zone,
    wrapper,
    puzzleId,
    ensureState,
    addSlider,
    addCheckbox,
    addCheckButton,
  } = deps;

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
};
