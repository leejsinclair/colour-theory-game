/**
 * Puzzle 16 – Pigment Bias & Clean Green Mixing
 *
 * Players pick one yellow and one blue pigment. Each pigment's colour bias
 * feeds a mud level; only the least-biased pair from each row makes a vibrant
 * green.
 */
import type { ReactElement } from "react";
import type { PuzzleComponentProps } from "./types";

type PigmentFamily = "yellow" | "blue";

type PigmentMeta = {
  hue: number;
  saturation: number;
  family: PigmentFamily;
  biasMagnitude: number;
  biasKind: "red" | "purple" | "none";
  greenStrength: number;
};

const yellows: Array<[string, PigmentMeta]> = [
  ["hansa yellow", { hue: 58, saturation: 88, family: "yellow", biasMagnitude: 0.0, biasKind: "none", greenStrength: 0.94 }],
  ["cadmium lemon", { hue: 64, saturation: 84, family: "yellow", biasMagnitude: 0.06, biasKind: "none", greenStrength: 0.88 }],
  ["nickel azo yellow", { hue: 50, saturation: 80, family: "yellow", biasMagnitude: 0.12, biasKind: "red", greenStrength: 0.82 }],
  ["bismuth vanadate yellow", { hue: 54, saturation: 90, family: "yellow", biasMagnitude: 0.14, biasKind: "purple", greenStrength: 0.8 }],
  ["indian yellow", { hue: 44, saturation: 82, family: "yellow", biasMagnitude: 0.22, biasKind: "red", greenStrength: 0.73 }],
  ["aureolin", { hue: 48, saturation: 78, family: "yellow", biasMagnitude: 0.24, biasKind: "purple", greenStrength: 0.71 }],
  ["cadmium yellow medium", { hue: 40, saturation: 92, family: "yellow", biasMagnitude: 0.34, biasKind: "red", greenStrength: 0.6 }],
  ["naples yellow", { hue: 38, saturation: 60, family: "yellow", biasMagnitude: 0.4, biasKind: "purple", greenStrength: 0.54 }],
  ["raw sienna", { hue: 30, saturation: 68, family: "yellow", biasMagnitude: 0.58, biasKind: "red", greenStrength: 0.36 }],
  ["yellow ochre", { hue: 34, saturation: 56, family: "yellow", biasMagnitude: 0.65, biasKind: "purple", greenStrength: 0.28 }],
];

const blues: Array<[string, PigmentMeta]> = [
  ["phthalo blue", { hue: 206, saturation: 90, family: "blue", biasMagnitude: 0.0, biasKind: "none", greenStrength: 0.95 }],
  ["cerulean blue", { hue: 198, saturation: 80, family: "blue", biasMagnitude: 0.06, biasKind: "none", greenStrength: 0.89 }],
  ["cobalt teal", { hue: 190, saturation: 76, family: "blue", biasMagnitude: 0.1, biasKind: "none", greenStrength: 0.85 }],
  ["manganese blue", { hue: 212, saturation: 72, family: "blue", biasMagnitude: 0.14, biasKind: "purple", greenStrength: 0.8 }],
  ["cobalt blue", { hue: 218, saturation: 78, family: "blue", biasMagnitude: 0.2, biasKind: "purple", greenStrength: 0.74 }],
  ["ultramarine", { hue: 228, saturation: 82, family: "blue", biasMagnitude: 0.28, biasKind: "purple", greenStrength: 0.67 }],
  ["prussian blue", { hue: 220, saturation: 70, family: "blue", biasMagnitude: 0.34, biasKind: "red", greenStrength: 0.58 }],
  ["indanthrone blue", { hue: 240, saturation: 66, family: "blue", biasMagnitude: 0.44, biasKind: "purple", greenStrength: 0.47 }],
  ["phthalo blue red shade", { hue: 246, saturation: 74, family: "blue", biasMagnitude: 0.54, biasKind: "red", greenStrength: 0.36 }],
  ["french ultramarine", { hue: 252, saturation: 78, family: "blue", biasMagnitude: 0.62, biasKind: "purple", greenStrength: 0.26 }],
];

const pigmentMeta = new Map<string, PigmentMeta>([...yellows, ...blues]);
const yellowNames = yellows.map(([name]) => name);
const blueNames = blues.map(([name]) => name);
const vibrantMudThreshold = 0.16;
const workableMudThreshold = 0.3;

export type Puzzle16Input = {
  pigments: string[];
  mudLevel: number;
};

