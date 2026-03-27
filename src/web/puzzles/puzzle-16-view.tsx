/**
 * Puzzle 16 – Pigment Bias & Clean Green Mixing
 *
 * Players choose one yellow and one blue pigment from a palette of ten each.
 * Yellows range from clean hansa yellow to warm/red-biased yellow ochre; blues
 * from clean phthalo blue to purple-biased french ultramarine. A mud level is
 * calculated from each pigment's bias; only the least-biased pair from each
 * row produces a vibrant green. Teaches how pigment colour bias contaminates
 * mixes and why choosing bias-compatible pigments matters.
 */
import React from "react";
import { createRoot } from "react-dom/client";
import { PuzzleRenderDeps, PuzzleRenderer } from "./types";

type PigmentFamily = "yellow" | "blue";

type PigmentMeta = {
  hue: number;
  saturation: number;
  family: PigmentFamily;
  // 0 = pure, 1 = heavily biased toward red or purple
  biasMagnitude: number;
  biasKind: "red" | "purple" | "none";
  greenStrength: number;
};

// 10 yellows — ordered cleanest to most contaminated.
// Odd indices lean red, even indices lean purple so the rows alternate.
const yellows: Array<[string, PigmentMeta]> = [
  ["hansa yellow",              { hue: 58,  saturation: 88, family: "yellow", biasMagnitude: 0.00, biasKind: "none",   greenStrength: 0.94 }],
  ["cadmium lemon",             { hue: 64,  saturation: 84, family: "yellow", biasMagnitude: 0.06, biasKind: "none",   greenStrength: 0.88 }],
  ["nickel azo yellow",         { hue: 50,  saturation: 80, family: "yellow", biasMagnitude: 0.12, biasKind: "red",    greenStrength: 0.82 }],
  ["bismuth vanadate yellow",   { hue: 54,  saturation: 90, family: "yellow", biasMagnitude: 0.14, biasKind: "purple", greenStrength: 0.80 }],
  ["indian yellow",             { hue: 44,  saturation: 82, family: "yellow", biasMagnitude: 0.22, biasKind: "red",    greenStrength: 0.73 }],
  ["aureolin",                  { hue: 48,  saturation: 78, family: "yellow", biasMagnitude: 0.24, biasKind: "purple", greenStrength: 0.71 }],
  ["cadmium yellow medium",     { hue: 40,  saturation: 92, family: "yellow", biasMagnitude: 0.34, biasKind: "red",    greenStrength: 0.60 }],
  ["naples yellow",             { hue: 38,  saturation: 60, family: "yellow", biasMagnitude: 0.40, biasKind: "purple", greenStrength: 0.54 }],
  ["raw sienna",                { hue: 30,  saturation: 68, family: "yellow", biasMagnitude: 0.58, biasKind: "red",    greenStrength: 0.36 }],
  ["yellow ochre",              { hue: 34,  saturation: 56, family: "yellow", biasMagnitude: 0.65, biasKind: "purple", greenStrength: 0.28 }],
];

// 10 blues — ordered cleanest to most contaminated.
const blues: Array<[string, PigmentMeta]> = [
  ["phthalo blue",              { hue: 206, saturation: 90, family: "blue",   biasMagnitude: 0.00, biasKind: "none",   greenStrength: 0.95 }],
  ["cerulean blue",             { hue: 198, saturation: 80, family: "blue",   biasMagnitude: 0.06, biasKind: "none",   greenStrength: 0.89 }],
  ["cobalt teal",               { hue: 190, saturation: 76, family: "blue",   biasMagnitude: 0.10, biasKind: "none",   greenStrength: 0.85 }],
  ["manganese blue",            { hue: 212, saturation: 72, family: "blue",   biasMagnitude: 0.14, biasKind: "purple", greenStrength: 0.80 }],
  ["cobalt blue",               { hue: 218, saturation: 78, family: "blue",   biasMagnitude: 0.20, biasKind: "purple", greenStrength: 0.74 }],
  ["ultramarine",               { hue: 228, saturation: 82, family: "blue",   biasMagnitude: 0.28, biasKind: "purple", greenStrength: 0.67 }],
  ["prussian blue",             { hue: 220, saturation: 70, family: "blue",   biasMagnitude: 0.34, biasKind: "red",    greenStrength: 0.58 }],
  ["indanthrone blue",          { hue: 240, saturation: 66, family: "blue",   biasMagnitude: 0.44, biasKind: "purple", greenStrength: 0.47 }],
  ["phthalo blue red shade",    { hue: 246, saturation: 74, family: "blue",   biasMagnitude: 0.54, biasKind: "red",    greenStrength: 0.36 }],
  ["french ultramarine",        { hue: 252, saturation: 78, family: "blue",   biasMagnitude: 0.62, biasKind: "purple", greenStrength: 0.26 }],
];

