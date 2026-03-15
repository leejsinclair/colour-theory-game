import React from "react";
import { createRoot } from "react-dom/client";
import { PuzzleRenderDeps, PuzzleRenderer } from "./types";

type MoodOption = {
  mood: string;
  label: string;
  correctId: string;
  palettes: Array<{ id: string; swatches: string[] }>;
};

type Puzzle09State = {
  selections: Record<string, string>;
};

type Puzzle09ViewProps = {
  persistedState: Puzzle09State;
};

const MOOD_OPTIONS: MoodOption[] = [
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

function Puzzle09View({ persistedState }: Puzzle09ViewProps): React.ReactElement {
  const [selections, setSelections] = React.useState<Record<string, string>>({ ...persistedState.selections });

  const pickPalette = (mood: string, paletteId: string): void => {
    setSelections((prev) => {
      const next = { ...prev, [mood]: prev[mood] === paletteId ? "" : paletteId };
      persistedState.selections = next;
      return next;
    });
  };

  const matched = MOOD_OPTIONS.filter((m) => selections[m.mood] === m.correctId).length;

  return (
    <>
      <div className="mini-label">Click the palette that best fits each mood.</div>

      {MOOD_OPTIONS.map((moodDef) => (
        <div key={moodDef.mood} className="mood-match-card">
          <div className="mood-match-title">{moodDef.label}</div>
          <div className="mood-match-options">
            {moodDef.palettes.map((pal) => (
              <button
                key={`${moodDef.mood}-${pal.id}`}
                className={`tod-palette-btn${selections[moodDef.mood] === pal.id ? " --selected" : ""}`}
                aria-label={`Select palette for ${moodDef.label}`}
                onClick={() => pickPalette(moodDef.mood, pal.id)}
              >
                <div className="tod-swatch-row">
                  {pal.swatches.map((color) => (
                    <div key={color} className="tod-swatch" style={{ background: color }} />
                  ))}
                </div>
              </button>
            ))}
          </div>
        </div>
      ))}

      <div className="mini-label">
        {matched === MOOD_OPTIONS.length ? "All palettes matched! ✓" : `${matched} of ${MOOD_OPTIONS.length} matched.`}
      </div>
    </>
  );
}

export const renderPuzzle09: PuzzleRenderer = (deps: PuzzleRenderDeps) => {
  const {
    zone,
    wrapper,
    puzzleId,
    ensureState,
    addCheckButton,
  } = deps;

  const state = ensureState<Puzzle09State>(puzzleId, { selections: {} });

  createRoot(zone).render(<Puzzle09View persistedState={state} />);

  addCheckButton(wrapper, puzzleId, () => ({ selections: state.selections }));
};
