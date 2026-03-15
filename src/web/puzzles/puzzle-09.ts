import { PuzzleRenderDeps, PuzzleRenderer } from "./types";

export const renderPuzzle09: PuzzleRenderer = (deps: PuzzleRenderDeps) => {
  const {
    zone,
    wrapper,
    puzzleId,
    ensureState,
    addCheckButton,
  } = deps;

    // ── Colour Mood Match ─────────────────────────────────────────────────
    const MOOD_OPTIONS: Array<{
      mood: string;
      label: string;
      correctId: string;
      palettes: Array<{ id: string; swatches: string[] }>;
    }> = [
      {
        mood: "joyful carnival",
        label: "Joyful Carnival",
        correctId: "C",
        palettes: [
          { id: "A", swatches: ["#7EC8C8", "#5BA8C4", "#A8D4E0", "#6BB8C8", "#90C8D4"] },
          { id: "B", swatches: ["#1C2B1C", "#2D3E1A", "#3A4428", "#1A2416", "#263620"] },
          { id: "C", swatches: ["#FF3D6A", "#FFD700", "#FF6B35", "#FF1493", "#FFAA00"] },
          { id: "D", swatches: ["#C4B2BC", "#B8AABE", "#BCAACC", "#B4A8C8", "#BAB0CA"] },
        ],
      },
      {
        mood: "calm ocean",
        label: "Calm Ocean",
        correctId: "A",
        palettes: [
          { id: "A", swatches: ["#7EC8C8", "#5BA8C4", "#A8D4E0", "#6BB8C8", "#90C8D4"] },
          { id: "B", swatches: ["#FF5730", "#FF8C00", "#FFA500", "#FF6347", "#FF4500"] },
          { id: "C", swatches: ["#1C2B1C", "#2D3E1A", "#3A4428", "#1A2416", "#263620"] },
          { id: "D", swatches: ["#90EE90", "#3CB371", "#20B2AA", "#32D678", "#2ECC71"] },
        ],
      },
      {
        mood: "creepy dungeon",
        label: "Creepy Dungeon",
        correctId: "B",
        palettes: [
          { id: "A", swatches: ["#FFB6C1", "#FFC0CB", "#F9A8C8", "#FFD4E0", "#F5B8D0"] },
          { id: "B", swatches: ["#1C2B1C", "#2D3E1A", "#3A4428", "#1A2416", "#263620"] },
          { id: "C", swatches: ["#87CEEB", "#B0D4F0", "#98D4F8", "#A8DCF8", "#7EC8E8"] },
          { id: "D", swatches: ["#FF6B35", "#FF9F1C", "#FFBF69", "#FF7043", "#FF8C42"] },
        ],
      },
    ];

    const s = ensureState(puzzleId, { selections: {} as Record<string, string> });

    const intro = document.createElement("div");
    intro.className = "mini-label";
    intro.textContent = "Click the palette that best fits each mood.";
    zone.appendChild(intro);

    const feedbackEl = document.createElement("div");
    feedbackEl.className = "mini-label";

    const updateFeedback = (): void => {
      const matched = MOOD_OPTIONS.filter((m) => s.selections[m.mood] === m.correctId).length;
      feedbackEl.textContent =
        matched === MOOD_OPTIONS.length
          ? "All palettes matched! ✓"
          : `${matched} of ${MOOD_OPTIONS.length} matched.`;
    };

    MOOD_OPTIONS.forEach((moodDef) => {
      const card = document.createElement("div");
      card.className = "mood-match-card";

      const title = document.createElement("div");
      title.className = "mood-match-title";
      title.textContent = moodDef.label;
      card.appendChild(title);

      const optionRow = document.createElement("div");
      optionRow.className = "mood-match-options";

      const palBtns: HTMLButtonElement[] = [];

      moodDef.palettes.forEach((pal) => {
        const btn = document.createElement("button");
        btn.className = "tod-palette-btn";
        btn.setAttribute("aria-label", `Select palette for ${moodDef.label}`);
        if (s.selections[moodDef.mood] === pal.id) {
          btn.classList.add("--selected");
        }

        const swRow = document.createElement("div");
        swRow.className = "tod-swatch-row";
        pal.swatches.forEach((color) => {
          const sw = document.createElement("div");
          sw.className = "tod-swatch";
          sw.style.background = color;
          swRow.appendChild(sw);
        });
        btn.appendChild(swRow);

        btn.addEventListener("click", () => {
          s.selections[moodDef.mood] = s.selections[moodDef.mood] === pal.id ? "" : pal.id;
          palBtns.forEach((b, i) => {
            b.classList.toggle("--selected", moodDef.palettes[i].id === s.selections[moodDef.mood]);
          });
          updateFeedback();
        });

        palBtns.push(btn);
        optionRow.appendChild(btn);
      });

      card.appendChild(optionRow);
      zone.appendChild(card);
    });

    zone.appendChild(feedbackEl);
    updateFeedback();

    addCheckButton(wrapper, puzzleId, () => ({ selections: s.selections }));
};
