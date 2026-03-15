import { PuzzleRenderDeps, PuzzleRenderer } from "./types";

export const renderPuzzle03: PuzzleRenderer = (deps: PuzzleRenderDeps) => {
  const {
    zone,
    wrapper,
    puzzleId,
    ensureState,
    addSlider,
    addCheckButton,
    render,
  } = deps;

    const s = ensureState(puzzleId, { a: "blue", b: "orange", luminousShadow: false, gloss: 0.3 });

    const bowl = document.createElement("div");
    bowl.className = "mix-bowl";
    const swatch = document.createElement("div");
    swatch.className = "mix-bowl-swatch";
    bowl.appendChild(swatch);
    zone.appendChild(bowl);

    const palette = document.createElement("div");
    palette.className = "chip-grid";
    zone.appendChild(palette);

    const chipHue: Record<string, number> = {
      red: 8,
      orange: 28,
      yellow: 52,
      green: 132,
      blue: 220,
      purple: 282,
    };
    const colors = Object.keys(chipHue);

    const feedback = document.createElement("div");
    feedback.className = "mini-label";
    zone.appendChild(feedback);

    const isComplement = (a: string, b: string): boolean => {
      const pair = [a, b].sort().join("+");
      return ["blue+orange", "green+red", "purple+yellow"].includes(pair);
    };

    const updateMix = (): void => {
      const h1 = chipHue[s.a] ?? 0;
      const h2 = chipHue[s.b] ?? 0;
      const hue = Math.round((h1 + h2) / 2);
      const complement = isComplement(s.a, s.b);
      const sat = complement ? Math.max(8, Math.round(20 + s.gloss * 20)) : Math.round(38 + s.gloss * 15);
      const light = complement ? Math.round(18 + s.gloss * 12) : Math.round(24 + s.gloss * 8);
      swatch.style.background = `radial-gradient(circle at 35% 30%, rgba(255,255,255,${0.16 + s.gloss * 0.4}), transparent 42%), hsl(${hue}, ${sat}%, ${light}%)`;
      s.luminousShadow = complement && s.gloss >= 0.55;
      feedback.textContent = s.luminousShadow
        ? "Luminous chromatic black achieved ✓"
        : complement
          ? "Add a touch of gloss to lift the shadow from flat to luminous"
          : "These pigments neutralize poorly. Try a true complement pair.";
    };

    const makeChipButton = (name: string, target: "a" | "b"): HTMLButtonElement => {
      const btn = document.createElement("button");
      btn.className = "chip-btn";
      btn.textContent = `${target === "a" ? "A" : "B"}: ${name}`;
      btn.style.background = `hsl(${chipHue[name]}, 80%, 52%)`;
      btn.addEventListener("click", () => {
        s[target] = name;
        render();
      });
      return btn;
    };

    const titleA = document.createElement("div");
    titleA.className = "mini-label";
    titleA.textContent = `Pigment A: ${s.a}`;
    palette.appendChild(titleA);
    const rowA = document.createElement("div");
    rowA.className = "chip-row";
    colors.forEach((name) => rowA.appendChild(makeChipButton(name, "a")));
    palette.appendChild(rowA);

    const titleB = document.createElement("div");
    titleB.className = "mini-label";
    titleB.textContent = `Pigment B: ${s.b}`;
    palette.appendChild(titleB);
    const rowB = document.createElement("div");
    rowB.className = "chip-row";
    colors.forEach((name) => rowB.appendChild(makeChipButton(name, "b")));
    palette.appendChild(rowB);

    addSlider(zone, "Shadow gloss", s.gloss, 0, 1, 0.01, (v) => {
      s.gloss = v;
      updateMix();
    });

    updateMix();
    addCheckButton(wrapper, puzzleId, () => ({ pigments: [s.a, s.b], luminousShadow: s.luminousShadow }));
};
