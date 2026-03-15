import { PuzzleRenderDeps, PuzzleRenderer } from "./types";

export const renderPuzzle07: PuzzleRenderer = (deps: PuzzleRenderDeps) => {
  const {
    zone,
    wrapper,
    puzzleId,
    ensureState,
    addCheckButton,
  } = deps;

    const s = ensureState(puzzleId, { a: "red", b: "green", rounds: 0, streak: 0 });

    const defs = [
      { name: "red", hue: 8 },
      { name: "orange", hue: 28 },
      { name: "yellow", hue: 52 },
      { name: "green", hue: 130 },
      { name: "blue", hue: 220 },
      { name: "purple", hue: 282 },
    ];
    const comp: Record<string, string> = { red: "green", green: "red", blue: "orange", orange: "blue", yellow: "purple", purple: "yellow" };

    const wheel = document.createElement("div");
    wheel.className = "chip-row";
    zone.appendChild(wheel);

    const prompt = document.createElement("div");
    prompt.className = "mini-label";
    zone.appendChild(prompt);

    const result = document.createElement("div");
    result.className = "mini-label";
    zone.appendChild(result);

    const updatePrompt = (): void => {
      prompt.textContent = `Target: pick the complement for ${s.a.toUpperCase()}`;
    };

    const targetBtnRow = document.createElement("div");
    targetBtnRow.className = "chip-row";
    zone.appendChild(targetBtnRow);

    defs.forEach((def) => {
      const pickA = document.createElement("button");
      pickA.className = "chip-btn";
      pickA.textContent = `Target ${def.name}`;
      pickA.style.background = `hsl(${def.hue}, 78%, 54%)`;
      pickA.addEventListener("click", () => {
        s.a = def.name;
        updatePrompt();
      });
      wheel.appendChild(pickA);

      const pickB = document.createElement("button");
      pickB.className = "chip-btn";
      pickB.textContent = def.name;
      pickB.style.background = `hsl(${def.hue}, 78%, 54%)`;
      pickB.addEventListener("click", () => {
        s.b = def.name;
        s.rounds += 1;
        if (comp[s.a] === s.b) {
          s.streak += 1;
          result.textContent = `Correct complement! Streak ${s.streak}`;
        } else {
          s.streak = 0;
          result.textContent = `Not opposite on the wheel. ${s.a} pairs with ${comp[s.a]}.`;
        }
      });
      targetBtnRow.appendChild(pickB);
    });

    updatePrompt();
    result.textContent = "Build intuition: switch targets and test quick matches.";
    addCheckButton(wrapper, puzzleId, () => ({ selectedColorA: s.a, selectedColorB: s.b }));
};
