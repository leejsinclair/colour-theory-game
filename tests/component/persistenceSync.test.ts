import { render, screen, waitFor, cleanup } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createElement, type ReactElement } from "react";
import { GameProvider } from "../../src/web/state/GameProvider";
import { useProgress } from "../../src/web/state/selectors";
import { useGameActions } from "../../src/web/state/contexts";
import { LOCAL_SAVE_KEY } from "../../src/web/localProgress";
import legacySave from "../fixtures/legacy-save-v1.json";

function Probe(): ReactElement {
  const progress = useProgress();
  const actions = useGameActions();
  return createElement(
    "div",
    null,
    createElement("output", { "data-testid": "solved" }, String(progress.solved)),
    createElement("output", { "data-testid": "pets" }, String(progress.petsCollected)),
    createElement("output", { "data-testid": "hash" }, window.location.hash),
    createElement("button", { onClick: () => actions.reset(), type: "button" }, "reset"),
  );
}

function mount() {
  return render(createElement(GameProvider, null, createElement(Probe)));
}

beforeEach(() => {
  window.localStorage.clear();
  window.history.replaceState(null, "", "/");
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("persistenceSync", () => {
  it("restores a real v1 snapshot with zero loss", async () => {
    window.localStorage.setItem(LOCAL_SAVE_KEY, JSON.stringify(legacySave));
    mount();

    await waitFor(() => {
      expect(screen.getByTestId("solved").textContent).toBe("10");
    });
    // one pet per solved puzzle
    expect(screen.getByTestId("pets").textContent).toBe("10");
    // active station restored
    await waitFor(() => {
      expect(screen.getByTestId("hash").textContent).toBe("#/station/station-04");
    });
  });

  it("treats a missing snapshot as a first run (no restore, intro route)", async () => {
    mount();
    await waitFor(() => {
      // no progress; nothing written yet
      expect(window.localStorage.getItem(LOCAL_SAVE_KEY)).toBeNull();
    });
    expect(screen.getByTestId("solved").textContent).toBe("0");
  });

  it("does not overwrite a corrupt blob until the player makes progress", async () => {
    window.localStorage.setItem(LOCAL_SAVE_KEY, "{not-json");
    mount();

    // give the debounced save a chance to (incorrectly) fire
    await new Promise((resolve) => setTimeout(resolve, 400));
    expect(window.localStorage.getItem(LOCAL_SAVE_KEY)).toBe("{not-json");
    expect(screen.getByTestId("solved").textContent).toBe("0");
  });

  it("continues running when localStorage.setItem throws", async () => {
    window.localStorage.setItem(LOCAL_SAVE_KEY, JSON.stringify(legacySave));
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("quota");
    });

    expect(() => mount()).not.toThrow();
    await waitFor(() => {
      expect(screen.getByTestId("solved").textContent).toBe("10");
    });
  });

  it("reset does not let a trailing debounced save re-create an empty blob", async () => {
    window.localStorage.setItem(LOCAL_SAVE_KEY, JSON.stringify(legacySave));
    mount();
    await waitFor(() => expect(screen.getByTestId("solved").textContent).toBe("10"));

    screen.getByRole("button", { name: "reset" }).click();
    await waitFor(() => expect(screen.getByTestId("solved").textContent).toBe("0"));

    // Let every debounced save settle while still mounted — storage must stay clear
    // so the next load treats this as a first run, not a returning player.
    await new Promise((resolve) => setTimeout(resolve, 800));
    expect(window.localStorage.getItem(LOCAL_SAVE_KEY)).toBeNull();
  });

  it("reset then remount returns to a fresh state", async () => {
    window.localStorage.setItem(LOCAL_SAVE_KEY, JSON.stringify(legacySave));
    const view = mount();
    await waitFor(() => expect(screen.getByTestId("solved").textContent).toBe("10"));

    screen.getByRole("button", { name: "reset" }).click();
    await waitFor(() => expect(screen.getByTestId("solved").textContent).toBe("0"));

    view.unmount();
    await waitFor(() => expect(window.localStorage.getItem(LOCAL_SAVE_KEY)).toBeNull());

    mount();
    await waitFor(() => expect(screen.getByTestId("solved").textContent).toBe("0"));
  });
});
