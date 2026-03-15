import { PuzzleRenderDeps, PuzzleRenderer } from "./types";

export const renderPuzzle05: PuzzleRenderer = (deps: PuzzleRenderDeps) => {
  const {
    zone,
    wrapper,
    puzzleId,
    ensureState,
    addMiniLabel,
    addCheckButton,
    shuffleArray,
  } = deps;

    const s = ensureState(puzzleId, { tiles: shuffleArray([0.05, 0.2, 0.4, 0.6, 0.8, 0.95]), revealed: false });
    addMiniLabel(zone, "Reorder tiles from darkest to lightest. Correct order reveals hidden icon.");

    const renderTiles = (): void => {
      tilesWrap.innerHTML = "";
      s.tiles.forEach((value: number, idx: number) => {
        const tile = document.createElement("div");
        tile.className = "ladder-tile";
        tile.style.background = `rgb(${Math.round(value * 255)}, ${Math.round(value * 255)}, ${Math.round(value * 255)})`;

        const controls = document.createElement("div");
        controls.className = "ladder-controls";
        const left = document.createElement("button");
        left.className = "btn mini";
        left.textContent = "←";
        left.disabled = idx === 0;
        left.addEventListener("click", () => {
          [s.tiles[idx - 1], s.tiles[idx]] = [s.tiles[idx], s.tiles[idx - 1]];
          renderTiles();
          updateReveal();
        });
        const right = document.createElement("button");
        right.className = "btn mini";
        right.textContent = "→";
        right.disabled = idx === s.tiles.length - 1;
        right.addEventListener("click", () => {
          [s.tiles[idx + 1], s.tiles[idx]] = [s.tiles[idx], s.tiles[idx + 1]];
          renderTiles();
          updateReveal();
        });
        controls.appendChild(left);
        controls.appendChild(right);

        tile.appendChild(controls);
        tilesWrap.appendChild(tile);
      });
    };

    const tilesWrap = document.createElement("div");
    tilesWrap.className = "ladder-wrap";
    zone.appendChild(tilesWrap);

    const reveal = document.createElement("div");
    reveal.className = "hidden-reveal";
    zone.appendChild(reveal);

    const updateReveal = (): void => {
      const ordered = s.tiles.every((v: number, i: number, arr: number[]) => i === 0 || v >= arr[i - 1]);
      s.revealed = ordered;
      reveal.textContent = ordered ? "Hidden image revealed: ⟡" : "Hidden image is scrambled";
      reveal.classList.toggle("is-on", ordered);
    };

    renderTiles();
    updateReveal();
    addCheckButton(wrapper, puzzleId, () => ({ orderedValues: s.tiles, hiddenImageRevealed: s.revealed }));
};
