import { PuzzleRenderDeps, PuzzleRenderer } from "./types";

export const renderPuzzle01: PuzzleRenderer = (deps: PuzzleRenderDeps) => {
  const {
    zone,
    wrapper,
    puzzleId,
    ensureState,
    addCheckButton,
  } = deps;

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
};
