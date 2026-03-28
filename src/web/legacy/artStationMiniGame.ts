export type ArtPadState = {
  cols: number;
  rows: number;
  pixels: string[];
};

type RenderArtStationMiniGameParams = {
  container: HTMLElement;
  wrapper: HTMLDivElement;
  puzzleId: string;
  state: string;
  artPalette: string[];
  selectedArtColor: string;
  setSelectedArtColor: (color: string) => void;
  artPad: ArtPadState;
  addCheckButton: (wrapper: HTMLDivElement, puzzleId: string, inputFactory: () => unknown) => void;
  render: () => void;
  updatePuzzlePanel: () => void;
};

export function getArtCoverage(artPad: ArtPadState): number {
  const colored = artPad.pixels.filter((pixel) => pixel !== "#ffffff").length;
  return colored / artPad.pixels.length;
}

export function renderArtStationMiniGame(params: RenderArtStationMiniGameParams): void {
  const {
    container,
    wrapper,
    puzzleId,
    state,
    artPalette,
    selectedArtColor,
    setSelectedArtColor,
    artPad,
    addCheckButton,
    render,
    updatePuzzlePanel,
  } = params;

  const card = document.createElement("div");
  card.className = "art-game-card";

  const heading = document.createElement("div");
  heading.className = "art-game-heading";
  heading.innerHTML = "<strong>Art Station Mini Game</strong><div class=\"puzzle-meta\">Paint dots of pure color. Step back to see optical mixing at work.</div>";
  card.appendChild(heading);

  const swatchRow = document.createElement("div");
  swatchRow.className = "swatch-row";
  artPalette.forEach((color) => {
    const swatch = document.createElement("button");
    swatch.className = `swatch ${selectedArtColor === color ? "is-active" : ""}`;
    swatch.style.background = color;
    swatch.title = color;
    swatch.addEventListener("click", () => {
      setSelectedArtColor(color);
      updatePuzzlePanel();
    });
    swatchRow.appendChild(swatch);
  });
  card.appendChild(swatchRow);

  const paintCanvas = document.createElement("canvas");
  paintCanvas.className = "paint-pad";
  paintCanvas.width = 360;
  paintCanvas.height = 200;
  card.appendChild(paintCanvas);

  const opticalPreviewWrap = document.createElement("div");
  opticalPreviewWrap.className = "optical-preview-wrap";
  const opticalPreviewLabel = document.createElement("div");
  opticalPreviewLabel.className = "mini-label";
  opticalPreviewLabel.textContent = "Distance view (tiled blend preview)";
  const opticalPreviewCanvas = document.createElement("canvas");
  opticalPreviewCanvas.className = "optical-preview-canvas";
  opticalPreviewCanvas.width = 180;
  opticalPreviewCanvas.height = 100;
  opticalPreviewWrap.appendChild(opticalPreviewLabel);
  opticalPreviewWrap.appendChild(opticalPreviewCanvas);
  card.appendChild(opticalPreviewWrap);

  const coverageWrap = document.createElement("div");
  coverageWrap.className = "coverage-wrap";
  const coverageTrack = document.createElement("div");
  coverageTrack.className = "coverage-bar-track";
  const coverageFill = document.createElement("div");
  coverageFill.className = "coverage-bar-fill";
  coverageFill.style.width = "0%";
  coverageTrack.appendChild(coverageFill);
  const coverageLabel = document.createElement("div");
  coverageLabel.className = "coverage-bar-label";
  coverageWrap.appendChild(coverageTrack);
  coverageWrap.appendChild(coverageLabel);
  card.appendChild(coverageWrap);

  const controls = document.createElement("div");
  controls.className = "action-row";
  const clearButton = document.createElement("button");
  clearButton.className = "btn btn-secondary";
  clearButton.textContent = "Clear Pad";
  clearButton.addEventListener("click", () => {
    artPad.pixels.fill("#ffffff");
    render();
  });
  controls.appendChild(clearButton);
  card.appendChild(controls);

  if (state === "available") {
    addCheckButton(wrapper, puzzleId, () => {
      const usedColors = new Set(artPad.pixels.filter((pixel) => pixel !== "#ffffff"));
      return {
        usedPureDots: getArtCoverage(artPad) >= 0.12,
        mixedOnPalette: false,
        opticalBlendVisible: usedColors.size >= 3,
      };
    });
  }

  const padCtx = paintCanvas.getContext("2d");
  const previewCtx = opticalPreviewCanvas.getContext("2d");
  if (!padCtx || !previewCtx) {
    return;
  }

  const cellW = paintCanvas.width / artPad.cols;
  const cellH = paintCanvas.height / artPad.rows;
  const previewCols = 9;
  const previewRows = 5;
  const sampleW = artPad.cols / previewCols;
  const sampleH = artPad.rows / previewRows;
  const previewCellW = opticalPreviewCanvas.width / previewCols;
  const previewCellH = opticalPreviewCanvas.height / previewRows;

  const hexToRgb = (hex: string): [number, number, number] => {
    const h = hex.replace("#", "");
    if (h.length !== 6) {
      return [255, 255, 255];
    }
    const r = Number.parseInt(h.slice(0, 2), 16);
    const g = Number.parseInt(h.slice(2, 4), 16);
    const b = Number.parseInt(h.slice(4, 6), 16);
    return [r, g, b];
  };

  const renderOpticalPreview = (): void => {
    for (let py = 0; py < previewRows; py += 1) {
      for (let px = 0; px < previewCols; px += 1) {
        const startX = Math.floor(px * sampleW);
        const endX = Math.min(artPad.cols, Math.floor((px + 1) * sampleW));
        const startY = Math.floor(py * sampleH);
        const endY = Math.min(artPad.rows, Math.floor((py + 1) * sampleH));

        let r = 0;
        let g = 0;
        let b = 0;
        let count = 0;
        for (let y = startY; y < endY; y += 1) {
          for (let x = startX; x < endX; x += 1) {
            const idx = y * artPad.cols + x;
            const [pr, pg, pb] = hexToRgb(artPad.pixels[idx]);
            r += pr;
            g += pg;
            b += pb;
            count += 1;
          }
        }

        const rr = Math.round(r / Math.max(1, count));
        const gg = Math.round(g / Math.max(1, count));
        const bb = Math.round(b / Math.max(1, count));
        previewCtx.fillStyle = `rgb(${rr}, ${gg}, ${bb})`;
        previewCtx.fillRect(px * previewCellW, py * previewCellH, previewCellW, previewCellH);
      }
    }

    previewCtx.strokeStyle = "rgba(31, 32, 48, 0.16)";
    for (let x = 0; x <= previewCols; x += 1) {
      previewCtx.beginPath();
      previewCtx.moveTo(x * previewCellW, 0);
      previewCtx.lineTo(x * previewCellW, opticalPreviewCanvas.height);
      previewCtx.stroke();
    }
    for (let y = 0; y <= previewRows; y += 1) {
      previewCtx.beginPath();
      previewCtx.moveTo(0, y * previewCellH);
      previewCtx.lineTo(opticalPreviewCanvas.width, y * previewCellH);
      previewCtx.stroke();
    }
  };

  const updateCoverage = (): void => {
    const pct = Math.round(getArtCoverage(artPad) * 100);
    coverageFill.style.width = `${pct}%`;
    const ready = pct >= 12;
    coverageFill.classList.toggle("--ready", ready);
    coverageLabel.textContent = ready
      ? `Coverage: ${pct}% ✓ Optical mixing visible!`
      : `Coverage: ${pct}% — paint more dots (need 12%)`;
  };

  const drawPad = (): void => {
    for (let row = 0; row < artPad.rows; row += 1) {
      for (let col = 0; col < artPad.cols; col += 1) {
        const idx = row * artPad.cols + col;
        padCtx.fillStyle = artPad.pixels[idx];
        padCtx.fillRect(col * cellW, row * cellH, cellW, cellH);
      }
    }

    padCtx.strokeStyle = "rgba(31, 32, 48, 0.12)";
    for (let col = 0; col <= artPad.cols; col += 1) {
      padCtx.beginPath();
      padCtx.moveTo(col * cellW, 0);
      padCtx.lineTo(col * cellW, paintCanvas.height);
      padCtx.stroke();
    }
    for (let row = 0; row <= artPad.rows; row += 1) {
      padCtx.beginPath();
      padCtx.moveTo(0, row * cellH);
      padCtx.lineTo(paintCanvas.width, row * cellH);
      padCtx.stroke();
    }

    updateCoverage();
    renderOpticalPreview();
  };

  const paintAt = (clientX: number, clientY: number): void => {
    const rect = paintCanvas.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * paintCanvas.width;
    const y = ((clientY - rect.top) / rect.height) * paintCanvas.height;
    const col = Math.max(0, Math.min(artPad.cols - 1, Math.floor(x / cellW)));
    const row = Math.max(0, Math.min(artPad.rows - 1, Math.floor(y / cellH)));
    artPad.pixels[row * artPad.cols + col] = selectedArtColor;
    drawPad();
  };

  let isPainting = false;
  paintCanvas.addEventListener("pointerdown", (event) => {
    isPainting = true;
    paintCanvas.setPointerCapture(event.pointerId);
    paintAt(event.clientX, event.clientY);
  });
  paintCanvas.addEventListener("pointermove", (event) => {
    if (!isPainting) {
      return;
    }
    paintAt(event.clientX, event.clientY);
  });
  paintCanvas.addEventListener("pointerup", () => {
    isPainting = false;
  });
  paintCanvas.addEventListener("pointerleave", () => {
    isPainting = false;
  });

  drawPad();
  container.appendChild(card);
}
