import type { ReactElement } from "react";
import { Button } from "../design-system";

/**
 * The Check/Submit action for a puzzle — deliberately a plain design-system
 * button rendered *inside* `<PuzzlePlayer>`'s subtree (FR-006), replacing the
 * DOM button the retired `addCheckButton` used to append outside React.
 */

export type CheckButtonProps = {
  disabled?: boolean;
  pending?: boolean;
  label?: string;
  onClick: () => void;
};

export function CheckButton({
  disabled = false,
  pending = false,
  label = "Check",
  onClick,
}: CheckButtonProps): ReactElement {
  return (
    <Button onClick={onClick} disabled={disabled || pending}>
      {pending ? "Checking…" : label}
    </Button>
  );
}
