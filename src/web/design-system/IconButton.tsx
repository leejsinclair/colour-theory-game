import type { ButtonHTMLAttributes, ReactElement, ReactNode } from "react";

/**
 * Icon-only button. `label` is required — it becomes the accessible name, since
 * there is no visible text (FR-053). The icon itself is marked decorative.
 */

export type IconButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "aria-label"> & {
  label: string;
  children: ReactNode;
};

export function IconButton({ label, children, type, ...rest }: IconButtonProps): ReactElement {
  return (
    <button className="ds-icon-button" type={type ?? "button"} aria-label={label} {...rest}>
      <span aria-hidden="true" style={{ display: "inline-flex" }}>
        {children}
      </span>
    </button>
  );
}
