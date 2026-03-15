import { PuzzleRenderDeps, PuzzleRenderer } from "./types";

export const renderPuzzle14: PuzzleRenderer = (deps: PuzzleRenderDeps) => {
  const {
    zone,
    wrapper,
    puzzleId,
    ensureState,
    addSlider,
    addCheckButton,
    render,
  } = deps;

    const s = ensureState(puzzleId, { scatter: 0.2, haze: 0.2 });

    const board = document.createElement("div");
    board.className = "scatter-board";
    const sky = document.createElement("div");
    sky.className = "scatter-sky";
    const ridgeNear = document.createElement("div");
    ridgeNear.className = "scatter-ridge near";
    const ridgeFar = document.createElement("div");
    ridgeFar.className = "scatter-ridge far";
    sky.appendChild(ridgeFar);
    sky.appendChild(ridgeNear);
    board.appendChild(sky);
    zone.appendChild(board);

    const feedback = document.createElement("div");
    feedback.className = "mini-label";
    zone.appendChild(feedback);

    const updateScatter = (): void => {
      const skyHue = Math.round(200 + s.scatter * 24);
      sky.style.background = `linear-gradient(180deg, hsl(${skyHue}, ${45 + s.scatter * 30}%, 68%), hsl(${skyHue + 14}, ${30 + s.scatter * 25}%, 52%))`;
      ridgeNear.style.background = `hsl(125, ${48 - s.haze * 18}%, ${34 + s.haze * 8}%)`;
      ridgeFar.style.background = `hsl(${198 + s.scatter * 18}, ${28 + s.haze * 25}%, ${54 + s.haze * 18}%)`;
      ridgeFar.style.opacity = `${0.55 + s.haze * 0.4}`;

      const shiftBlue = s.scatter >= 0.6;
      feedback.textContent = shiftBlue
        ? "Far ridge shifts blue with stronger scattering ✓"
        : "Increase scattering to push far forms toward blue.";
    };

    addSlider(zone, "Scattering strength", s.scatter, 0, 1, 0.01, (v) => {
      s.scatter = v;
      updateScatter();
    });
    addSlider(zone, "Atmospheric haze", s.haze, 0, 1, 0.01, (v) => {
      s.haze = v;
      updateScatter();
    });

    const gust = document.createElement("button");
    gust.className = "btn btn-secondary";
    gust.textContent = "Add Blue Haze Burst";
    gust.addEventListener("click", () => {
      s.scatter = Math.min(1, s.scatter + 0.14);
      s.haze = Math.min(1, s.haze + 0.12);
      render();
    });
    zone.appendChild(gust);

    updateScatter();
    addCheckButton(wrapper, puzzleId, () => ({
      farObjectsShiftBlue: s.scatter >= 0.6,
      scatteringStrength: s.scatter,
    }));
};
