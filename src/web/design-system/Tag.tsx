import type { HTMLAttributes, ReactElement, ReactNode } from "react";

/**
 * Small categorical label — station type, puzzle count, "Solved". Non-interactive
 * by default; purely a visual grouping cue.
 */

export type TagProps = HTMLAttributes<HTMLSpanElement> & {
  icon?: ReactNode;
  children: ReactNode;
};

export function Tag({ icon, className, children, ...rest }: TagProps): ReactElement {
  const cls = ["ds-tag", className].filter(Boolean).join(" ");
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
