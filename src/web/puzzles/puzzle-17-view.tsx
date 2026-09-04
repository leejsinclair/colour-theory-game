/**
 * Puzzle 17 – Mud Management Interactive Painting
 *
 * Players apply pigment actions to a "mud monster". Clean green lowers mud;
 * complements and contaminants raise it. Keep the mud bar below 58% to pass.
 */
import { useState, type ReactElement } from "react";
import type { PuzzleComponentProps } from "./types";
import { Button } from "../design-system";

type PigmentWeights = {
  green: number;
  yellow: number;
  blue: number;
  red: number;
  orange: number;
  purple: number;
};

export type Puzzle17Input = {
  complementTouchesAdded: number;
  mudLevel: number;
  muddyResult: boolean;
};

const MUD_THRESHOLD = 0.58;
const COMPLEMENT_MUD_PENALTY = 0.06;
const EMPTY: PigmentWeights = { green: 0, yellow: 0, blue: 0, red: 0, orange: 0, purple: 0 };

const DISPLAY_PIGMENTS: Record<keyof PigmentWeights, [number, number, number]> = {
  green: [47, 158, 68],
  yellow: [252, 196, 25],
  blue: [30, 136, 229],
  red: [217, 72, 15],
  orange: [245, 124, 0],
  purple: [103, 58, 183],
};
const MUD_BROWN: [number, number, number] = [109, 89, 55];

type LocalState = {
  mud: number;
  complementTouches: number;
  recipe: string[];
  pigments: PigmentWeights;
};

const INITIAL: LocalState = { mud: 0.15, complementTouches: 0, recipe: [], pigments: { ...EMPTY } };

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function effectiveMud(s: LocalState): number {
  return clamp01(s.mud + s.complementTouches * COMPLEMENT_MUD_PENALTY);
}

function displayColor(s: LocalState): { r: number; g: number; b: number } {
  const entries = Object.entries(s.pigments) as Array<[keyof PigmentWeights, number]>;
  const total = entries.reduce((sum, [, weight]) => sum + weight, 0);
  const base: [number, number, number] =
    total > 0
      ? (entries.reduce<[number, number, number]>(
          (acc, [key, weight]) => {
            const [r, g, b] = DISPLAY_PIGMENTS[key];
            return [acc[0] + r * weight, acc[1] + g * weight, acc[2] + b * weight];
          },
          [0, 0, 0],
        ).map((channel) => channel / total) as [number, number, number])
      : [88, 160, 62];
  const blend = effectiveMud(s);
  const final = base.map((channel, i) => channel * (1 - blend) + MUD_BROWN[i] * blend);
  return { r: Math.round(final[0]), g: Math.round(final[1]), b: Math.round(final[2]) };
}

const SWATCHES: Array<{
  color: string;
  label: string;
  apply: (s: LocalState) => LocalState;
}> = [
  {
    color: "#2f9e44",
    label: "Add clean green stroke",
    apply: (s) => ({ ...s, mud: clamp01(s.mud - 0.12), pigments: { ...s.pigments, green: s.pigments.green + 1.2 }, recipe: appendRecipe(s.recipe, "clean") }),
  },
  {
    color: "#d9480f",
    label: "Add tiny complement neutralizer",
    apply: (s) => ({ ...s, complementTouches: s.complementTouches + 1, mud: clamp01(s.mud + 0.16), pigments: { ...s.pigments, red: s.pigments.red + 1 }, recipe: appendRecipe(s.recipe, "neutralizer") }),
  },
  {
    color: "#fcc419",
    label: "Add warm yellow tint",
    apply: (s) => ({ ...s, pigments: { ...s.pigments, yellow: s.pigments.yellow + 1 }, recipe: appendRecipe(s.recipe, "yellow") }),
  },
  {
    color: "#1e88e5",
    label: "Add cool blue tint",
    apply: (s) => ({ ...s, pigments: { ...s.pigments, blue: s.pigments.blue + 1 }, recipe: appendRecipe(s.recipe, "blue") }),
  },
  {
    color: "#74b816",
    label: "Add soft green glaze",
    apply: (s) => ({ ...s, mud: clamp01(s.mud - 0.06), pigments: { ...s.pigments, green: s.pigments.green + 0.8 }, recipe: appendRecipe(s.recipe, "green") }),
  },
  {
    color: "#f08c00",
    label: "Add orange contaminant",
    apply: (s) => ({ ...s, complementTouches: s.complementTouches + 1, mud: clamp01(s.mud + 0.2), pigments: { ...s.pigments, orange: s.pigments.orange + 1 }, recipe: appendRecipe(s.recipe, "orange") }),
  },
  {
    color: "#6741d9",
    label: "Add purple contaminant",
    apply: (s) => ({ ...s, complementTouches: s.complementTouches + 1, mud: clamp01(s.mud + 0.18), pigments: { ...s.pigments, purple: s.pigments.purple + 1 }, recipe: appendRecipe(s.recipe, "purple") }),
  },
];

