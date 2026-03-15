import { PuzzleRenderDeps, PuzzleRenderer } from "./types";

export const renderPuzzle04: PuzzleRenderer = (deps: PuzzleRenderDeps) => {
  const {
    zone,
    wrapper,
    puzzleId,
    ensureState,
    addMiniLabel,
    addCheckButton,
  } = deps;

    const s = ensureState(puzzleId, { tones: [30, 220, 40, 210, 50, 200], blur: true });

    addMiniLabel(zone, "Paint the statue blocks in grayscale so the silhouette stays readable under blur.");

    const blockRow = document.createElement("div");
    blockRow.className = "value-block-row";
    const blocks = s.tones.map((tone: number, idx: number) => {
      const block = document.createElement("button");
      block.className = "value-block";
      block.style.background = `rgb(${tone}, ${tone}, ${tone})`;
      block.title = `Tone ${idx + 1}: ${tone}`;
      block.addEventListener("click", () => {
        s.tones[idx] = (s.tones[idx] + 32) % 256;
        block.style.background = `rgb(${s.tones[idx]}, ${s.tones[idx]}, ${s.tones[idx]})`;
        updateReadability();
      });
      blockRow.appendChild(block);
      return block;
    });
    zone.appendChild(blockRow);

    const blurPreview = document.createElement("div");
    blurPreview.className = "blur-preview";
    blocks.forEach((_, idx) => {
      const stripe = document.createElement("div");
      stripe.className = "blur-stripe";
      stripe.style.background = `rgb(${s.tones[idx]}, ${s.tones[idx]}, ${s.tones[idx]})`;
      blurPreview.appendChild(stripe);
    });
    zone.appendChild(blurPreview);

    const blurToggle = document.createElement("button");
    blurToggle.className = "btn btn-secondary";
    blurToggle.textContent = "Toggle Squint Blur";
    blurToggle.addEventListener("click", () => {
      s.blur = !s.blur;
      blurPreview.style.filter = s.blur ? "blur(4px)" : "none";
    });
    zone.appendChild(blurToggle);

    const readout = document.createElement("div");
    readout.className = "mini-label";
    zone.appendChild(readout);

    const updateReadability = (): void => {
      const min = Math.min(...s.tones);
      const max = Math.max(...s.tones);
      const readability = (max - min) / 255;
      readout.textContent = `Blur readability: ${(readability * 100).toFixed(0)}% (target >= 75%)`;
      [...blurPreview.children].forEach((node, idx) => {
        (node as HTMLElement).style.background = `rgb(${s.tones[idx]}, ${s.tones[idx]}, ${s.tones[idx]})`;
      });
    };
    updateReadability();

    addCheckButton(wrapper, puzzleId, () => {
      const min = Math.min(...s.tones);
      const max = Math.max(...s.tones);
      return { usesOnlyBlackAndWhite: true, blurReadability: (max - min) / 255 };
    });
};
