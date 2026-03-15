import { PuzzleRenderDeps, PuzzleRenderer } from "./types";

export const renderPuzzle08: PuzzleRenderer = (deps: PuzzleRenderDeps) => {
  const {
    zone,
    wrapper,
    puzzleId,
    ensureState,
    addMiniLabel,
    addCheckButton,
  } = deps;

    const s = ensureState(puzzleId, { h1: 0, h2: 120, h3: 240 });

    const triadStrip = document.createElement("div");
    triadStrip.className = "triad-strip";
    const triadMarks = [0, 1, 2].map(() => {
      const mark = document.createElement("div");
      mark.className = "triad-mark";
      triadStrip.appendChild(mark);
      return mark;
    });

    const triadLabel = document.createElement("div");
    triadLabel.className = "mini-label";

    const renderHueRow = (label: string, key: "h1" | "h2" | "h3"): void => {
      const row = document.createElement("label");
      row.className = "mini-row";

      const top = document.createElement("div");
      top.className = "hue-row";
      const title = document.createElement("span");
      title.textContent = `${label}: ${Math.round(s[key])}deg`;
      const swatch = document.createElement("span");
      swatch.className = "hue-swatch";
      swatch.style.background = `hsl(${s[key]}, 85%, 55%)`;
      top.appendChild(title);
      top.appendChild(swatch);

      const slider = document.createElement("input");
      slider.type = "range";
      slider.min = "0";
      slider.max = "360";
      slider.step = "1";
      slider.value = String(s[key]);
      slider.addEventListener("input", () => {
        s[key] = Number(slider.value);
        title.textContent = `${label}: ${Math.round(s[key])}deg`;
        swatch.style.background = `hsl(${s[key]}, 85%, 55%)`;
        updateTriadVisuals();
      });

      row.appendChild(top);
      row.appendChild(slider);
      zone.appendChild(row);
    };

    const updateTriadVisuals = (): void => {
      const values = [s.h1, s.h2, s.h3].map((h) => ((h % 360) + 360) % 360).sort((a, b) => a - b);
      const gaps = [
        (values[1] - values[0] + 360) % 360,
        (values[2] - values[1] + 360) % 360,
        (values[0] + 360 - values[2]) % 360,
      ];
      const tolerance = 15;
      const good = gaps.every((gap) => Math.abs(gap - 120) <= tolerance);

      [s.h1, s.h2, s.h3].forEach((hue, index) => {
        triadMarks[index].style.left = `${((hue % 360 + 360) % 360) / 360 * 100}%`;
        triadMarks[index].style.background = `hsl(${hue}, 85%, 55%)`;
      });

      triadLabel.textContent = `Gaps: ${Math.round(gaps[0])}deg / ${Math.round(gaps[1])}deg / ${Math.round(gaps[2])}deg${good ? "  triad aligned" : ""}`;
    };

    addMiniLabel(zone, "Aim for roughly equal 120deg spacing between all three hue markers.");
    renderHueRow("Hue 1", "h1");
    renderHueRow("Hue 2", "h2");
    renderHueRow("Hue 3", "h3");
    zone.appendChild(triadStrip);
    zone.appendChild(triadLabel);
    updateTriadVisuals();

    addCheckButton(wrapper, puzzleId, () => ({ hueAngles: [s.h1, s.h2, s.h3] }));
};
