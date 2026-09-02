import { describe, expect, it } from "vitest";
import {
  initialSessionState,
  sessionReducer,
  type SessionState,
  type Toast,
} from "../../src/web/state/sessionReducer";

const toast = (id: string): Toast => ({ id, message: `m-${id}`, kind: "success" });

describe("sessionReducer", () => {
  it("ENTER_PRACTICE / EXIT_PRACTICE set and clear the practice target", () => {
    const entered = sessionReducer(initialSessionState, {
      type: "ENTER_PRACTICE",
      puzzleId: "puzzle-04",
    });
    expect(entered.practicePuzzleId).toBe("puzzle-04");
    expect(sessionReducer(entered, { type: "EXIT_PRACTICE" }).practicePuzzleId).toBeNull();
  });

  it("OPEN_INFO / CLOSE_MODAL toggle the info modal", () => {
    const open = sessionReducer(initialSessionState, { type: "OPEN_INFO", puzzleId: "puzzle-06" });
    expect(open.modal).toEqual({ kind: "info", puzzleId: "puzzle-06" });
    expect(sessionReducer(open, { type: "CLOSE_MODAL" }).modal).toBeNull();
  });

  it("CLOSE_MODAL returns the same reference when no modal is open", () => {
    const next = sessionReducer(initialSessionState, { type: "CLOSE_MODAL" });
    expect(next).toBe(initialSessionState);
  });

  it("PUSH_TOAST / EXPIRE_TOAST manage the toast queue", () => {
    const a = sessionReducer(initialSessionState, { type: "PUSH_TOAST", toast: toast("a") });
    const b = sessionReducer(a, { type: "PUSH_TOAST", toast: toast("b") });
    expect(b.toasts.map((t) => t.id)).toEqual(["a", "b"]);
    const expired = sessionReducer(b, { type: "EXPIRE_TOAST", id: "a" });
    expect(expired.toasts.map((t) => t.id)).toEqual(["b"]);
  });

  it("DISMISS_INTRO / REPLAY_INTRO / RESTORE_INTRO_SEEN drive the intro flags", () => {
    const replay = sessionReducer(initialSessionState, { type: "REPLAY_INTRO" });
    expect(replay.introReplayRequested).toBe(true);

    const dismissed = sessionReducer(replay, { type: "DISMISS_INTRO" });
    expect(dismissed.introDismissedThisSession).toBe(true);
    expect(dismissed.introReplayRequested).toBe(false);

    const restored = sessionReducer(initialSessionState, { type: "RESTORE_INTRO_SEEN" });
    expect(restored.introDismissedThisSession).toBe(true);
  });

  it("CONSUME_SKIP_PERSIST clears the flag once", () => {
    const flagged: SessionState = { ...initialSessionState, skipNextPersist: true };
    const cleared = sessionReducer(flagged, { type: "CONSUME_SKIP_PERSIST" });
    expect(cleared.skipNextPersist).toBe(false);
    expect(sessionReducer(cleared, { type: "CONSUME_SKIP_PERSIST" })).toBe(cleared);
  });

  it("RESET returns to the initial state and arms skipNextPersist", () => {
    const dirty: SessionState = {
      practicePuzzleId: "puzzle-09",
      modal: { kind: "info", puzzleId: "puzzle-09" },
      toasts: [toast("x")],
      introDismissedThisSession: true,
      introReplayRequested: true,
      skipNextPersist: false,
    };
    const reset = sessionReducer(dirty, { type: "RESET" });
    expect(reset).toEqual({ ...initialSessionState, skipNextPersist: true });
  });
});
