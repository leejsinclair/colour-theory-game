import { useEffect, useRef, type ReactElement } from "react";
import { useSession } from "../state/contexts";
import { getPetSprite } from "../petSprites";

/**
 * Renders the `sessionReducer` toast queue (station-complete, practice points,
 * pet-unlock echo) as transient, auto-expiring messages (spec Baseline
 * "Toasts", FR-036). Mounted once in `App.tsx`. The rich reward/pet celebration
 * lives in `<RewardReveal>`; these are lightweight status confirmations.
 */

const TOAST_TTL_MS = 3200;

export function ToastHost(): ReactElement | null {
  const { state, dispatch } = useSession();
  const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>());

  useEffect(() => {
    const active = timers.current;
    for (const toast of state.toasts) {
      if (!active.has(toast.id)) {
        active.set(
          toast.id,
          setTimeout(() => {
            active.delete(toast.id);
            dispatch({ type: "EXPIRE_TOAST", id: toast.id });
          }, TOAST_TTL_MS),
        );
      }
    }
    // Drop timers for toasts already gone from state.
    for (const [id, handle] of active) {
      if (!state.toasts.some((toast) => toast.id === id)) {
        clearTimeout(handle);
        active.delete(id);
      }
    }
  }, [state.toasts, dispatch]);

  useEffect(() => {
    const active = timers.current;
    return () => {
      for (const handle of active.values()) {
        clearTimeout(handle);
      }
      active.clear();
    };
  }, []);

  if (state.toasts.length === 0) {
    return null;
  }

  return (
    <div className="toast-host">
      {state.toasts.map((toast) => {
        const sprite = toast.petId ? getPetSprite(toast.petId, true) : null;
        return (
          <div
            key={toast.id}
            className={`toast${toast.kind === "success" ? " toast--success" : ""}`}
          >
            {sprite ? (
              <span
                aria-hidden="true"
                style={{
                  backgroundColor: "#fff",
                  width: 28,
                  height: 28,
                  flex: "none",
                  borderRadius: 6,
                  ...sprite.style,
                }}
              />
            ) : toast.icon ? (
              <span aria-hidden="true">{toast.icon}</span>
            ) : null}
            <span>{toast.message}</span>
          </div>
        );
      })}
    </div>
  );
}