type PigmentName = string;

const pigmentMeta: Map<PigmentName, PigmentMeta> = new Map([...yellows, ...blues]);

const yellowNames = yellows.map(([name]) => name);
const blueNames   = blues.map(([name]) => name);
const vibrantMudThreshold = 0.16;
const workableMudThreshold = 0.30;

type Puzzle16State = {
  selectedPigments: PigmentName[];
};

type Puzzle16ViewProps = {
  persistedState: Puzzle16State;
};

function computeMudLevel(state: Puzzle16State): number {
  const [a, b] = state.selectedPigments;

  if (!a || !b) {
    return 1;
  }

  const first = pigmentMeta.get(a);
  const second = pigmentMeta.get(b);

  if (!first || !second) {
    return 1;
  }

  // Same-family pairs cannot make green at all
  if (first.family === second.family) {
    return 1;
  }

  // Mud is driven entirely by the pigments' inherent green strength and bias
  const avgGreenStrength = (first.greenStrength + second.greenStrength) / 2;
  const avgBias          = (first.biasMagnitude  + second.biasMagnitude)  / 2;

  return Math.min(1, (1 - avgGreenStrength) * 0.5 + avgBias * 0.25);
}

function isGreenPair(selectedPigments: PigmentName[]): boolean {
  if (selectedPigments.length !== 2) {
    return false;
  }

  const [a, b] = selectedPigments;
  const first = pigmentMeta.get(a);
  const second = pigmentMeta.get(b);

  if (!first || !second) {
    return false;
  }

  return (first.family === "yellow" && second.family === "blue") || (first.family === "blue" && second.family === "yellow");
}

