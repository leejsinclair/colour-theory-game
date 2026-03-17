import { renderPuzzle01 } from "./puzzle-01";
import { renderPuzzle02 } from "./puzzle-02";
import { renderPuzzle03 } from "./puzzle-03";
import { renderPuzzle04 } from "./puzzle-04";
import { renderPuzzle05 } from "./puzzle-05";
import { renderPuzzle06 } from "./puzzle-06";
import { renderPuzzle07 } from "./puzzle-07";
import { renderPuzzle08 } from "./puzzle-08";
import { renderPuzzle09 } from "./puzzle-09";
import { renderPuzzle10 } from "./puzzle-10";
import { renderPuzzle11 } from "./puzzle-11";
import { renderPuzzle12 } from "./puzzle-12";
import { renderPuzzle13 } from "./puzzle-13";
import { renderPuzzle14 } from "./puzzle-14";
import { renderPuzzle15 } from "./puzzle-15";
import { renderPuzzle16 } from "./puzzle-16";
import { renderPuzzle17 } from "./puzzle-17";
import { renderPuzzle18 } from "./puzzle-18";
import { renderPuzzle19 } from "./puzzle-19";
import { PuzzleRenderDeps, PuzzleRenderResult, PuzzleRenderer } from "./types";

const puzzleRenderers: Record<string, PuzzleRenderer> = {
  "puzzle-01": renderPuzzle01,
  "puzzle-02": renderPuzzle02,
  "puzzle-03": renderPuzzle03,
  "puzzle-04": renderPuzzle04,
  "puzzle-05": renderPuzzle05,
  "puzzle-06": renderPuzzle06,
  "puzzle-07": renderPuzzle07,
  "puzzle-08": renderPuzzle08,
  "puzzle-09": renderPuzzle09,
  "puzzle-10": renderPuzzle10,
  "puzzle-11": renderPuzzle11,
  "puzzle-12": renderPuzzle12,
  "puzzle-13": renderPuzzle13,
  "puzzle-14": renderPuzzle14,
  "puzzle-15": renderPuzzle15,
  "puzzle-16": renderPuzzle16,
  "puzzle-17": renderPuzzle17,
  "puzzle-18": renderPuzzle18,
  "puzzle-19": renderPuzzle19,
};

export function renderPuzzleById(puzzleId: string, deps: PuzzleRenderDeps): PuzzleRenderResult | null {
  const renderer = puzzleRenderers[puzzleId];
  if (!renderer) {
    return null;
  }

  return renderer(deps) ?? {};
}

export type { PuzzleRenderDeps, PuzzleRenderResult, PuzzleRenderer } from "./types";
