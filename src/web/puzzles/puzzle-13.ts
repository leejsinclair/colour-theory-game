import { PuzzleRenderDeps, PuzzleRenderer } from "./types";

export const renderPuzzle13: PuzzleRenderer = (deps: PuzzleRenderDeps) => {
  const {
    zone,
    wrapper,
    puzzleId,
    ensureState,
    addSlider,
    addCheckButton,
  } = deps;

    const s = ensureState(puzzleId, { edgeDrop: 0.15, satDrop: 0.2, coolShift: 0.15 });

    const scene = document.createElement("div");
    scene.className = "depth-scene";
    const near = document.createElement("div");
    near.className = "mountain near";
    const mid = document.createElement("div");
    mid.className = "mountain mid";
    const far = document.createElement("div");
    far.className = "mountain far";
    scene.appendChild(far);
    scene.appendChild(mid);
    scene.appendChild(near);
    zone.appendChild(scene);

    const feedback = document.createElement("div");
    feedback.className = "mini-label";
    zone.appendChild(feedback);

    const updateDepth = (): void => {
      const nearHue = 120;
      const midHue = Math.round(nearHue + s.coolShift * 30);
      const farHue = Math.round(nearHue + s.coolShift * 65);
      near.style.background = `hsl(${nearHue}, ${Math.round(70 - s.satDrop * 20)}%, 36%)`;
      mid.style.background = `hsl(${midHue}, ${Math.round(62 - s.satDrop * 40)}%, 43%)`;
      far.style.background = `hsl(${farHue}, ${Math.round(54 - s.satDrop * 55)}%, 56%)`;
      near.style.filter = "none";
      mid.style.filter = `blur(${(s.edgeDrop * 4).toFixed(1)}px)`;
      far.style.filter = `blur(${(s.edgeDrop * 8).toFixed(1)}px)`;

      const edgesOk = s.edgeDrop >= 0.45;
      const satOk = s.satDrop >= 0.45;
      const coolOk = s.coolShift >= 0.45;
      feedback.textContent = `Depth cues: edges ${edgesOk ? "✓" : "..."} | saturation ${satOk ? "✓" : "..."} | cooler distance ${coolOk ? "✓" : "..."}`;
    };

    addSlider(zone, "Edge softening", s.edgeDrop, 0, 1, 0.01, (v) => { s.edgeDrop = v; updateDepth(); });
    addSlider(zone, "Saturation drop", s.satDrop, 0, 1, 0.01, (v) => { s.satDrop = v; updateDepth(); });
    addSlider(zone, "Cool shift", s.coolShift, 0, 1, 0.01, (v) => { s.coolShift = v; updateDepth(); });
    updateDepth();

    addCheckButton(wrapper, puzzleId, () => ({
      edgeSharpnessDropsWithDistance: s.edgeDrop >= 0.45,
      saturationDropsWithDistance: s.satDrop >= 0.45,
      hueShiftsCoolerWithDistance: s.coolShift >= 0.45,
    }));
};
