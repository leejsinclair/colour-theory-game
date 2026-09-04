import type { HTMLAttributes, ReactElement, ReactNode } from "react";

/**
 * Surface container for selectable content (station cards, pet tiles). Renders
 * as `<article>` by default so each card is a discoverable region; pass
 * `as="div"` for purely presentational grouping.
 */

export type CardProps = HTMLAttributes<HTMLElement> & {
  as?: "article" | "div" | "li";
  interactive?: boolean;
  children: ReactNode;
};

export function Card({
  as: Tag = "article",
  interactive = false,
  className,
  children,
  ...rest
}: CardProps): ReactElement {
  const cls = ["ds-card", interactive && "ds-card--interactive", className]
    .filter(Boolean)
    .join(" ");
  return (
    <Tag className={cls} {...rest}>
      {children}
    </Tag>
  );
}
