import { Game } from "../../game/Game";
import { puzzleLearningContent } from "../../content/puzzleLearningContent";
import { PuzzleState } from "../../types/gameTypes";
import { ALL_PET_IDS, PET_NAMES } from "../petSprites";
import type { LearningProgress } from "../localProgress";

/**
 * External-store adapter over the mutable `Game` domain instance
 * (research.md R1, contracts/app-state.md §GameSnapshot).
 *
 * React reads this through `useSyncExternalStore`. `getSnapshot()` returns a
 * referentially-stable object that only changes identity when `notify()` is
 * called after a domain mutation, so `React.memo` screens and field-slice
 * selectors skip re-renders when an unrelated field changed.
 *
 * The store never decides game rules — it reflects `Game`. Mutations go through
 * `actions.ts`, which call `Game` methods then `notify()`.
 */

export type StationStatus = "locked" | "available" | "in-progress" | "complete";
export type PuzzleUiState = "locked" | "available" | "solved";

export type PuzzleSnapshot = {
  id: string;
  title: string;
  state: PuzzleUiState;
  learningRequired: boolean;
  rewardPetId: string;
  stationId: string;
};

export type StationSnapshot = {
  id: string;
  name: string;
  type: string;
  status: StationStatus;
  solvedCount: number;
  puzzleCount: number;
  puzzles: ReadonlyArray<PuzzleSnapshot>;
};

export type PetSnapshot = {
  id: string;
  name: string;
  collected: boolean;
  originPuzzleId: string;
  originStationId: string;
};

export type ProgressSnapshot = {
  solved: number;
  total: number;
  petsCollected: number;
  finalCanvasUnlocked: boolean;
  score: number;
  currentStreak: number;
  bestStreak: number;
  petMilestonesUnlocked: string[];
};

export type RecommendedNext =
  | { kind: "station"; stationId: string; label: string }
  | { kind: "puzzle"; stationId: string; puzzleId: string; label: string }
  | { kind: "grand-canvas"; label: string }
  | { kind: "none"; label: string };

export type GameSnapshot = {
  progress: ProgressSnapshot;
  stations: ReadonlyArray<StationSnapshot>;
  pets: ReadonlyArray<PetSnapshot>;
  learning: Readonly<LearningProgress>;
  recommendedNext: RecommendedNext;
};

export type GameStore = {
  subscribe(listener: () => void): () => void;
  getSnapshot(): GameSnapshot;
  /** The live domain instance — for actions only, never for rendering. */
  getGame(): Game;
  getLearning(): LearningProgress;
  /** Replace the learning map (quiz-pass restore / record). Triggers notify. */
  setLearning(next: LearningProgress): void;
  /** Recompute the snapshot and notify subscribers (call after a Game mutation). */
  notify(): void;
  /** Discard the Game and build a fresh one (Reset). Triggers notify. */
  rebuild(): void;
};

function toPuzzleUiState(state: PuzzleState): PuzzleUiState {
  if (state === PuzzleState.Solved) {
    return "solved";
  }
  if (state === PuzzleState.Locked) {
    return "locked";
  }
  return "available";
}

function buildSnapshot(game: Game, learning: LearningProgress): GameSnapshot {
  const domainProgress = game.getProgress();
  const stationEntities = game.stationManager.getAllStations();
  const collectedPetIds = new Set(game.petManager.getUnlockedPets().map((pet) => pet.id));

  const petOrigin = new Map<string, { puzzleId: string; stationId: string }>();

  const stations: StationSnapshot[] = stationEntities.map((station) => {
    const puzzles: PuzzleSnapshot[] = station.puzzles.map((puzzle) => {
      petOrigin.set(puzzle.rewardPetId, { puzzleId: puzzle.id, stationId: station.id });
      const uiState = toPuzzleUiState(puzzle.state);
      const hasLearning = Boolean(puzzleLearningContent[puzzle.id]);
      return {
        id: puzzle.id,
        title: puzzle.title,
        state: uiState,
        learningRequired:
          hasLearning && uiState !== "solved" && !learning[puzzle.id]?.quizPassed,
        rewardPetId: puzzle.rewardPetId,
        stationId: station.id,
      };
    });

    const solvedCount = puzzles.filter((puzzle) => puzzle.state === "solved").length;
    let status: StationStatus;
    if (!station.unlocked) {
      status = "locked";
    } else if (station.completed) {
      status = "complete";
    } else if (solvedCount > 0) {
      status = "in-progress";
    } else {
      status = "available";
    }

    return {
      id: station.id,
      name: station.name,
      type: String(station.type),
      status,
      solvedCount,
      puzzleCount: puzzles.length,
      puzzles,
    };
  });

  const pets: PetSnapshot[] = ALL_PET_IDS.map((petId) => {
    const origin = petOrigin.get(petId);
    return {
      id: petId,
      name: PET_NAMES[petId] ?? petId,
      collected: collectedPetIds.has(petId),
      originPuzzleId: origin?.puzzleId ?? "",
      originStationId: origin?.stationId ?? "",
    };
  });

  const progress: ProgressSnapshot = {
    solved: domainProgress.solved,
    total: domainProgress.total,
    petsCollected: domainProgress.petsCollected,
    finalCanvasUnlocked: domainProgress.finalCanvasUnlocked,
    score: domainProgress.score,
    currentStreak: domainProgress.currentStreak,
    bestStreak: domainProgress.bestStreak,
    petMilestonesUnlocked: domainProgress.petMilestonesUnlocked,
  };

  return {
    progress,
    stations,
    pets,
    learning,
    recommendedNext: computeRecommendedNext(stations, progress),
  };
}

/**
 * Earliest unlocked incomplete station → its next unsolved puzzle; else Grand
 * Canvas when unlocked; else nothing (US2-2, SC-010, data-model §3e).
 */
export function computeRecommendedNext(
  stations: ReadonlyArray<StationSnapshot>,
  progress: ProgressSnapshot,
): RecommendedNext {
  const target = stations.find(
    (station) => station.status === "available" || station.status === "in-progress",
  );

  if (target) {
    const nextPuzzle = target.puzzles.find((puzzle) => puzzle.state !== "solved");
    if (nextPuzzle && nextPuzzle.state !== "locked") {
      return {
        kind: "puzzle",
        stationId: target.id,
        puzzleId: nextPuzzle.id,
        label: `${nextPuzzle.title} — ${target.name}`,
      };
    }
    return { kind: "station", stationId: target.id, label: target.name };
  }

  if (progress.finalCanvasUnlocked) {
    return { kind: "grand-canvas", label: "Grand Canvas" };
  }

  return { kind: "none", label: "Every station complete" };
}

export function createGameStore(): GameStore {
  let game = new Game();
  game.initialize();

  let learning: LearningProgress = {};
  const listeners = new Set<() => void>();
  let snapshot: GameSnapshot = buildSnapshot(game, learning);

  const notify = (): void => {
    snapshot = buildSnapshot(game, learning);
    for (const listener of listeners) {
      listener();
    }
  };

  return {
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    getSnapshot() {
      return snapshot;
    },
    getGame() {
      return game;
    },
    getLearning() {
      return learning;
    },
    setLearning(next) {
      learning = next;
      notify();
    },
    notify,
    rebuild() {
      game = new Game();
      game.initialize();
      learning = {};
      notify();
    },
  };
}
