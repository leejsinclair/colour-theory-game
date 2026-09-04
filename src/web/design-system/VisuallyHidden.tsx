import type { ElementType, ReactElement, ReactNode } from "react";

/**
 * Visually hidden but screen-reader-available text. Used for skip links, extra
 * context on icon-only affordances, and off-screen headings.
 */

export type VisuallyHiddenProps = {
  as?: ElementType;
  children: ReactNode;
};

export function VisuallyHidden({ as: Tag = "span", children }: VisuallyHiddenProps): ReactElement {
  return <Tag className="ds-visually-hidden">{children}</Tag>;
}
