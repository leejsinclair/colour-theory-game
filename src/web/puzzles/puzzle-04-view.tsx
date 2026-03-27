/**
 * Puzzle 04 – Value & Readability (Silhouette under Blur)
 *
 * Players paint a row of grayscale tone blocks and toggle a blur effect to
 * test whether the silhouette remains readable. Success requires ≥75% tonal
 * contrast between the darkest and lightest blocks. Teaches that a strong
 * value range is essential for clear visual communication even when fine
 * detail is lost.
 */
import React from "react";
import { createRoot } from "react-dom/client";
import { PuzzleActionButton } from "./muiPuzzleControls";
import { PuzzleRenderDeps, PuzzleRenderer } from "./types";

type Puzzle04State = {
  tones: number[];
  blur: boolean;
};

type Puzzle04ViewProps = {
  persistedState: Puzzle04State;
};

function Puzzle04View({ persistedState }: Puzzle04ViewProps): React.ReactElement {
  const [localState, setLocalState] = React.useState<Puzzle04State>({
    tones: [...persistedState.tones],
    blur: persistedState.blur,
  });

  const updateState = (updater: (prev: Puzzle04State) => Puzzle04State): void => {
    setLocalState((prev) => {
      const next = updater(prev);
      persistedState.tones = [...next.tones];
      persistedState.blur = next.blur;
      return next;
    });
  };

  const min = Math.min(...localState.tones);
  const max = Math.max(...localState.tones);
  const readability = (max - min) / 255;

  return (
    <>
      <div className="mini-label">Paint the statue blocks in grayscale so the silhouette stays readable under blur.</div>

      <div className="value-block-row">
        {localState.tones.map((tone, idx) => (
          <button
            key={idx}
            className="value-block"
            style={{ background: `rgb(${tone}, ${tone}, ${tone})` }}
            title={`Tone ${idx + 1}: ${tone}`}
            onClick={() => {
              updateState((prev) => {
                const tones = [...prev.tones];
                tones[idx] = (tones[idx] + 32) % 256;
                return { ...prev, tones };
              });
            }}
          />
        ))}
      </div>

      <div className="blur-preview" style={{ filter: localState.blur ? "blur(4px)" : "none" }}>
        {localState.tones.map((tone, idx) => (
          <div key={idx} className="blur-stripe" style={{ background: `rgb(${tone}, ${tone}, ${tone})` }} />
        ))}
      </div>

      <PuzzleActionButton onClick={() => updateState((prev) => ({ ...prev, blur: !prev.blur }))}>
        Toggle Squint Blur
      </PuzzleActionButton>

      <div className="mini-label">Blur readability: {(readability * 100).toFixed(0)}% (target {'>='} 75%)</div>
    </>
  );
}

export const renderPuzzle04: PuzzleRenderer = (deps: PuzzleRenderDeps) => {
  const {
    zone,
    wrapper,
    puzzleId,
    ensureState,
    addCheckButton,
  } = deps;

  const state = ensureState<Puzzle04State>(puzzleId, { tones: [30, 220, 40, 210, 50, 200], blur: true });

  createRoot(zone).render(<Puzzle04View persistedState={state} />);

  addCheckButton(wrapper, puzzleId, () => {
      const min = Math.min(...state.tones);
      const max = Math.max(...state.tones);
      return { usesOnlyBlackAndWhite: true, blurReadability: (max - min) / 255 };
    });
};
