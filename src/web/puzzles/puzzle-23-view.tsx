import React from "react";
import { createRoot } from "react-dom/client";
import { PuzzleActionButton } from "./muiPuzzleControls";
import { PUZZLE23_ROUNDS } from "./puzzle-23-data";
import { PuzzleRenderDeps, PuzzleRenderer } from "./types";

type Puzzle23State = {
  selectedIndices: Array<number | null>;
  checked: boolean;
};

type CheckRef = {
  onChecked: () => void;
};

type ShiftRevealPanelProps = {
  warmColor: string;
  neutralColor: string;
  coolColor: string;
  roundTitle: string;
};

function ShiftRevealPanel({ warmColor, neutralColor, coolColor, roundTitle }: ShiftRevealPanelProps): React.ReactElement {
  const swatchStyle = (color: string): React.CSSProperties => ({
    width: "52px",
    height: "52px",
    borderRadius: "14px",
    background: color,
    border: "1px solid rgba(15, 23, 42, 0.14)",
    flexShrink: 0,
  });
  return (
    <div style={{ marginTop: "12px", padding: "14px", borderRadius: "14px", background: "#f3f4f6", border: "1px solid rgba(31, 32, 48, 0.1)" }}>
      <div style={{ fontWeight: 700, fontSize: "12px", marginBottom: "10px" }}>Shift analysis — {roundTitle}</div>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
        <div style={{ textAlign: "center" }}>
          <div style={swatchStyle(warmColor)} />
          <div style={{ fontSize: "10px", marginTop: "4px", opacity: 0.65 }}>Warm cast</div>
        </div>
        <div style={{ fontSize: "18px", opacity: 0.4 }}>→</div>
        <div style={{ textAlign: "center" }}>
          <div style={{ ...swatchStyle(neutralColor), border: "2px solid #0f766e" }} />
          <div style={{ fontSize: "10px", marginTop: "4px", fontWeight: 700 }}>Surface colour</div>
        </div>
        <div style={{ fontSize: "18px", opacity: 0.4 }}>→</div>
        <div style={{ textAlign: "center" }}>
          <div style={swatchStyle(coolColor)} />
          <div style={{ fontSize: "10px", marginTop: "4px", opacity: 0.65 }}>Cool cast</div>
        </div>
      </div>
      <div style={{ fontSize: "11px", marginTop: "10px", opacity: 0.72 }}>
        Your visual system compensates for the warm and cool casts, partially recovering the neutral surface colour.
      </div>
    </div>
  );
}

type Puzzle23ViewProps = {
  persistedState: Puzzle23State;
  checkRef: CheckRef;
};

