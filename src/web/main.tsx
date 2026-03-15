import React from "react";
import ReactDOM from "react-dom/client";
import { flushSync } from "react-dom";
import { AppShell } from "./AppShell";

const rootEl = document.getElementById("app");

if (!rootEl) {
  throw new Error("App root element #app not found");
}

const root = ReactDOM.createRoot(rootEl);
flushSync(() => {
  root.render(<AppShell />);
});

void import("./legacyGame");
