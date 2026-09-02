import { describe, expect, it } from "vitest";
import {
  parseHash,
  resolveRoute,
  serialiseRoute,
  type Route,
} from "../../src/web/app/routes";
import type { GameSnapshot, StationSnapshot } from "../../src/web/state/gameStore";

function station(overrides: Partial<StationSnapshot> & { id: string }): StationSnapshot {
  return {
    id: overrides.id,
    name: overrides.name ?? overrides.id,
    type: "Test",
    status: overrides.status ?? "available",
    solvedCount: overrides.solvedCount ?? 0,
    puzzleCount: overrides.puzzles?.length ?? 0,
    puzzles: overrides.puzzles ?? [],
  };
}

function snapshot(partial: {
  stations: StationSnapshot[];
  solved?: number;
  finalCanvasUnlocked?: boolean;
}): GameSnapshot {
  return {
    progress: {
      solved: partial.solved ?? 0,
      total: 22,
      petsCollected: 0,
      finalCanvasUnlocked: partial.finalCanvasUnlocked ?? false,
      score: 0,
      currentStreak: 0,
      bestStreak: 0,
      petMilestonesUnlocked: [],
    },
    stations: partial.stations,
    pets: [],
    learning: {},
    recommendedNext: { kind: "none", label: "" },
  };
}

const baseSnapshot = snapshot({
  stations: [
    station({
      id: "station-01",
      status: "in-progress",
      puzzles: [
        { id: "puzzle-01", title: "P1", state: "solved", learningRequired: false, rewardPetId: "pet-01", stationId: "station-01" },
        { id: "puzzle-02", title: "P2", state: "available", learningRequired: true, rewardPetId: "pet-02", stationId: "station-01" },
        { id: "puzzle-03", title: "P3", state: "locked", learningRequired: true, rewardPetId: "pet-03", stationId: "station-01" },
      ],
    }),
    station({ id: "station-02", status: "locked" }),
  ],
});

const ctx = { snapshot: baseSnapshot, introSeen: true, introReplayRequested: false };

describe("parseHash / serialiseRoute", () => {
  const cases: Route[] = [
    { view: "intro" },
    { view: "studio" },
    { view: "collection" },
    { view: "grand-canvas" },
    { view: "station", stationId: "station-03" },
    { view: "puzzle", stationId: "station-03", puzzleId: "puzzle-07" },
  ];

  it.each(cases)("round-trips %o", (route) => {
    expect(parseHash(serialiseRoute(route))).toEqual(route);
  });

  it("maps empty / unknown / malformed hashes to studio", () => {
    for (const hash of ["", "#", "#/", "#/studio", "#/nonsense", "#/station/bad", "#/station/station-1", "#/station/station-01/puzzle/nope"]) {
      expect(parseHash(hash)).toEqual({ view: "studio" });
    }
  });
});

describe("resolveRoute guards", () => {
  it("locked/unknown station → studio", () => {
    expect(resolveRoute({ view: "station", stationId: "station-02" }, ctx)).toEqual({ view: "studio" });
    expect(resolveRoute({ view: "station", stationId: "station-99" }, ctx)).toEqual({ view: "studio" });
  });

  it("reachable station passes through", () => {
    expect(resolveRoute({ view: "station", stationId: "station-01" }, ctx)).toEqual({
      view: "station",
      stationId: "station-01",
    });
  });

  it("locked puzzle → its station", () => {
    expect(resolveRoute({ view: "puzzle", stationId: "station-01", puzzleId: "puzzle-03" }, ctx)).toEqual({
      view: "station",
      stationId: "station-01",
    });
  });

  it("puzzle in a locked station → studio", () => {
    expect(resolveRoute({ view: "puzzle", stationId: "station-02", puzzleId: "puzzle-04" }, ctx)).toEqual({
      view: "studio",
    });
  });

  it("available puzzle passes through", () => {
    expect(resolveRoute({ view: "puzzle", stationId: "station-01", puzzleId: "puzzle-02" }, ctx)).toEqual({
      view: "puzzle",
      stationId: "station-01",
      puzzleId: "puzzle-02",
    });
  });

  it("grand-canvas requires the final-canvas unlock", () => {
    expect(resolveRoute({ view: "grand-canvas" }, ctx)).toEqual({ view: "studio" });
    const unlocked = { ...ctx, snapshot: snapshot({ stations: [], finalCanvasUnlocked: true }) };
    expect(resolveRoute({ view: "grand-canvas" }, unlocked)).toEqual({ view: "grand-canvas" });
  });

  it("intro is skipped once seen unless explicitly replayed", () => {
    expect(resolveRoute({ view: "intro" }, ctx)).toEqual({ view: "studio" });
    expect(resolveRoute({ view: "intro" }, { ...ctx, introReplayRequested: true })).toEqual({ view: "intro" });
    const fresh = { snapshot: snapshot({ stations: [] }), introSeen: false, introReplayRequested: false };
    expect(resolveRoute({ view: "intro" }, fresh)).toEqual({ view: "intro" });
  });

  it("intro is skipped when there is progress even if introSeen is false", () => {
    const withProgress = {
      snapshot: snapshot({ stations: [], solved: 3 }),
      introSeen: false,
      introReplayRequested: false,
    };
    expect(resolveRoute({ view: "intro" }, withProgress)).toEqual({ view: "studio" });
  });
});
