import type { HTMLAttributes, ReactElement, ReactNode } from "react";

/**
 * Flatter inset surface — HUD blocks, result regions, sidebars. `tone` styles
 * success/failure result panels; the calling component still supplies an icon +
 * text so state is never colour-only (FR-035).
 */

export type PanelTone = "default" | "success" | "failure";

export type PanelProps = HTMLAttributes<HTMLDivElement> & {
  tone?: PanelTone;
  children: ReactNode;
};

export function Panel({ tone = "default", className, children, ...rest }: PanelProps): ReactElement {
  const cls = ["ds-panel", tone !== "default" && `ds-panel--${tone}`, className]
    .filter(Boolean)
    .join(" ");
  return (
    <div className={cls} {...rest}>
      {children}
    </div>
  );
}
