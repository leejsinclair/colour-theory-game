import MuiMenu from "@mui/material/Menu";
import MuiMenuItem from "@mui/material/MenuItem";
import { useId, useState, type ReactElement, type ReactNode } from "react";
import { IconButton } from "./IconButton";

/**
 * Thin skin over MUI `Menu` — retained (research.md R7) for roving focus,
 * `Escape`, type-ahead and correct `menu` / `menuitem` roles. The trigger is a
 * design-system `IconButton`; items are plain objects so callers stay declarative.
 */

export type MenuItemSpec = {
  key: string;
  label: string;
  onSelect: () => void;
  disabled?: boolean;
  /** Destructive item — rendered with failure colour and a top divider. */
  tone?: "danger";
};

export type MenuProps = {
  triggerLabel: string;
  triggerIcon: ReactNode;
  items: MenuItemSpec[];
};

export function Menu({ triggerLabel, triggerIcon, items }: MenuProps): ReactElement {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const menuId = useId();
  const open = Boolean(anchor);

  return (
    <>
      <IconButton
        label={triggerLabel}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={(event) => setAnchor(event.currentTarget)}
      >
        {triggerIcon}
      </IconButton>
      <MuiMenu
        id={menuId}
        anchorEl={anchor}
        open={open}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{ paper: { className: "ds-menu__paper" } }}
      >
        {items.map((item) => (
          <MuiMenuItem
            key={item.key}
            disabled={item.disabled}
            className={item.tone === "danger" ? "ds-menu__item--danger" : undefined}
            onClick={() => {
              setAnchor(null);
              item.onSelect();
            }}
          >
            {item.label}
          </MuiMenuItem>
        ))}
      </MuiMenu>
    </>
  );
}