function computeSwatch(state: Puzzle16State): string {
  if (state.selectedPigments.length !== 2) {
    return "#f0ede8";
  }

  const [a, b] = state.selectedPigments;
  const first = pigmentMeta.get(a);
  const second = pigmentMeta.get(b);

  if (!first || !second) {
    return "#f0ede8";
  }

  if (!isGreenPair(state.selectedPigments)) {
    // Show a blend of the two individual pigment hues
    const hue = Math.round((first.hue + second.hue) / 2);
    return `hsl(${hue}, 38%, 36%)`;
  }

  const yellow = first.family === "yellow" ? first : second;
  const blue   = first.family === "blue"   ? first : second;

  // A warm yellow (low hue ~30-35) shifts the mix toward olive.
  // A cool, greenish yellow (high hue ~58-65) keeps the green bright.
  const yellowWarmShift  = (65 - yellow.hue) * 0.55;  // 0 for cadmium lemon → ~19 for yellow ochre

  // A purple-biased blue (high hue ~240-252) pulls the mix away from clean green.
  // A warm, teal-leaning blue (low hue ~190-210) stays closer to vibrant green.
  const bluePurpleShift  = Math.max(0, (blue.hue - 205)) * 0.18;  // 0 for phthalo/cobalt teal → ~8 for french ultramarine

  const hue        = Math.round(125 - yellowWarmShift - bluePurpleShift);
  const avgGS      = (first.greenStrength + second.greenStrength) / 2;
  const saturation = Math.max(10, Math.round(40 + avgGS * 45));
  const lightness  = Math.max(24, Math.round(40 - (1 - avgGS) * 10));

  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

function Puzzle16View({ persistedState }: Puzzle16ViewProps): React.ReactElement {
  const [localState, setLocalState] = React.useState<Puzzle16State>({ ...persistedState });

  const updateState = (updater: (prev: Puzzle16State) => Puzzle16State): void => {
    setLocalState((prev) => {
      const next = updater(prev);
      Object.assign(persistedState, next);
      return next;
    });
  };

  const mud = computeMudLevel(localState);
  const greenPair = isGreenPair(localState.selectedPigments);
  const selectionComplete = localState.selectedPigments.length === 2;

  const togglePigment = (pigment: PigmentName): void => {
    updateState((prev) => {
      const currentlySelected = prev.selectedPigments;
      const nextMeta = pigmentMeta.get(pigment);

      if (!nextMeta) {
        return prev;
      }

      if (currentlySelected.includes(pigment)) {
        return {
          ...prev,
          selectedPigments: currentlySelected.filter((name) => name !== pigment),
        };
      }

      const preservedOtherFamily = currentlySelected.filter((name) => {
        const meta = pigmentMeta.get(name);
        return meta != null && meta.family !== nextMeta.family;
      });

      return {
        ...prev,
        selectedPigments: [...preservedOtherFamily, pigment],
      };
    });
  };

  const swatch = computeSwatch(localState);
  let label = "Choose one yellow and one blue pigment.";
  let coaching = "Hover a swatch to see its name. Pigments on the left of each row mix cleanest.";

  if (selectionComplete && greenPair && mud <= vibrantMudThreshold) {
    label = "Vibrant green achieved! ✓";
    coaching = "Both pigments have strong green affinity — minimal colour bias in this pair.";
  } else if (selectionComplete && greenPair && mud <= workableMudThreshold) {
    label = "Green is forming, but getting muddy.";
    coaching = "One or both pigments carries a warm or purple bias. Try a pigment from the left end of its row.";
  } else if (selectionComplete && greenPair) {
    label = "Muddy olive — strong bias in both pigments.";
    coaching = "Both pigments lean too warm or purple. Choose closer to the left end of each row.";
  } else if (selectionComplete) {
    label = "This pair will not make green.";
    coaching = "You need one from the yellows row and one from the blues row.";
  }

  const selectedText = localState.selectedPigments.length > 0
    ? localState.selectedPigments.join(" + ")
    : "none";

  const renderSwatchRow = (names: string[], familyLabel: string): React.ReactElement => (
    <div className="p16-swatch-group">
      <div className="mini-label">{familyLabel}</div>
      <div className="p16-swatch-row">
        {names.map((name) => {
          const meta = pigmentMeta.get(name);
          if (!meta) return null;
          const selected = localState.selectedPigments.includes(name);
          return (
            <button
              key={name}
              type="button"
              title={name}
              aria-label={name}
              className={`p16-swatch${selected ? " p16-swatch--selected" : ""}`}
              style={{
                background: `hsl(${meta.hue}, ${meta.saturation}%, 52%)`,
              }}
              onClick={() => togglePigment(name)}
            />
          );
        })}
      </div>
    </div>
  );

  return (
    <>
      <div className="mini-label">Pick 2 pigments — one yellow, one blue: {localState.selectedPigments.length}/2</div>
      {renderSwatchRow(yellowNames, "Yellows (left = clean, right = warm/red bias)")}
      {renderSwatchRow(blueNames,  "Blues (left = clean, right = purple/red bias)")}
      <div className="mini-label">Selected: {selectedText}</div>

      <div className="color-preview-row">
        <div className="color-preview-swatch" style={{ background: swatch }} />
        <div className="color-preview-label">{label}</div>
      </div>

      <div className="mini-label">{coaching}</div>
    </>
  );
}

export const renderPuzzle16: PuzzleRenderer = (deps: PuzzleRenderDeps) => {
  const {
    zone,
    wrapper,
    puzzleId,
    ensureState,
    addCheckButton,
  } = deps;

  const state = ensureState<Puzzle16State>(puzzleId, {
    selectedPigments: [],
  });

  createRoot(zone).render(<Puzzle16View persistedState={state} />);

  addCheckButton(wrapper, puzzleId, () => ({
    pigments: state.selectedPigments,
    mudLevel: computeMudLevel(state),
  }));
};
