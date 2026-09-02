import type { ReactElement } from "react";
import { Button, Heading } from "../design-system";
import { useGameActions } from "../state/contexts";
import { useHashRoute } from "../app/useHashRoute";

/**
 * The caretaker intro (FR-030a). Shown only when `introSeen !== true` and there
 * is no progress (guarded in `resolveRoute`), or when replayed from the menu.
 * Both actions mark the intro seen and enter the Studio.
 */

const LINES = [
  "The Magical Artist's Studio has gone dark. Its colour machines — puzzle apparatus that teach how light, pigment and perception really work — are waiting for a keeper.",
  "Each station holds a few machines. Solve one and you free a Chromatic Pet; finish a station and the next lights up.",
  "Rescue every pet and the Grand Canvas opens.",
];

export function IntroScreen(): ReactElement {
  const actions = useGameActions();
  const { navigate } = useHashRoute();

  const enter = (): void => {
    actions.markIntroSeen();
    navigate({ view: "studio" });
  };

  return (
    <section className="screen">
      <Heading level={1} size="hero">
        Welcome to the Studio
      </Heading>
      {LINES.map((line, index) => (
        <p key={index} className="screen__lede">
          {line}
        </p>
      ))}
      <div className="screen__actions">
        <Button onClick={enter}>Enter the Studio</Button>
        <Button variant="ghost" onClick={enter}>
          Skip
        </Button>
      </div>
    </section>
  );
}
