export const LOCAL_SAVE_KEY = "ctg:web-progress:v1";

export type LocalProgressSnapshot = {
  completedPuzzleIds: string[];
  activeStationId: string | null;
  practicePuzzleId: string | null;
  learningProgressByPuzzle?: Record<string, { quizPassed: boolean }>;
};

export type LearningProgress = Record<string, { quizPassed: boolean }>;

export function readLocalProgress(): LocalProgressSnapshot | null {
  try {
    const raw = localStorage.getItem(LOCAL_SAVE_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as Partial<LocalProgressSnapshot>;
    const completedPuzzleIds = Array.isArray(parsed.completedPuzzleIds)
      ? parsed.completedPuzzleIds.filter((id): id is string => typeof id === "string")
      : [];

    return {
      completedPuzzleIds,
      activeStationId: typeof parsed.activeStationId === "string" ? parsed.activeStationId : null,
      practicePuzzleId: typeof parsed.practicePuzzleId === "string" ? parsed.practicePuzzleId : null,
      learningProgressByPuzzle:
        typeof parsed.learningProgressByPuzzle === "object" && parsed.learningProgressByPuzzle != null
          ? Object.fromEntries(
            Object.entries(parsed.learningProgressByPuzzle)
              .filter(([id, value]) => typeof id === "string" && typeof value === "object" && value != null)
              .map(([id, value]) => [id, { quizPassed: Boolean((value as { quizPassed?: boolean }).quizPassed) }]),
          )
          : undefined,
    };
  } catch {
    return null;
  }
}

export function saveLocalProgress(payload: LocalProgressSnapshot): void {
  try {
    localStorage.setItem(LOCAL_SAVE_KEY, JSON.stringify(payload));
  } catch {
    // Ignore storage failures (private mode/quota) and continue gameplay.
  }
}

export function clearLocalProgress(): void {
  try {
    localStorage.removeItem(LOCAL_SAVE_KEY);
  } catch {
    // Ignore storage failures.
  }
}