function appendRecipe(recipe: string[], item: string): string[] {
  const next = [...recipe, item];
  if (next.length > 6) {
    next.shift();
  }
  return next;
}

export default function Puzzle17View({
  onChange,
  disabled,
}: PuzzleComponentProps<Puzzle17Input>): ReactElement {
  const [state, setState] = useState<LocalState>(INITIAL);

  const apply = (next: LocalState): void => {
    setState(next);
    const mudLevel = effectiveMud(next);
    onChange({ complementTouchesAdded: next.complementTouches, mudLevel, muddyResult: mudLevel >= MUD_THRESHOLD });
  };

  const mud = effectiveMud(state);
  const muddy = mud >= MUD_THRESHOLD;
  const mudPct = Math.round(mud * 100);
  const mudLimitPct = Math.round(MUD_THRESHOLD * 100);
  const color = displayColor(state);

  return (
    <>
      <div className="mud-monster-board">
        <div
          className="mud-monster"
          role="img"
          aria-label={`Mud level ${mudPct} percent of ${mudLimitPct} percent limit`}
          style={{ background: `radial-gradient(circle at 35% 28%, rgba(255,255,255,0.35), transparent 40%), rgb(${color.r}, ${color.g}, ${color.b})` }}
        >
          {muddy ? "(x_x)" : mud > 0.35 ? "(o_o)" : "(^_^)"}
        </div>

        <div className="coverage-wrap">
          <div className="coverage-bar-track">
            <div className={`coverage-bar-fill${muddy ? " --danger" : ""}`} style={{ width: `${mudPct}%` }} />
          </div>
          <div className="coverage-bar-label" aria-live="polite">Mud level: {mudPct}% / {mudLimitPct}% max</div>
        </div>

        <div className="mini-label">
          Base mud: {Math.round(clamp01(state.mud) * 100)}%. Neutralizing penalty: +
          {Math.round(state.complementTouches * COMPLEMENT_MUD_PENALTY * 100)}% from {state.complementTouches} opposing touch
          {state.complementTouches === 1 ? "" : "es"}.
        </div>

        <div className="mud-log">
          {state.recipe.length > 0 ? `Recipe: ${state.recipe.join(" → ")}` : "Recipe: start with clean green strokes."}
        </div>
      </div>

      <div className="mud-controls">
        <div className="mud-swatches" role="group" aria-label="Mud mixing swatches">
          {SWATCHES.map((swatch) => (
            <button
              key={swatch.label}
              type="button"
              className="mud-swatch"
              style={{ background: swatch.color }}
              aria-label={swatch.label}
              disabled={disabled}
              onClick={() => apply(swatch.apply(state))}
            />
          ))}
        </div>

        <Button variant="secondary" disabled={disabled} onClick={() => apply(INITIAL)}>
          Reset Bowl
        </Button>
      </div>
    </>
  );
}
