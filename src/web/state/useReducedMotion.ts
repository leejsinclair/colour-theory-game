import { useEffect, useSyncExternalStore } from "react";

/**
 * `prefers-reduced-motion: reduce` as a reactive boolean (FR-047).
 * Also mirrors the value onto `<html data-reduced-motion>` so token CSS and
 * imperative effects can branch (research.md R8).
 */

const QUERY = "(prefers-reduced-motion: reduce)";

function getMatch(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }
  return window.matchMedia(QUERY).matches;
}

function subscribe(onChange: () => void): () => void {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return () => {};
  }
  const mql = window.matchMedia(QUERY);
  const handler = (): void => onChange();
  mql.addEventListener("change", handler);
  return () => mql.removeEventListener("change", handler);
}

function syncAttribute(reduced: boolean): void {
  if (typeof document === "undefined") {
    return;
  }
  document.documentElement.dataset.reducedMotion = String(reduced);
}

export function useReducedMotion(): boolean {
  const reduced = useSyncExternalStore(subscribe, getMatch, () => false);
  useEffect(() => {
    syncAttribute(reduced);
  }, [reduced]);
  return reduced;
}
