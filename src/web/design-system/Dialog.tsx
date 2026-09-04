import MuiDialog from "@mui/material/Dialog";
import type { ReactElement, ReactNode } from "react";
import { IconButton } from "./IconButton";
import { CloseIcon } from "./icons";

/**
 * Thin skin over MUI `Dialog` — one of only four MUI components retained
 * (research.md R7) for its focus trap, scroll lock, `Escape` handling and
 * `aria` wiring. Default theming is hidden by the `.ds-dialog__*` classes.
 */

export type DialogProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  titleId?: string;
  children: ReactNode;
  /** Extra actions rendered in the footer. */
  footer?: ReactNode;
};

export function Dialog({
  open,
  onClose,
  title,
  titleId = "ds-dialog-title",
  children,
  footer,
}: DialogProps): ReactElement {
  return (
    <MuiDialog
      open={open}
      onClose={onClose}
      aria-labelledby={titleId}
      slotProps={{ paper: { className: "ds-dialog__paper" } }}
    >
      <div className="ds-dialog__title">
        <h2 id={titleId} className="ds-heading ds-heading--3" style={{ margin: 0 }}>
          {title}
        </h2>
        <IconButton label="Close" onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </div>
      <div style={{ padding: "var(--space-lg)", overflowY: "auto" }}>{children}</div>
      {footer ? (
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "var(--space-sm)",
            padding: "var(--space-md) var(--space-lg)",
          }}
        >
          {footer}
        </div>
      ) : null}
    </MuiDialog>
  );
}
