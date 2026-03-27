/**
 * Puzzle 17 – Mud Management Interactive Painting
 *
 * Players interact with a "mud monster" by clicking swatch buttons that apply
 * pigment actions: clean green strokes, neutralisers (red), tints (yellow/
 * blue), glazes, and contaminants (orange/purple). Each action adjusts a mud
 * percentage; complementary-colour touches add a penalty. The target is to
 * keep mud below 58%. A recipe log tracks the sequence. Teaches how pigment
 * choices and neutralising complements balance paint quality.
 */
import React from "react";
import { createRoot } from "react-dom/client";
import { PuzzleRenderDeps, PuzzleRenderer } from "./types";

type PigmentWeights = {
  green: number;
  yellow: number;
  blue: number;
  red: number;
  orange: number;
  purple: number;
};

type Puzzle17State = {
  complementTouches: number;
  mud: number;
  recipe: string[];
  pigments: PigmentWeights;
};

type Puzzle17ViewProps = {
  persistedState: Puzzle17State;
};

const MUD_THRESHOLD = 0.58;
const COMPLEMENT_MUD_PENALTY = 0.06;
const EMPTY_PIGMENTS: PigmentWeights = {
  green: 0,
  yellow: 0,
  blue: 0,
  red: 0,
  orange: 0,
  purple: 0,
};

const DISPLAY_PIGMENTS: Record<keyof PigmentWeights, [number, number, number]> = {
  green: [47, 158, 68],
  yellow: [252, 196, 25],
  blue: [30, 136, 229],
  red: [217, 72, 15],
  orange: [245, 124, 0],
  purple: [103, 58, 183],
};

const MUD_BROWN: [number, number, number] = [109, 89, 55];

type MudSwatchButtonProps = {
  color: string;
  label: string;
  onClick: () => void;
};

