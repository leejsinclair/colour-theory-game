import { useSyncExternalStore, type ReactElement } from "react";

/**
 * One app-level polite `aria-live` region (research.md R14, FR-036). Mount
 * `<LiveRegion />` once in `App.tsx`; call `announce(message)` from anywhere
 * (screens, actions, puzzle components via the `announce` prop) to push a
 * screen-reader status update — puzzle results, station unlocks, pet reveals,
 * "cap reached".
 *
 * The message is cleared shortly after so re-announcing the same string later
 * still fires. A monotonic counter guarantees a DOM text change even for
 * identical consecutive messages.
 */

let current = "";
let token = 0;
const listeners = new Set<() => void>();
let clearTimer: ReturnType<typeof setTimeout> | undefined;

function emit(): void {
  for (const listener of listeners) {
    listener();
  }
}

export function announce(message: string): void {
  const trimmed = message.trim();
  if (!trimmed) {
    return;
  }
  current = trimmed;
  token += 1;
  emit();
  if (clearTimer) {
    clearTimeout(clearTimer);
  }
  clearTimer = setTimeout(() => {
    current = "";
    token += 1;
    emit();
  }, 4000);
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Test / reset helper — not used in app code. */
export function __resetLiveRegion(): void {
  current = "";
  token = 0;
  if (clearTimer) {
    clearTimeout(clearTimer);
    clearTimer = undefined;
  }
  emit();
}

export function LiveRegion(): ReactElement {
  // Subscribe on the monotonic token so identical consecutive messages (and the
  // auto-clear) still force a DOM text change; the text itself is read live.
  useSyncExternalStore(
    subscribe,
    () => token,
    () => token,
  );
  const message = current;
  return (
    <div className="ds-visually-hidden" role="status" aria-live="polite" aria-atomic="true">
      {message}
    </div>
  );
}
