/**
 * A one-shot flag: `persistenceSync` flips it once its initial load/restore has
 * resolved the starting route. Until then `useHashRoute` must not "correct" the
 * URL — the first render happens against a fresh (un-restored) game, so a deep
 * link would look locked and get rewritten to `studio` before the replay lands.
 */

let ready = false;

export function markNavReady(): void {
  ready = true;
}

export function isNavReady(): boolean {
  return ready;
}

/** Test helper. */
export function __resetNavReady(): void {
  ready = false;
}