function MudSwatchButton({ color, label, onClick }: MudSwatchButtonProps): React.ReactElement {
  return (
    <button
      type="button"
      className="mud-swatch"
      style={{ background: color }}
      aria-label={label}
      title={label}
      onClick={onClick}
    />
  );
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function normalizePigments(pigments?: Partial<PigmentWeights>): PigmentWeights {
  return {
    green: pigments?.green ?? 0,
    yellow: pigments?.yellow ?? 0,
    blue: pigments?.blue ?? 0,
    red: pigments?.red ?? 0,
    orange: pigments?.orange ?? 0,
    purple: pigments?.purple ?? 0,
  };
}

function normalizeState(state?: Partial<Puzzle17State>): Puzzle17State {
  return {
    complementTouches: state?.complementTouches ?? 0,
    mud: state?.mud ?? 0.15,
    recipe: [...(state?.recipe ?? [])],
    pigments: normalizePigments(state?.pigments),
  };
}

function getDisplayColor(state: Puzzle17State): { r: number; g: number; b: number } {
  const pigments = normalizePigments(state.pigments);
  const pigmentEntries = Object.entries(pigments) as Array<[keyof PigmentWeights, number]>;
  const totalWeight = pigmentEntries.reduce((sum, [, weight]) => sum + weight, 0);
  const fallback: [number, number, number] = [88, 160, 62];

  const mixed = totalWeight > 0
    ? pigmentEntries.reduce<[number, number, number]>((acc, [key, weight]) => {
      const [r, g, b] = DISPLAY_PIGMENTS[key];
      return [acc[0] + (r * weight), acc[1] + (g * weight), acc[2] + (b * weight)];
    }, [0, 0, 0]).map((channel) => channel / totalWeight) as [number, number, number]
    : fallback;

  const mudBlend = getEffectiveMud(state);
  const finalColor = mixed.map((channel, index) => ((channel * (1 - mudBlend)) + (MUD_BROWN[index] * mudBlend))) as [number, number, number];

  return {
    r: Math.round(finalColor[0]),
    g: Math.round(finalColor[1]),
    b: Math.round(finalColor[2]),
  };
}

function isMuddy(state: Puzzle17State): boolean {
  return getEffectiveMud(state) >= MUD_THRESHOLD;
}

function getEffectiveMud(state: Puzzle17State): number {
  const complementPenalty = state.complementTouches * COMPLEMENT_MUD_PENALTY;
  return clamp01(state.mud + complementPenalty);
}

function Puzzle17View({ persistedState }: Puzzle17ViewProps): React.ReactElement {
  const [localState, setLocalState] = React.useState<Puzzle17State>(normalizeState(persistedState));

  const updateState = (updater: (prev: Puzzle17State) => Puzzle17State): void => {
    setLocalState((prev) => {
      const next = normalizeState(updater(prev));
      persistedState.complementTouches = next.complementTouches;
      persistedState.mud = next.mud;
      persistedState.recipe = [...next.recipe];
      persistedState.pigments = normalizePigments(next.pigments);
      return next;
    });
  };

  const baseMud = clamp01(localState.mud);
  const complementPenalty = localState.complementTouches * COMPLEMENT_MUD_PENALTY;
  const mud = getEffectiveMud(localState);
  const muddy = isMuddy(localState);
  const displayColor = getDisplayColor(localState);
  const baseMudPct = Math.round(baseMud * 100);
  const complementPenaltyPct = Math.round(complementPenalty * 100);
  const mudPct = Math.round(mud * 100);
  const mudLimitPct = Math.round(MUD_THRESHOLD * 100);

  const appendRecipe = (recipe: string[], item: string): string[] => {
    const next = [...recipe, item];
    if (next.length > 6) {
      next.shift();
    }
    return next;
  };

  return (
    <>
      <div className="mud-monster-board">
        <div
          className="mud-monster"
          style={{
            background: `radial-gradient(circle at 35% 28%, rgba(255,255,255,0.35), transparent 40%), rgb(${displayColor.r}, ${displayColor.g}, ${displayColor.b})`,
          }}
        >
          {muddy ? "(x_x)" : mud > 0.35 ? "(o_o)" : "(^_^)"}
        </div>

        <div className="coverage-wrap">
          <div className="coverage-bar-track">
            <div className={`coverage-bar-fill${muddy ? " --danger" : ""}`} style={{ width: `${mudPct}%` }} />
          </div>
          <div className="coverage-bar-label">Mud level: {mudPct}% / {mudLimitPct}% max</div>
        </div>

        <div className="mini-label">
          {muddy
            ? `The mix is muddy. Keep the mud bar below ${mudLimitPct}% to pass.`
            : `Clean mix. Stay below ${mudLimitPct}% mud to pass.`}
        </div>

        <div className="mini-label">
          Base mud: {baseMudPct}%. Neutralizing penalty: +{complementPenaltyPct}% from {localState.complementTouches} opposing touch{localState.complementTouches === 1 ? "" : "es"}.
        </div>

        <div className="mud-log">
          {localState.recipe.length > 0
            ? `Recipe: ${localState.recipe.join(" -> ")}`
            : "Recipe: start with clean green strokes."}
        </div>
      </div>

      <div className="mud-controls">
        <div className="mud-swatches" role="group" aria-label="Mud mixing swatches">
          <MudSwatchButton
            color="#2f9e44"
            label="Add clean green stroke"
            onClick={() => {
              updateState((prev) => ({
                ...prev,
                mud: clamp01(prev.mud - 0.12),
                pigments: {
                  ...prev.pigments,
                  green: prev.pigments.green + 1.2,
                },
                recipe: appendRecipe(prev.recipe, "clean"),
              }));
            }}
          />

          <MudSwatchButton
            color="#d9480f"
            label="Add tiny complement neutralizer"
            onClick={() => {
              updateState((prev) => ({
                ...prev,
                complementTouches: prev.complementTouches + 1,
                mud: clamp01(prev.mud + 0.16),
                pigments: {
                  ...prev.pigments,
                  red: prev.pigments.red + 1,
                },
                recipe: appendRecipe(prev.recipe, "neutralizer"),
              }));
            }}
          />

          <MudSwatchButton
            color="#fcc419"
            label="Add warm yellow tint"
            onClick={() => {
              updateState((prev) => ({
                ...prev,
                mud: prev.mud,
                pigments: {
                  ...prev.pigments,
                  yellow: prev.pigments.yellow + 1,
                },
                recipe: appendRecipe(prev.recipe, "yellow"),
              }));
            }}
          />

          <MudSwatchButton
            color="#1e88e5"
            label="Add cool blue tint"
            onClick={() => {
              updateState((prev) => ({
                ...prev,
                mud: prev.mud,
                pigments: {
                  ...prev.pigments,
                  blue: prev.pigments.blue + 1,
                },
                recipe: appendRecipe(prev.recipe, "blue"),
              }));
            }}
          />

          <MudSwatchButton
            color="#74b816"
            label="Add soft green glaze"
            onClick={() => {
              updateState((prev) => ({
                ...prev,
                mud: clamp01(prev.mud - 0.06),
                pigments: {
                  ...prev.pigments,
                  green: prev.pigments.green + 0.8,
                },
                recipe: appendRecipe(prev.recipe, "green"),
              }));
            }}
          />

          <MudSwatchButton
            color="#f08c00"
            label="Add orange contaminant"
            onClick={() => {
              updateState((prev) => ({
                ...prev,
                complementTouches: prev.complementTouches + 1,
                mud: clamp01(prev.mud + 0.2),
                pigments: {
                  ...prev.pigments,
                  orange: prev.pigments.orange + 1,
                },
                recipe: appendRecipe(prev.recipe, "orange"),
              }));
            }}
          />

          <MudSwatchButton
            color="#6741d9"
            label="Add purple contaminant"
            onClick={() => {
              updateState((prev) => ({
                ...prev,
                complementTouches: prev.complementTouches + 1,
                mud: clamp01(prev.mud + 0.18),
                pigments: {
                  ...prev.pigments,
                  purple: prev.pigments.purple + 1,
                },
                recipe: appendRecipe(prev.recipe, "purple"),
              }));
            }}
          />
        </div>

        <button
          type="button"
          className="mud-reset"
          onClick={() => {
            updateState(() => ({
              complementTouches: 0,
              mud: 0.15,
              recipe: [],
              pigments: { ...EMPTY_PIGMENTS },
            }));
          }}
        >
          Reset Bowl
        </button>
      </div>
    </>
  );
}

export const renderPuzzle17: PuzzleRenderer = (deps: PuzzleRenderDeps) => {
  const {
    zone,
    wrapper,
    puzzleId,
    ensureState,
    addCheckButton,
  } = deps;

  const state = ensureState<Puzzle17State>(puzzleId, {
    complementTouches: 0,
    mud: 0.15,
    recipe: [],
    pigments: { ...EMPTY_PIGMENTS },
  });

  createRoot(zone).render(<Puzzle17View persistedState={state} />);

  addCheckButton(wrapper, puzzleId, () => ({
    complementTouchesAdded: state.complementTouches,
    mudLevel: getEffectiveMud(state),
    muddyResult: isMuddy(state),
  }));
};