function Puzzle23View({ persistedState, checkRef }: Puzzle23ViewProps): React.ReactElement {
  const [local, setLocal] = React.useState<Puzzle23State>({
    selectedIndices: [...persistedState.selectedIndices],
    checked: persistedState.checked,
  });
  const [activeRoundIndex, setActiveRoundIndex] = React.useState(0);
  const [neutralFlash, setNeutralFlash] = React.useState(false);
  const [showReveal, setShowReveal] = React.useState(false);

  React.useEffect(() => {
    checkRef.onChecked = () => {
      persistedState.checked = true;
      setLocal((prev) => ({ ...prev, checked: true }));
    };
    return () => {
      checkRef.onChecked = () => {};
    };
  }, [checkRef, persistedState]);

  React.useEffect(() => {
    if (!neutralFlash) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => setNeutralFlash(false), 1200);
    return () => window.clearTimeout(timeoutId);
  }, [neutralFlash]);

  const update = (updater: (prev: Puzzle23State) => Puzzle23State): void => {
    setLocal((prev) => {
      const next = updater(prev);
      persistedState.selectedIndices = [...next.selectedIndices];
      persistedState.checked = next.checked;
      return next;
    });
  };

  const currentRound = PUZZLE23_ROUNDS[activeRoundIndex];
  const completedRounds = local.selectedIndices.filter((value) => value !== null).length;
  const readyToCheck = completedRounds === PUZZLE23_ROUNDS.length;

  return (
    <>
      <div className="mini-label" style={{ marginBottom: "10px" }}>
        Compare the same object across warm, cool, and neutral light. Choose one swatch for each round, then press Check.
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "10px" }}>
        {PUZZLE23_ROUNDS.map((round, roundIndex) => {
          const isActive = roundIndex === activeRoundIndex;
          const selected = local.selectedIndices[roundIndex] !== null;
          return (
            <button
              key={round.id}
              className={`tod-palette-btn${isActive ? " --selected" : ""}`}
              aria-pressed={isActive}
              onClick={() => setActiveRoundIndex(roundIndex)}
              style={{ padding: "8px 12px", minWidth: "132px", textAlign: "left" }}
            >
              <div style={{ fontWeight: 700, fontSize: "12px" }}>{round.title}</div>
              <div style={{ fontSize: "11px", opacity: 0.74 }}>{selected ? "Selection ready" : "Pending selection"}</div>
            </button>
          );
        })}
      </div>

      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "10px" }}>
        <PuzzleActionButton onClick={() => setNeutralFlash(true)}>Neutral flash</PuzzleActionButton>
        {local.checked && (
          <PuzzleActionButton onClick={() => setShowReveal((prev) => !prev)}>
            {showReveal ? "Hide shift analysis" : "Show shift analysis"}
          </PuzzleActionButton>
        )}
      </div>

      <div className="mini-label" style={{ marginBottom: "8px" }}>
        {currentRound.difficulty} {currentRound.hint}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "10px", marginBottom: "12px" }}>
        {Object.values(currentRound.panels).map((panel) => {
          const highlightNeutral = panel.name === "Neutral Light" && neutralFlash;
          return (
            <div
              key={panel.name}
              style={{
                borderRadius: "14px",
                padding: "12px",
                background: panel.background,
                border: highlightNeutral ? "2px solid #0f766e" : "1px solid rgba(31, 32, 48, 0.12)",
                boxShadow: highlightNeutral ? "0 0 0 3px rgba(15, 118, 110, 0.18)" : "none",
              }}
            >
              <div style={{ fontWeight: 700, fontSize: "12px", marginBottom: "2px" }}>{panel.name}</div>
              <div style={{ fontSize: "11px", opacity: 0.72, marginBottom: "12px" }}>{panel.caption}</div>
              <div
                aria-hidden="true"
                style={{
                  height: "104px",
                  borderRadius: "12px",
                  background: "rgba(255,255,255,0.16)",
                  display: "grid",
                  placeItems: "center",
                }}
              >
                <div
                  style={{
                    width: "56px",
                    height: "56px",
                    borderRadius: "18px",
                    background: panel.objectColor,
                    boxShadow: `0 10px 24px ${panel.glow}`,
                    border: "1px solid rgba(15, 23, 42, 0.18)",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div role="group" aria-label={`${currentRound.title} surface colour options`} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: "8px", marginBottom: "10px" }}>
        {currentRound.options.map((option, optionIndex) => {
          const selected = local.selectedIndices[activeRoundIndex] === optionIndex;
          return (
            <button
              key={`${currentRound.id}-${option.label}`}
              aria-pressed={selected}
              aria-label={`Choose ${option.label} for ${currentRound.title}`}
              onClick={() => update((prev) => {
                const nextSelections = [...prev.selectedIndices];
                nextSelections[activeRoundIndex] = optionIndex;
                return { ...prev, selectedIndices: nextSelections };
              })}
              style={{
                borderRadius: "12px",
                border: selected ? "2px solid #0f766e" : "1px solid rgba(31, 32, 48, 0.14)",
                background: selected ? "rgba(15, 118, 110, 0.08)" : "#ffffff",
                padding: "10px",
                textAlign: "left",
              }}
            >
              <div
                aria-hidden="true"
                style={{
                  height: "40px",
                  borderRadius: "9px",
                  background: option.swatch,
                  border: "1px solid rgba(15, 23, 42, 0.12)",
                  marginBottom: "8px",
                }}
              />
              <div style={{ fontWeight: 700, fontSize: "12px" }}>{selected ? "Selected" : "Choose swatch"}</div>
              <div style={{ fontSize: "11px", opacity: 0.72 }}>{option.label}</div>
            </button>
          );
        })}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
        <div className="mini-label" aria-live="polite">
          {completedRounds}/{PUZZLE23_ROUNDS.length} rounds selected{readyToCheck ? " — ready to check." : "."}
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <PuzzleActionButton onClick={() => setActiveRoundIndex((prev) => Math.max(0, prev - 1))} disabled={activeRoundIndex === 0}>
            Previous round
          </PuzzleActionButton>
          <PuzzleActionButton
            onClick={() => setActiveRoundIndex((prev) => Math.min(PUZZLE23_ROUNDS.length - 1, prev + 1))}
            disabled={activeRoundIndex === PUZZLE23_ROUNDS.length - 1}
          >
            Next round
          </PuzzleActionButton>
        </div>
      </div>

      {showReveal && local.checked && (
        <ShiftRevealPanel
          warmColor={currentRound.panels.warm.objectColor}
          neutralColor={currentRound.panels.neutral.objectColor}
          coolColor={currentRound.panels.cool.objectColor}
          roundTitle={currentRound.title}
        />
      )}
    </>
  );
}

export const renderPuzzle23: PuzzleRenderer = (deps: PuzzleRenderDeps) => {
  const { zone, wrapper, puzzleId, ensureState, addCheckButton } = deps;

  const state = ensureState<Puzzle23State>(puzzleId, {
    selectedIndices: Array.from({ length: PUZZLE23_ROUNDS.length }, () => null),
    checked: false,
  });

  const checkRef: CheckRef = { onChecked: () => {} };

  createRoot(zone).render(<Puzzle23View persistedState={state} checkRef={checkRef} />);

  addCheckButton(wrapper, puzzleId, () => {
    checkRef.onChecked();
    return { selectedIndices: state.selectedIndices };
  });
};