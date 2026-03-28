import { beforeEach, describe, expect, test, vi } from "vitest";
import { LOCAL_SAVE_KEY, clearLocalProgress, readLocalProgress, saveLocalProgress, type LocalProgressSnapshot } from "../src/web/localProgress";

type StorageState = Map<string, string>;

function createStorageMock(state: StorageState) {
  return {
    getItem: vi.fn((key: string) => state.get(key) ?? null),
    setItem: vi.fn((key: string, value: string) => {
      state.set(key, value);
    }),
    removeItem: vi.fn((key: string) => {
      state.delete(key);
    }),
    clear: vi.fn(() => {
      state.clear();
    }),
    key: vi.fn((index: number) => Array.from(state.keys())[index] ?? null),
    get length() {
      return state.size;
    },
  } satisfies Storage;
}

describe("localProgress", () => {
  let state: StorageState;
  let storage: Storage;

  beforeEach(() => {
    state = new Map<string, string>();
    storage = createStorageMock(state);
    Object.defineProperty(globalThis, "localStorage", {
      configurable: true,
      value: storage,
    });
  });

  test("readLocalProgress returns null when key is missing", () => {
    expect(readLocalProgress()).toBeNull();
  });

  test("saveLocalProgress writes JSON payload to localStorage", () => {
    const payload: LocalProgressSnapshot = {
      completedPuzzleIds: ["puzzle-01"],
      activeStationId: "station-01",
      practicePuzzleId: null,
      learningProgressByPuzzle: { "puzzle-01": { quizPassed: true } },
    };

    saveLocalProgress(payload);

    expect(storage.setItem).toHaveBeenCalledTimes(1);
    expect(storage.setItem).toHaveBeenCalledWith(LOCAL_SAVE_KEY, JSON.stringify(payload));
  });

  test("clearLocalProgress removes saved key", () => {
    state.set(LOCAL_SAVE_KEY, "{}");

    clearLocalProgress();

    expect(storage.removeItem).toHaveBeenCalledWith(LOCAL_SAVE_KEY);
    expect(state.has(LOCAL_SAVE_KEY)).toBe(false);
  });

  test("readLocalProgress sanitizes invalid and partial payloads", () => {
    state.set(
      LOCAL_SAVE_KEY,
      JSON.stringify({
        completedPuzzleIds: ["puzzle-01", 7, null],
        activeStationId: 12,
        practicePuzzleId: "puzzle-01",
        learningProgressByPuzzle: {
          "puzzle-01": { quizPassed: 1 },
          42: { quizPassed: true },
          "puzzle-02": null,
        },
      }),
    );

    const snapshot = readLocalProgress();

    expect(snapshot).toEqual({
      completedPuzzleIds: ["puzzle-01"],
      activeStationId: null,
      practicePuzzleId: "puzzle-01",
      learningProgressByPuzzle: {
        "42": { quizPassed: true },
        "puzzle-01": { quizPassed: true },
      },
    });
  });

  test("readLocalProgress returns null for malformed JSON", () => {
    state.set(LOCAL_SAVE_KEY, "{not-json");
    expect(readLocalProgress()).toBeNull();
  });

  test("saveLocalProgress and clearLocalProgress swallow storage errors", () => {
    const throwingStorage = {
      ...storage,
      setItem: vi.fn(() => {
        throw new Error("quota");
      }),
      removeItem: vi.fn(() => {
        throw new Error("denied");
      }),
    } as Storage;

    Object.defineProperty(globalThis, "localStorage", {
      configurable: true,
      value: throwingStorage,
    });

    expect(() =>
      saveLocalProgress({
        completedPuzzleIds: [],
        activeStationId: null,
        practicePuzzleId: null,
      })
    ).not.toThrow();

    expect(() => clearLocalProgress()).not.toThrow();
  });
});
