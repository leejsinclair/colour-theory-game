import type { HTMLAttributes, ReactElement, ReactNode } from "react";

/**
 * Status / milestone pill. Always renders an icon slot next to the label so
 * meaning never rests on colour alone (FR-035, SC-008).
 */

export type BadgeTone = "default" | "gold" | "success" | "locked";

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: BadgeTone;
  icon?: ReactNode;
  children: ReactNode;
};

export function Badge({ tone = "default", icon, className, children, ...rest }: BadgeProps): ReactElement {
  const cls = ["ds-badge", tone !== "default" && `ds-badge--${tone}`, className]
    .filter(Boolean)
    .join(" ");
  return (
    <span className={cls} {...rest}>
      {icon ? (
        <span aria-hidden="true" style={{ display: "inline-flex" }}>
          {icon}
        </span>
      ) : null}
      {children}
    </span>
  );
}
