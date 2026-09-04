import type { GameSnapshot } from "../state/gameStore";

/**
 * Hash navigation (research.md R2, contracts/app-state.md §Navigation).
 * `parseHash` / `serialiseRoute` are pure and total — they never throw.
 * Guard resolution (locked/unknown → studio) lives in `resolveRoute`.
 */

export type Route =
  | { view: "intro" }
  | { view: "studio" }
  | { view: "station"; stationId: string }
  | { view: "puzzle"; stationId: string; puzzleId: string }
  | { view: "collection" }
  | { view: "grand-canvas" };

export const STUDIO_ROUTE: Route = { view: "studio" };
export const INTRO_ROUTE: Route = { view: "intro" };

const STATION_ID = /^station-\d{2}$/;
const PUZZLE_ID = /^puzzle-\d{2}$/;

export function serialiseRoute(route: Route): string {
  switch (route.view) {
    case "intro":
      return "#/intro";
    case "studio":
      return "#/studio";
    case "collection":
      return "#/collection";
    case "grand-canvas":
      return "#/grand-canvas";
    case "station":
      return `#/station/${route.stationId}`;
    case "puzzle":
      return `#/station/${route.stationId}/puzzle/${route.puzzleId}`;
  }
}

/** Pure, total. Anything unrecognised resolves to `studio`. */
export function parseHash(hash: string): Route {
  const clean = hash.replace(/^#\/?/, "").trim();
  if (clean === "" || clean === "studio") {
    return STUDIO_ROUTE;
  }
  if (clean === "intro") {
    return INTRO_ROUTE;
  }
  if (clean === "collection") {
    return { view: "collection" };
  }
  if (clean === "grand-canvas") {
    return { view: "grand-canvas" };
  }

  const parts = clean.split("/");
  if (parts[0] === "station" && parts[1] && STATION_ID.test(parts[1])) {
    if (parts[2] === "puzzle" && parts[3] && PUZZLE_ID.test(parts[3])) {
      return { view: "puzzle", stationId: parts[1], puzzleId: parts[3] };
    }
    if (parts.length === 2) {
      return { view: "station", stationId: parts[1] };
    }
  }

  return STUDIO_ROUTE;
}

export type ResolveContext = {
  snapshot: GameSnapshot;
  introSeen: boolean;
  /** Set true when the player explicitly re-opens the intro from the menu. */
  introReplayRequested: boolean;
};

/**
 * Apply the guard rules (contracts/app-state.md §Guard rules) so a route
 * pointing at a locked/unknown/ineligible target is rewritten before render.
 */
export function resolveRoute(route: Route, ctx: ResolveContext): Route {
  const { snapshot } = ctx;

  switch (route.view) {
    case "intro": {
      const hasProgress = snapshot.progress.solved > 0;
      if (ctx.introReplayRequested) {
        return route;
      }
      if (ctx.introSeen || hasProgress) {
        return STUDIO_ROUTE;
      }
      return route;
    }

    case "studio":
    case "collection":
      return route;

    case "grand-canvas":
      return snapshot.progress.finalCanvasUnlocked ? route : STUDIO_ROUTE;

    case "station": {
      const station = snapshot.stations.find((s) => s.id === route.stationId);
      if (!station || station.status === "locked") {
        return STUDIO_ROUTE;
      }
      return route;
    }

    case "puzzle": {
      const station = snapshot.stations.find((s) => s.id === route.stationId);
      if (!station || station.status === "locked") {
        return STUDIO_ROUTE;
      }
      const puzzle = station.puzzles.find((p) => p.id === route.puzzleId);
      if (!puzzle || puzzle.state === "locked") {
        return { view: "station", stationId: station.id };
      }
      return route;
    }
  }
}

/** The screen `<h1>` for a route (contracts/ui-contract.md §Landmarks). */
export function routeHeading(route: Route, snapshot: GameSnapshot): string {
  switch (route.view) {
    case "intro":
      return "Welcome to the Studio";
    case "studio":
      return "Chromatic Mastery Studio";
    case "collection":
      return "Chromatic Pet Collection";
    case "grand-canvas":
      return "Grand Canvas";
    case "station":
      return snapshot.stations.find((s) => s.id === route.stationId)?.name ?? "Station";
    case "puzzle": {
      const station = snapshot.stations.find((s) => s.id === route.stationId);
      return station?.puzzles.find((p) => p.id === route.puzzleId)?.title ?? "Puzzle";
    }
  }
}
