/**
 * Puzzle 06 – Chroma Peaks by Hue
 *
 * Players explore branching nodes of increasing saturation for red, green and
 * blue. Each hue peaks at a different level (red 4, green 2, blue 3), teaching
 * that hues have different inherent chroma ceilings.
 */
import { useState, type ReactElement } from "react";
import type { PuzzleComponentProps } from "./types";

type Hue = "red" | "green" | "blue";

export type Puzzle06Input = {
  exploredHues: Hue[];
  discoveredDifferentChromaPeaks: boolean;
};

const hues: Hue[] = ["red", "green", "blue"];
const PEAK_BY_HUE: Record<Hue, number> = { red: 4, green: 2, blue: 3 };

function hueDegrees(hue: Hue): number {
  return hue === "red" ? 0 : hue === "green" ? 120 : 220;
}

export default function Puzzle06View({
  onChange,
  disabled,
}: PuzzleComponentProps<Puzzle06Input>): ReactElement {
  const [visited, setVisited] = useState<Record<string, boolean>>({});
  const [foundPeak, setFoundPeak] = useState<Record<Hue, boolean>>({
    red: false,
    green: false,
    blue: false,
  });

  const emit = (nextVisited: Record<string, boolean>, nextFound: Record<Hue, boolean>): void => {
    const exploredHues = hues.filter((hue) =>
      Object.keys(nextVisited).some((key) => key.startsWith(`${hue}-`)),
    );
    onChange({
      exploredHues,
      discoveredDifferentChromaPeaks: hues.every((hue) => nextFound[hue]),
    });
  };

  const foundCount = Object.values(foundPeak).filter(Boolean).length;

  return (
    <>
      <div className="mini-label">Explore hue branches and find each hue&apos;s max chroma node. Peaks differ by hue.</div>

      <div className="chroma-tree">
        {hues.map((hue) => (
          <div key={hue} className="chroma-branch">
            <div className="mini-label">{hue.toUpperCase()} branch</div>
            <div className="chroma-nodes">
              {Array.from({ length: 5 }, (_, level) => {
                const key = `${hue}-${level}`;
                const sat = 25 + level * 15;
                const isVisited = visited[key];
                const isPeak = PEAK_BY_HUE[hue] === level;
                return (
                  <button
                    key={key}
                    type="button"
                    className={`chroma-node${isVisited ? " visited" : ""}${foundPeak[hue] && isPeak ? " peak" : ""}`}
                    style={{ background: `hsl(${hueDegrees(hue)}, ${sat}%, 50%)` }}
                    aria-label={`${hue} chroma level ${level + 1}${isPeak ? " (peak)" : ""}${isVisited ? " (visited)" : ""}`}
                    aria-pressed={isVisited}
                    disabled={disabled}
                    onClick={() => {
                      const nextVisited = { ...visited, [key]: true };
                      const nextFound = { ...foundPeak };
                      if (isPeak) {
                        nextFound[hue] = true;
                      }
                      setVisited(nextVisited);
                      setFoundPeak(nextFound);
                      emit(nextVisited, nextFound);
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
