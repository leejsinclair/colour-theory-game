import ReactDOM from "react-dom/client";
import { GameProvider } from "./state/GameProvider";
import { App } from "./app/App";

/**
 * The single entry point (T052 — the shell flip). React now owns the entire
 * browser UI: no `legacyGame.ts`, no static gameplay DOM skeleton, no
 * `ctg:ready` event.
 */

const rootEl = document.getElementById("root");
if (!rootEl) {
  throw new Error("App root element #root not found");
}

ReactDOM.createRoot(rootEl).render(
  <GameProvider>
    <App />
  </GameProvider>,
);
