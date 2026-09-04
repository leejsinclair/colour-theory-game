import { describe, expect, it } from "vitest";
import { createGameStore } from "../src/web/state/gameStore";
import { getDemoSolution } from "../src/content/demoSolutions";

describe("gameStore snapshot identity", () => {
  it("keeps unchanged slices referentially stable across notify()", () => {
    const store = createGameStore();
    const before = store.getSnapshot();

    store.getGame().completePuzzle("puzzle-01", getDemoSolution("puzzle-01"));
    store.notify();
    const after = store.getSnapshot();

    // The solved puzzle's station changed identity...
    expect(after.stations).not.toBe(before.stations);
    const station1Before = before.stations.find((s) => s.id === "station-01");
    const station1After = after.stations.find((s) => s.id === "station-01");
    expect(station1After).not.toBe(station1Before);

    // ...but untouched stations and unrelated slices did not.
    const station7Before = before.stations.find((s) => s.id === "station-07");
    const station7After = after.stations.find((s) => s.id === "station-07");
    expect(station7After).toBe(station7Before);
  });

  it("keeps the whole snapshot stable when a mutation changes nothing observable", () => {
    const store = createGameStore();
    const before = store.getSnapshot();

    store.notify();

    expect(store.getSnapshot()).toBe(before);
  });

  it("only re-creates the learning slice when a quiz pass is recorded", () => {
    const store = createGameStore();
    const before = store.getSnapshot();

    store.setLearning({ "puzzle-01": { quizPassed: true } });
    const after = store.getSnapshot();

    expect(after.learning).not.toBe(before.learning);
    expect(after.progress).toBe(before.progress);
    expect(after.pets).toBe(before.pets);
  });
});
