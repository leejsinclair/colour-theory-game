import { PuzzleRenderDeps, PuzzleRenderer } from "./types";

export const renderPuzzle06: PuzzleRenderer = (deps: PuzzleRenderDeps) => {
  const {
    zone,
    wrapper,
    puzzleId,
    ensureState,
    addMiniLabel,
    addCheckButton,
  } = deps;

    const s = ensureState(puzzleId, {
      visited: {} as Record<string, boolean>,
      peakByHue: { red: 4, green: 2, blue: 3 } as Record<string, number>,
      foundPeak: { red: false, green: false, blue: false } as Record<string, boolean>,
    });

    addMiniLabel(zone, "Explore hue branches and find each hue's max chroma node. Peaks differ by hue.");

    const hues = ["red", "green", "blue"];
    const tree = document.createElement("div");
    tree.className = "chroma-tree";

    const status = document.createElement("div");
    status.className = "mini-label";

    const updateStatus = (): void => {
      const foundCount = Object.values(s.foundPeak).filter(Boolean).length;
      status.textContent = `Peaks found: ${foundCount}/3`;
    };

    hues.forEach((hue) => {
      const branch = document.createElement("div");
      branch.className = "chroma-branch";
      const title = document.createElement("div");
      title.className = "mini-label";
      title.textContent = `${hue.toUpperCase()} branch`;
      branch.appendChild(title);

      const nodes = document.createElement("div");
      nodes.className = "chroma-nodes";
      for (let value = 0; value <= 4; value += 1) {
        const key = `${hue}-${value}`;
        const node = document.createElement("button");
        node.className = "chroma-node";
        const sat = 25 + value * 15;
        node.style.background = `hsl(${hue === "red" ? 0 : hue === "green" ? 120 : 220}, ${sat}%, 50%)`;
        node.title = `${hue} value ${value}`;
        node.addEventListener("click", () => {
          s.visited[key] = true;
          node.classList.add("visited");
          if (s.peakByHue[hue] === value) {
            s.foundPeak[hue] = true;
            node.classList.add("peak");
          }
          updateStatus();
        });
        nodes.appendChild(node);
      }
      branch.appendChild(nodes);
      tree.appendChild(branch);
    });

    zone.appendChild(tree);
    zone.appendChild(status);
    updateStatus();

    addCheckButton(wrapper, puzzleId, () => ({
      exploredHues: hues.filter((hue) => Object.keys(s.visited).some((k) => k.startsWith(`${hue}-`))),
      discoveredDifferentChromaPeaks: Object.values(s.foundPeak).every(Boolean),
    }));
};
