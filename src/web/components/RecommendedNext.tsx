import type { ReactElement } from "react";
import { Button } from "../design-system";
import { useRecommendedNext } from "../state/selectors";
import { useHashRoute } from "../app/useHashRoute";
import type { Route } from "../app/routes";
import type { RecommendedNext as Recommendation } from "../state/gameStore";

/**
 * The Studio's "what should I do next?" affordance (US2-2, SC-010). Consumes
 * `useRecommendedNext` and links straight to the target station, puzzle or the
 * Grand Canvas; when everything is done it just says so.
 */

function routeFor(rec: Recommendation): Route | null {
  switch (rec.kind) {
    case "station":
      return { view: "station", stationId: rec.stationId };
    case "puzzle":
      return { view: "puzzle", stationId: rec.stationId, puzzleId: rec.puzzleId };
    case "grand-canvas":
      return { view: "grand-canvas" };
    default:
      return null;
  }
}

export function RecommendedNext(): ReactElement {
  const rec = useRecommendedNext();
  const { navigate } = useHashRoute();
  const target = routeFor(rec);

  return (
    <div className="recommended-next">
      <span className="recommended-next__eyebrow">Next up</span>
      {target ? (
        <Button variant="primary" size="lg" onClick={() => navigate(target)}>
          Recommended: {rec.label}
        </Button>
      ) : (
        <p className="recommended-next__done">{rec.label}</p>
      )}
    </div>
  );
}
