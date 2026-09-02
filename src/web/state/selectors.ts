import { useSyncExternalStore } from "react";
import { useGameStore } from "./contexts";
import type {
  GameSnapshot,
  PetSnapshot,
  ProgressSnapshot,
  PuzzleSnapshot,
  RecommendedNext,
  StationSnapshot,
} from "./gameStore";
import type { LearningProgress } from "../localProgress";

/**
 * Field-slice selector hooks (data-model.md §3e). Each subscribes to the store
 * and returns one referentially-stable slice, so a component re-renders only
 * when its slice changes identity (which happens on `store.notify()`).
 */

function useSelector<T>(select: (snapshot: GameSnapshot) => T): T {
  const store = useGameStore();
  return useSyncExternalStore(
    store.subscribe,
    () => select(store.getSnapshot()),
    () => select(store.getSnapshot()),
  );
}

export function useSnapshot(): GameSnapshot {
  return useSelector((snapshot) => snapshot);
}

export function useProgress(): ProgressSnapshot {
  return useSelector((snapshot) => snapshot.progress);
}

export function useStations(): ReadonlyArray<StationSnapshot> {
  return useSelector((snapshot) => snapshot.stations);
}

export function useStation(stationId: string | undefined): StationSnapshot | undefined {
  return useSelector((snapshot) =>
    stationId ? snapshot.stations.find((station) => station.id === stationId) : undefined,
  );
}

export function usePuzzle(puzzleId: string | undefined): PuzzleSnapshot | undefined {
  return useSelector((snapshot) => {
    if (!puzzleId) {
      return undefined;
    }
    for (const station of snapshot.stations) {
      const puzzle = station.puzzles.find((p) => p.id === puzzleId);
      if (puzzle) {
        return puzzle;
      }
    }
    return undefined;
  });
}

export function useRecommendedNext(): RecommendedNext {
  return useSelector((snapshot) => snapshot.recommendedNext);
}

export function usePets(): ReadonlyArray<PetSnapshot> {
  return useSelector((snapshot) => snapshot.pets);
}

export function useLearning(): Readonly<LearningProgress> {
  return useSelector((snapshot) => snapshot.learning);
}
