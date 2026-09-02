import { useCallback, useEffect, useMemo, useSyncExternalStore } from "react";
import { useGameStore, useSession } from "../state/contexts";
import {
  parseHash,
  resolveRoute,
  serialiseRoute,
  type Route,
} from "./routes";

/**
 * Hash <-> Route mapping with guard resolution (research.md R2,
 * contracts/app-state.md §Navigation). The returned `route` is already
 * guard-resolved; `navigate` sets `location.hash`.
 */

function subscribeHash(onChange: () => void): () => void {
  if (typeof window === "undefined") {
    return () => {};
  }
  window.addEventListener("hashchange", onChange);
  return () => window.removeEventListener("hashchange", onChange);
}

function getHash(): string {
  return typeof window === "undefined" ? "" : window.location.hash;
}

export function useHashRoute(): { route: Route; navigate: (route: Route) => void } {
  const store = useGameStore();
  const { state: session } = useSession();

  const rawHash = useSyncExternalStore(subscribeHash, getHash, () => "");
  const snapshot = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);

  const route = useMemo(
    () =>
      resolveRoute(parseHash(rawHash), {
        snapshot,
        introSeen: session.introDismissedThisSession,
        introReplayRequested: session.introReplayRequested,
      }),
    [rawHash, snapshot, session.introDismissedThisSession, session.introReplayRequested],
  );

  const navigate = useCallback((next: Route): void => {
    if (typeof window === "undefined") {
      return;
    }
    const hash = serialiseRoute(next);
    if (window.location.hash !== hash) {
      window.location.hash = hash;
    }
  }, []);

  // Keep the address bar consistent when a guard rewrote the requested route.
  useEffect(() => {
    const resolvedHash = serialiseRoute(route);
    if (typeof window !== "undefined" && window.location.hash !== resolvedHash) {
      window.history.replaceState(null, "", resolvedHash);
    }
  }, [route]);

  return { route, navigate };
}
