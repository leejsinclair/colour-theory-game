import type { HTMLAttributes, ReactElement, ReactNode } from "react";

/**
 * Display-font heading. `level` sets the element (`h1`–`h4`); `size` sets the
 * visual scale independently, so a screen can keep one semantic `<h1>` while
 * sizing it as a hero (contracts/ui-contract.md §Landmarks, FR-053).
 */

export type HeadingLevel = 1 | 2 | 3 | 4;
export type HeadingSize = "hero" | "1" | "2" | "3";

export type HeadingProps = HTMLAttributes<HTMLHeadingElement> & {
  level: HeadingLevel;
  size?: HeadingSize;
  children: ReactNode;
};

export function Heading({ level, size, className, children, ...rest }: HeadingProps): ReactElement {
  const Tag = `h${level}` as const;
  const resolvedSize: HeadingSize = size ?? (String(level) as HeadingSize);
  const cls = ["ds-heading", `ds-heading--${resolvedSize}`, className].filter(Boolean).join(" ");
  return (
    <Tag className={cls} {...rest}>
      {children}
    </Tag>
  );
}
