import type { ReactElement } from "react";
import { Heading } from "../design-system";

/**
 * Screen shell (T028). The caretaker intro, "Enter the Studio" / "Skip", and
 * the `markIntroSeen` wiring land in T040 (US1).
 */
export function IntroScreen(): ReactElement {
  return (
    <>
      <Heading level={1} size="hero">
        Welcome to the Studio
      </Heading>
      <p>The Magical Artist&rsquo;s Studio is waking up. Its colour machines need a keeper.</p>
    </>
  );
}
