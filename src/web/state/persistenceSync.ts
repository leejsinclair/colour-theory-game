import { useEffect, useRef } from "react";
import { getDemoSolution } from "../../content/demoSolutions";
import {
  readLocalProgress,
  saveLocalProgress,
  type LocalProgressSnapshot,
} from "../localProgress";
import {
  parseHash,
  resolveRoute,
  serialiseRoute,
  type Route,
} from "../app/routes";
import { useGameStore, useSession } from "./contexts";

const SAVE_DEBOUNCE_MS = 250;

function orderedByNumber(ids: string[]): string[] {
  return [...new Set(ids)].sort((a, b) => {
    const ai = Number(a.split("-")[1] ?? 0);
    const bi = Number(b.split("-")[1] ?? 0);
    return ai - bi;
  });
}

function solvedPuzzleIds(store: ReturnType<typeof useGameStore>): string[] {
  return store
    .getGame()
    .stationManager.getAllStations()
    .flatMap((station) => station.puzzles)
    .filter((puzzle) => puzzle.solved)
    .map((puzzle) => puzzle.id);
}

function stationIdFromHash(): string | null {
  const route = parseHash(typeof window === "undefined" ? "" : window.location.hash);
  return route.view === "station" || route.view === "puzzle" ? route.stationId : null;
}

/** True when `candidate` survives the nav guards unchanged. */
function isPermittedRoute(candidate: Route, store: ReturnType<typeof useGameStore>): boolean {
  const resolved = resolveRoute(candidate, {
    snapshot: store.getSnapshot(),
    introSeen: true,
    introReplayRequested: false,
  });
  return serialiseRoute(resolved) === serialiseRoute(candidate);
}

/**
 * Load on mount, debounced save on change (contracts/persistence.md).
 * Returns nothing — mounted once inside <GameProvider>.
 */
export function usePersistenceSync(): void {
  const store = useGameStore();
  const { state: session, dispatch } = useSession();

  const hadStoredSnapshot = useRef(false);
  const restored = useRef(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sessionRef = useRef(session);
  sessionRef.current = session;
  const scheduleSaveRef = useRef<() => void>(() => {});

  // ── Load / restore (once) ────────────────────────────────────────────────
  useEffect(() => {
    if (restored.current) {
      return;
    }
    restored.current = true;

    const snapshot = readLocalProgress();
    hadStoredSnapshot.current = snapshot !== null;

    if (!snapshot) {
      // Fresh run, no progress — the caretaker intro is the only valid
      // destination (any deep link would be guard-rejected to studio anyway),
      // unless the intro was already dismissed this session
      // (contracts/persistence.md §4).
      if (
        typeof window !== "undefined" &&
        !sessionRef.current.introDismissedThisSession &&
        window.location.hash !== "#/intro"
      ) {
        window.history.replaceState(null, "", "#/intro");
        window.dispatchEvent(new Event("hashchange"));
      }
      return;
    }

    const game = store.getGame();
    for (const puzzleId of orderedByNumber(snapshot.completedPuzzleIds)) {
      game.completePuzzle(puzzleId, getDemoSolution(puzzleId));
    }
    store.setLearning(snapshot.learningProgressByPuzzle ?? {});
    store.notify();

    if (snapshot.introSeen === true) {
      dispatch({ type: "RESTORE_INTRO_SEEN" });
    }

    if (snapshot.practicePuzzleId) {
      const puzzle = game.puzzleManager.getPuzzle(snapshot.practicePuzzleId);
      if (puzzle?.solved) {
        dispatch({ type: "ENTER_PRACTICE", puzzleId: snapshot.practicePuzzleId });
      }
    }

    // ── Initial route (contracts/persistence.md §4) ────────────────────────
    const progress = store.getSnapshot().progress;
    let target: Route | null = null;

    if (snapshot.lastRoute) {
      const candidate = parseHash(snapshot.lastRoute);
      if (isPermittedRoute(candidate, store)) {
        target = candidate;
      }
    }
    if (!target && snapshot.activeStationId) {
      const candidate: Route = { view: "station", stationId: snapshot.activeStationId };
      if (isPermittedRoute(candidate, store)) {
        target = candidate;
      }
    }
    if (!target) {
      target = progress.finalCanvasUnlocked ? { view: "grand-canvas" } : { view: "studio" };
    }

    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", serialiseRoute(target));
      window.dispatchEvent(new Event("hashchange"));
    }
  }, [store, dispatch]);

  // ── Debounced save ─────────────────────────────────────────────────────
  // Subscribed once. `store.subscribe` covers every domain mutation; the
  // effect below adds the persisted session fields that don't notify the store.
  useEffect(() => {
    const runSave = (): void => {
      saveTimer.current = null;
      const currentSession = sessionRef.current;

      if (currentSession.skipNextPersist) {
        // A forced reset already cleared storage. Swallow this write and re-arm
        // the "nothing worth saving" guard so a trailing save can't re-create an
        // empty blob and make the reset user look like a returning one (bug: a
        // reactive re-render used to schedule exactly that second save).
        hadStoredSnapshot.current = false;
        dispatch({ type: "CONSUME_SKIP_PERSIST" });
        return;
      }

      const progress = store.getSnapshot().progress;
      const introDone = currentSession.introDismissedThisSession || progress.solved > 0;

      // Don't clobber a corrupt-but-present (or absent) blob until there is
      // something worth saving (Edge Cases).
      if (!hadStoredSnapshot.current && progress.solved === 0 && !introDone) {
        return;
      }

      const payload: LocalProgressSnapshot = {
        completedPuzzleIds: solvedPuzzleIds(store),
        activeStationId: stationIdFromHash(),
        practicePuzzleId: currentSession.practicePuzzleId,
        learningProgressByPuzzle: store.getLearning(),
        introSeen: introDone ? true : undefined,
        lastRoute:
          typeof window !== "undefined" && window.location.hash
            ? window.location.hash
            : undefined,
      };
      saveLocalProgress(payload);
      hadStoredSnapshot.current = true;
    };

    const scheduleSave = (): void => {
      if (saveTimer.current) {
        clearTimeout(saveTimer.current);
      }
      saveTimer.current = setTimeout(runSave, SAVE_DEBOUNCE_MS);
    };

    scheduleSaveRef.current = scheduleSave;
    const unsubscribe = store.subscribe(scheduleSave);
    scheduleSave();

    const flush = (): void => {
      if (saveTimer.current) {
        clearTimeout(saveTimer.current);
        runSave();
      }
    };
    window.addEventListener("hashchange", scheduleSave);
    window.addEventListener("pagehide", flush);
    document.addEventListener("visibilitychange", flush);

    return () => {
      unsubscribe();
      window.removeEventListener("hashchange", scheduleSave);
      window.removeEventListener("pagehide", flush);
      document.removeEventListener("visibilitychange", flush);
      scheduleSaveRef.current = () => {};
      if (saveTimer.current) {
        clearTimeout(saveTimer.current);
        saveTimer.current = null;
      }
    };
  }, [store, dispatch]);

  // Persisted session fields that `store.subscribe` doesn't cover.
  useEffect(() => {
    scheduleSaveRef.current();
  }, [session.practicePuzzleId, session.introDismissedThisSession]);
}
