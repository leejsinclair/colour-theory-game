import type { Dispatch } from "react";
import { getDemoSolution } from "../../content/demoSolutions";
import { diagnoseFailure } from "../puzzles/diagnose";
import {
  FAILURE_EXPLANATIONS,
  FAILURE_PRINCIPLE,
  type FailureReasonCode,
} from "../puzzles/failureReasons";
import { validatePuzzleInput } from "../puzzleValidation";
import { clearLocalProgress } from "../localProgress";
import type { GameStore } from "./gameStore";
import type { SessionAction } from "./sessionReducer";

export type FailureDiagnosis = {
  codes: FailureReasonCode[];
  primaryCode: FailureReasonCode | null;
  /** The colour-theory principle to revisit, from the primary reason. */
  principle: string | null;
  explanations: string[];
};

export type SubmitSuccess = {
  ok: true;
  scoreEvent: { delta: number; reason: string };
  petId: string | null;
  stationCompleted: boolean;
  nextStationId: string | null;
  grandCanvasUnlocked: boolean;
};

export type SubmitFailure = {
  ok: false;
  diagnosis: FailureDiagnosis;
};

export type SubmitResult = SubmitSuccess | SubmitFailure;

export type GameActions = {
  submitPuzzle(puzzleId: string, input: unknown): SubmitResult;
  practiceSubmit(puzzleId: string, input: unknown): SubmitResult;
  recordQuizPass(puzzleId: string): void;
  reset(): void;
  markIntroSeen(): void;
  autoSolveJourney(): Promise<void>;
};

function buildDiagnosis(puzzleId: string, input: unknown): FailureDiagnosis {
  const codes = diagnoseFailure(puzzleId, input);
  const primaryCode = codes[0] ?? null;
  return {
    codes,
    primaryCode,
    principle: primaryCode ? FAILURE_PRINCIPLE[primaryCode] : null,
    explanations: codes.map((code) => FAILURE_EXPLANATIONS[code]).filter(Boolean),
  };
}

function nextUnlockedStationAfter(store: GameStore, stationId: string): string | null {
  const stations = store.getGame().stationManager.getAllStations();
  const index = stations.findIndex((station) => station.id === stationId);
  if (index < 0) {
    return null;
  }
  const after = stations.slice(index + 1).find((station) => station.unlocked);
  return after?.id ?? null;
}

export type GameActionsDeps = {
  store: GameStore;
  dispatchSession: Dispatch<SessionAction>;
};

export function createGameActions({ store, dispatchSession }: GameActionsDeps): GameActions {
  const submitPuzzle = (puzzleId: string, input: unknown): SubmitResult => {
    const game = store.getGame();
    const puzzle = game.puzzleManager.getPuzzle(puzzleId);

    // Idempotent: a repeat submit for an already-solved puzzle is a no-op success
    // (Edge Cases — fast repeated Check clicks).
    if (puzzle?.solved) {
      return {
        ok: true,
        scoreEvent: { delta: 0, reason: "Already solved" },
        petId: null,
        stationCompleted: false,
        nextStationId: null,
        grandCanvasUnlocked: game.getProgress().finalCanvasUnlocked,
      };
    }

    const scoreEvent = game.completePuzzle(puzzleId, input);
    if (!scoreEvent) {
      store.notify(); // streak may have reset
      return { ok: false, diagnosis: buildDiagnosis(puzzleId, input) };
    }

    const stationCompleted = scoreEvent.stationCompleted === true;
    const grandCanvasUnlocked = game.getProgress().finalCanvasUnlocked;
    const petId = scoreEvent.petRescued && puzzle ? puzzle.rewardPetId : null;
    const nextStationId =
      stationCompleted && puzzle ? nextUnlockedStationAfter(store, puzzle.stationId) : null;

    store.notify();

    return {
      ok: true,
      scoreEvent,
      petId,
      stationCompleted,
      nextStationId,
      grandCanvasUnlocked,
    };
  };

  const practiceSubmit = (puzzleId: string, input: unknown): SubmitResult => {
    const game = store.getGame();

    if (!validatePuzzleInput(puzzleId, input)) {
      return { ok: false, diagnosis: buildDiagnosis(puzzleId, input) };
    }

    const scoreEvent = game.practiceComplete(puzzleId, true);
    if (!scoreEvent) {
      return { ok: false, diagnosis: buildDiagnosis(puzzleId, input) };
    }
    store.notify();

    return {
      ok: true,
      scoreEvent,
      petId: null,
      stationCompleted: false,
      nextStationId: null,
      grandCanvasUnlocked: game.getProgress().finalCanvasUnlocked,
    };
  };

  const recordQuizPass = (puzzleId: string): void => {
    const current = store.getLearning();
    if (current[puzzleId]?.quizPassed) {
      return;
    }
    store.setLearning({ ...current, [puzzleId]: { quizPassed: true } });
  };

  const reset = (): void => {
    store.rebuild();
    clearLocalProgress();
    dispatchSession({ type: "RESET" });
  };

  const markIntroSeen = (): void => {
    dispatchSession({ type: "DISMISS_INTRO" });
  };

  const autoSolveJourney = async (): Promise<void> => {
    const game = store.getGame();
    const puzzleIds = game.stationManager
      .getAllStations()
      .flatMap((station) => station.puzzles)
      .map((puzzle) => puzzle.id);

    for (const puzzleId of puzzleIds) {
      submitPuzzle(puzzleId, getDemoSolution(puzzleId));
      recordQuizPass(puzzleId);
    }
  };

  return { submitPuzzle, practiceSubmit, recordQuizPass, reset, markIntroSeen, autoSolveJourney };
}
