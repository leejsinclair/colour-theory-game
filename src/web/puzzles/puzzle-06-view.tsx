/**
 * Puzzle 06 – Chroma Peaks by Hue
 *
 * Players explore a branching tree of nodes with increasing saturation levels
 * for red, green, and blue hues. Each hue reaches maximum vividness at a
 * different saturation level (red peaks at level 4, green at 2, blue at 3).
 * Teaches that hues have different inherent chroma ceilings and do not all
 * reach peak saturation at the same point.
 */
import React from "react";
import { createRoot } from "react-dom/client";
import { PuzzleRenderDeps, PuzzleRenderer } from "./types";

type Hue = "red" | "green" | "blue";

type Puzzle06State = {
  visited: Record<string, boolean>;
  peakByHue: Record<Hue, number>;
  foundPeak: Record<Hue, boolean>;
};

type Puzzle06ViewProps = {
  persistedState: Puzzle06State;
};

const hues: Hue[] = ["red", "green", "blue"];

function hueDegrees(hue: Hue): number {
  if (hue === "red") {
    return 0;
  }
  if (hue === "green") {
    return 120;
  }
  return 220;
}

function Puzzle06View({ persistedState }: Puzzle06ViewProps): React.ReactElement {
  const [localState, setLocalState] = React.useState<Puzzle06State>({
    visited: { ...persistedState.visited },
    peakByHue: { ...persistedState.peakByHue },
    foundPeak: { ...persistedState.foundPeak },
  });

  const updateState = (updater: (prev: Puzzle06State) => Puzzle06State): void => {
    setLocalState((prev) => {
      const next = updater(prev);
      persistedState.visited = { ...next.visited };
      persistedState.peakByHue = { ...next.peakByHue };
      persistedState.foundPeak = { ...next.foundPeak };
      return next;
    });
  };

  const foundCount = Object.values(localState.foundPeak).filter(Boolean).length;

  return (
    <>
      <div className="mini-label">Explore hue branches and find each hue&apos;s max chroma node. Peaks differ by hue.</div>

      <div className="chroma-tree">
        {hues.map((hue) => (
          <div key={hue} className="chroma-branch">
            <div className="mini-label">{hue.toUpperCase()} branch</div>
            <div className="chroma-nodes">
              {Array.from({ length: 5 }, (_, value) => {
                const key = `${hue}-${value}`;
                const sat = 25 + value * 15;
                const visited = localState.visited[key];
                const isPeak = localState.peakByHue[hue] === value;
                return (
                  <button
                    key={key}
                    className={`chroma-node${visited ? " visited" : ""}${localState.foundPeak[hue] && isPeak ? " peak" : ""}`}
                    style={{ background: `hsl(${hueDegrees(hue)}, ${sat}%, 50%)` }}
                    title={`${hue} chroma level ${value + 1} — saturation ${sat}%`}
                    aria-label={`${hue} chroma level ${value + 1}${isPeak ? " (peak)" : ""}${visited ? " (visited)" : ""}`}
                    aria-pressed={visited}
                    onClick={() => {
                      updateState((prev) => {
                        const nextVisited = { ...prev.visited, [key]: true };
                        const nextFound = { ...prev.foundPeak };
                        if (prev.peakByHue[hue] === value) {
                          nextFound[hue] = true;
                        }
                        return {
                          ...prev,
                          visited: nextVisited,
                          foundPeak: nextFound,
                        };
                      });
                    }}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mini-label" aria-live="polite" aria-atomic="true">
        Peaks found: {foundCount}/3
        {foundCount < 3 && " — each hue reaches its most vivid colour at a different level"}
      </div>
    </>
  );
}

export const renderPuzzle06: PuzzleRenderer = (deps: PuzzleRenderDeps) => {
  const {
    zone,
    wrapper,
    puzzleId,
    ensureState,
    addCheckButton,
  } = deps;

  const state = ensureState<Puzzle06State>(puzzleId, {
    visited: {},
    peakByHue: { red: 4, green: 2, blue: 3 },
    foundPeak: { red: false, green: false, blue: false },
  });

  createRoot(zone).render(<Puzzle06View persistedState={state} />);

  addCheckButton(wrapper, puzzleId, () => ({
    exploredHues: hues.filter((hue) => Object.keys(state.visited).some((k) => k.startsWith(`${hue}-`))),
    discoveredDifferentChromaPeaks: Object.values(state.foundPeak).every(Boolean),
  }));
};
