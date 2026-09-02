import { useEffect, useRef, type ReactElement } from "react";
// The design-system barrel also imports styles.css → design tokens + fonts.
import { LiveRegion, StudioBackdrop } from "../design-system";
import "./app.css";
import { useHashRoute } from "./useHashRoute";
import { useProgress } from "../state/selectors";
import { HUD } from "../components/HUD";
import { ToastHost } from "../components/ToastHost";
import { InfoModal } from "../components/InfoModal";
import { IntroScreen } from "../screens/IntroScreen";
import { StudioScreen } from "../screens/StudioScreen";
import { StationScreen } from "../screens/StationScreen";
import { PuzzleScreen } from "../screens/PuzzleScreen";
import { CollectionScreen } from "../screens/CollectionScreen";
import { GrandCanvasScreen } from "../screens/GrandCanvasScreen";
import type { Route } from "./routes";

/**
 * The React application shell (research.md R14, contracts/ui-contract.md
 * §Landmarks). Rendered inside `<GameProvider>` by `main.tsx`.
 *
 * Owns the `banner` (HUD) / `navigation` / `main` landmarks, the screen switch
 * on `useHashRoute().route`, one `LiveRegion`, the `ToastHost`, the `InfoModal`,
 * and moving focus to the new screen's `<h1>` on every route change.
 */

function screenFor(route: Route): ReactElement {
  switch (route.view) {
    case "intro":
      return <IntroScreen />;
    case "studio":
      return <StudioScreen />;
    case "station":
      return <StationScreen stationId={route.stationId} />;
    case "puzzle":
      return <PuzzleScreen stationId={route.stationId} puzzleId={route.puzzleId} />;
    case "collection":
      return <CollectionScreen />;
    case "grand-canvas":
      return <GrandCanvasScreen />;
  }
}

function routeKey(route: Route): string {
  switch (route.view) {
    case "station":
      return `station:${route.stationId}`;
    case "puzzle":
      return `puzzle:${route.stationId}:${route.puzzleId}`;
    default:
      return route.view;
  }
}

export function App(): ReactElement {
  const { route } = useHashRoute();
  const progress = useProgress();
  const mainRef = useRef<HTMLElement>(null);
  const key = routeKey(route);

  // Move focus to the new screen's <h1> on every route change (FR-009, R14).
  useEffect(() => {
    const heading = mainRef.current?.querySelector<HTMLHeadingElement>("h1");
    if (heading) {
      heading.setAttribute("tabindex", "-1");
      heading.focus();
    }
  }, [key]);

  const isIntro = route.view === "intro";

  return (
    <div className="app-shell">
      <StudioBackdrop />
      <a className="ds-visually-hidden ds-focusable" href="#main-content">
        Skip to main content
      </a>

      {!isIntro ? (
        <header className="app-shell__banner">
          <HUD />
          <nav className="app-shell__nav" aria-label="Game navigation">
            <a
              className="app-shell__nav-link"
              href="#/studio"
              aria-current={route.view === "studio" ? "page" : undefined}
            >
              Studio
            </a>
            <a
              className="app-shell__nav-link"
              href="#/collection"
              aria-current={route.view === "collection" ? "page" : undefined}
            >
              Collection
            </a>
            {progress.finalCanvasUnlocked ? (
              <a
                className="app-shell__nav-link"
                href="#/grand-canvas"
                aria-current={route.view === "grand-canvas" ? "page" : undefined}
              >
                Grand Canvas
              </a>
            ) : null}
          </nav>
        </header>
      ) : null}

      <main id="main-content" className="app-shell__main" ref={mainRef}>
        {screenFor(route)}
      </main>

      <ToastHost />
      <InfoModal />
      <LiveRegion />
    </div>
  );
}