export function computeMudLevel(pigments: string[]): number {
  const [a, b] = pigments;
  if (!a || !b) {
    return 1;
  }
  const first = pigmentMeta.get(a);
  const second = pigmentMeta.get(b);
  if (!first || !second || first.family === second.family) {
    return 1;
  }
  const avgGreenStrength = (first.greenStrength + second.greenStrength) / 2;
  const avgBias = (first.biasMagnitude + second.biasMagnitude) / 2;
  return Math.min(1, (1 - avgGreenStrength) * 0.5 + avgBias * 0.25);
}

function isGreenPair(pigments: string[]): boolean {
  if (pigments.length !== 2) {
    return false;
  }
  const [first, second] = pigments.map((name) => pigmentMeta.get(name));
  if (!first || !second) {
    return false;
  }
  return first.family !== second.family;
}

function computeSwatch(pigments: string[]): string {
  if (pigments.length !== 2) {
    return "#f0ede8";
  }
  const [a, b] = pigments;
  const first = pigmentMeta.get(a);
  const second = pigmentMeta.get(b);
  if (!first || !second) {
    return "#f0ede8";
  }
  if (!isGreenPair(pigments)) {
    return `hsl(${Math.round((first.hue + second.hue) / 2)}, 38%, 36%)`;
  }
  const yellow = first.family === "yellow" ? first : second;
  const blue = first.family === "blue" ? first : second;
  const yellowWarmShift = (65 - yellow.hue) * 0.55;
  const bluePurpleShift = Math.max(0, blue.hue - 205) * 0.18;
  const hue = Math.round(125 - yellowWarmShift - bluePurpleShift);
  const avgGS = (first.greenStrength + second.greenStrength) / 2;
  const saturation = Math.max(10, Math.round(40 + avgGS * 45));
  const lightness = Math.max(24, Math.round(40 - (1 - avgGS) * 10));
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

export default function Puzzle16View({
  value,
  onChange,
  disabled,
}: PuzzleComponentProps<Puzzle16Input>): ReactElement {
  const selected = value.pigments;

  const toggle = (pigment: string): void => {
    const meta = pigmentMeta.get(pigment);
    if (!meta) {
      return;
    }
    let next: string[];
    if (selected.includes(pigment)) {
      next = selected.filter((name) => name !== pigment);
    } else {
      const otherFamily = selected.filter((name) => pigmentMeta.get(name)?.family !== meta.family);
      next = [...otherFamily, pigment];
    }
    onChange({ pigments: next, mudLevel: computeMudLevel(next) });
  };

  const mud = computeMudLevel(selected);
  const greenPair = isGreenPair(selected);
  const complete = selected.length === 2;

  let label = "Choose one yellow and one blue pigment.";
  let coaching = "Pigments at the left of each row mix cleanest.";
  if (complete && greenPair && mud <= vibrantMudThreshold) {
    label = "Vibrant green achieved! ✓";
    coaching = "Both pigments have strong green affinity — minimal colour bias in this pair.";
  } else if (complete && greenPair && mud <= workableMudThreshold) {
    label = "Green is forming, but getting muddy.";
    coaching = "One or both pigments carries a warm or purple bias. Try a pigment further left.";
  } else if (complete && greenPair) {
    label = "Muddy olive — strong bias in both pigments.";
    coaching = "Both pigments lean too warm or purple. Choose closer to the left end of each row.";
  } else if (complete) {
    label = "This pair will not make green.";
    coaching = "You need one from the yellows row and one from the blues row.";
  }

  const row = (names: string[], familyLabel: string): ReactElement => (
    <div className="p16-swatch-group">
      <div className="mini-label">{familyLabel}</div>
      <div className="p16-swatch-row" role="group" aria-label={familyLabel}>
        {names.map((name) => {
          const meta = pigmentMeta.get(name);
          if (!meta) {
            return null;
          }
          const isSelected = selected.includes(name);
          return (
            <button
              key={name}
              type="button"
              aria-label={name}
              aria-pressed={isSelected}
              className={`p16-swatch${isSelected ? " p16-swatch--selected" : ""}`}
              style={{ background: `hsl(${meta.hue}, ${meta.saturation}%, 52%)` }}
              disabled={disabled}
              onClick={() => toggle(name)}
            />
          );
        })}
      </div>
    </div>
  );

  return (
    <>
      <div className="mini-label">Pick 2 pigments — one yellow, one blue: {selected.length}/2</div>
      {row(yellowNames, "Yellows (left = clean, right = warm/red bias)")}
      {row(blueNames, "Blues (left = clean, right = purple/red bias)")}
      <div className="mini-label">Selected: {selected.length > 0 ? selected.join(" + ") : "none"}</div>

      <div className="color-preview-row">
        <div className="color-preview-swatch" role="img" aria-label={label} style={{ background: computeSwatch(selected) }} />
        <div className="color-preview-label" aria-live="polite">{label}</div>
      </div>

      <div className="mini-label">{coaching}</div>
    </>
  );
}
