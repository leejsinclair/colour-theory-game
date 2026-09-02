import MuiTooltip from "@mui/material/Tooltip";
import type { ReactElement } from "react";

/**
 * Thin skin over MUI `Tooltip` — retained (research.md R7) for hover/focus
 * intent handling. Non-essential supplementary text only; never the sole carrier
 * of meaning (FR-035).
 */

export type TooltipProps = {
  label: string;
  children: ReactElement;
};

export function Tooltip({ label, children }: TooltipProps): ReactElement {
  return (
    <MuiTooltip title={label} enterTouchDelay={0}>
      {children}
    </MuiTooltip>
  );
}
