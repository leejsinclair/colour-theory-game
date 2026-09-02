import { useEffect, useRef, type ReactElement } from "react";
// The design-system barrel also imports styles.css → design tokens + fonts.
import { LiveRegion, StudioBackdrop } from "../design-system";
import { useHashRoute } from "./useHashRoute";
import { IntroScreen } from "../screens/IntroScreen";
import { StudioScreen } from "../screens/StudioScreen";
import { StationScreen } from "../screens/StationScreen";
import { PuzzleScreen } from "../screens/PuzzleScreen";
import { CollectionScreen } from "../screens/CollectionScreen";
import { GrandCanvasScreen } from "../screens/GrandCanvasScreen";
import type { Route } from "./routes";

/**
 * The React application shell (T027, research.md R14, contracts/ui-contract.md
 * §Landmarks). Rendered inside `<GameProvider>` by `main.tsx` (from T052).
 *
 * Responsibilities: the `banner` / `navigation` / `main` landmarks, the screen
 * switch on `useHashRoute().route`, exactly one `LiveRegion`, and moving focus
 * to the new screen's `<h1>` on every route change. The HUD (T038), `AppMenu`
 * (T039) and `ToastHost` (T047a) land in US1.
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

  return (
    <>
      <StudioBackdrop />
      <a className="ds-visually-hidden ds-focusable" href="#main-content">
        Skip to main content
      </a>

      <header>
        {/* HUD lands in T038 (US1). */}
      </header>

      <nav aria-label="Game navigation">
        {/* Studio / station / collection navigation lands in US1–US2. */}
      </nav>

      <main id="main-content" ref={mainRef}>
        {screenFor(route)}
      </main>

      <LiveRegion />
    </>
  );
}
