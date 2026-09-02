import { useEffect, useRef, useState, type ReactElement } from "react";
import { renderPuzzleById } from "../puzzles";
import type { PuzzleRenderDeps } from "../puzzles/types";
import { circularHueDistance, shuffleArray } from "../puzzleValidation";
import { mountMuiCheckbox, mountMuiSelect, mountMuiSlider } from "../muiControls";
import {
  renderArtStationMiniGame as renderArtStationMiniGameCard,
  type ArtPadState,
} from "../legacy/artStationMiniGame";
import { getDemoSolution } from "../../content/demoSolutions";

/**
 * TEMPORARY (research.md R5) — hosts a not-yet-migrated `renderPuzzleById`
 * inside a React container with a synthetic `PuzzleRenderDeps`. Deleted in
 * Phase 5 (T080) once every puzzle is a native `PuzzleComponent`.
 *
 * The legacy view still builds its controls as imperative DOM inside a ref'd
 * `<div>`, but the seam is closed: the legacy `addCheckButton` no longer builds
 * a DOM button — its `inputFactory` is forwarded up via `onInputFactory`, and
 * the host `<PuzzlePlayer>` (T045) renders the real design-system Check button in
 * the React tree (FR-006). No module-level UI state, no `getElementById`.
 */

export type LegacyPuzzleAdapterProps = {
  puzzleId: string;
  /** Passed to the legacy renderer as its `state` string (mostly "available" | "solved"). */
  state?: string;
  /** Receives the legacy view's current-answer factory whenever it (re)mounts. */
  onInputFactory: (factory: () => unknown) => void;
};

export function LegacyPuzzleAdapter({
  puzzleId,
  state = "available",
  onInputFactory,
}: LegacyPuzzleAdapterProps): ReactElement {
  const hostRef = useRef<HTMLDivElement>(null);
  const [renderTick, setRenderTick] = useState(0);
  const onInputFactoryRef = useRef(onInputFactory);
  onInputFactoryRef.current = onInputFactory;

  useEffect(() => {
    const host = hostRef.current;
    if (!host) {
      return;
    }
    host.replaceChildren();

    const wrapper = document.createElement("div");
    wrapper.className = "puzzle-item legacy-adapter-wrapper";
    const zone = document.createElement("div");
    zone.className = "mini-zone";
    wrapper.appendChild(zone);

    const uiState = new Map<string, unknown>();

    // Self-contained Art Station state (was `legacyGame` module `let`s) — only
    // puzzle-18 touches this, and only until its US3 rewrite (T077).
    const artPalette = ["#0d8db0", "#ec7755", "#2f9e44", "#f0b429", "#6f42c1", "#1f2030"];
    const artPad: ArtPadState = {
      cols: 18,
      rows: 10,
      pixels: new Array(18 * 10).fill("#ffffff"),
    };
    let selectedArtColor = artPalette[0];

    const forceRender = (): void => setRenderTick((tick) => tick + 1);

    const registerInputFactory = (
      _wrapper: HTMLDivElement,
      id: string,
      inputFactory: () => unknown,
    ): void => {
      onInputFactoryRef.current(() => inputFactory() ?? getDemoSolution(id));
    };

    const deps: PuzzleRenderDeps = {
      zone,
      wrapper,
      puzzleId,
      state,
      ensureState: <T,>(id: string, initial: T): T => {
        if (uiState.has(id)) {
          return uiState.get(id) as T;
        }
        uiState.set(id, initial);
        return initial;
      },
      addMiniLabel: (container, text) => {
        const label = document.createElement("div");
        label.className = "mini-label";
        label.textContent = text;
        container.appendChild(label);
      },
      addSlider: (container, label, value, min, max, step, onInput) =>
        mountMuiSlider(container, label, value, min, max, step, onInput),
      addSelect: (container, label, options, current, onChange) =>
        mountMuiSelect(container, label, options, current, onChange),
      addCheckbox: (container, label, checked, onChange) =>
        mountMuiCheckbox(container, label, checked, onChange),
      addCheckButton: registerInputFactory,
      circularHueDistance,
      shuffleArray,
      render: forceRender,
      renderArtStationMiniGame: (container, artWrapper, id, artState) => {
        renderArtStationMiniGameCard({
          container,
          wrapper: artWrapper,
          puzzleId: id,
          state: artState,
          artPalette,
          selectedArtColor,
          setSelectedArtColor: (color) => {
            selectedArtColor = color;
          },
          artPad,
          addCheckButton: registerInputFactory,
          render: forceRender,
          updatePuzzlePanel: forceRender,
        });
      },
      appendWrapper: () => {
        host.appendChild(wrapper);
      },
    };

    const result = renderPuzzleById(puzzleId, deps);
    if (!result) {
      // The renderer didn't append itself — mirror the legacy fallback.
      registerInputFactory(wrapper, puzzleId, () => getDemoSolution(puzzleId));
      host.appendChild(wrapper);
    }

    return () => {
      host.replaceChildren();
    };
    // renderTick re-runs the legacy render (its own `render()` callback).
  }, [puzzleId, state, renderTick]);

  return <div ref={hostRef} className="legacy-puzzle-adapter" />;
}
