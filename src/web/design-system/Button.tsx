import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactElement, ReactNode } from "react";

/**
 * Custom-styled button (FR-048). Semantic `<button>` by default; renders an
 * `<a>` when `href` is given so link-like actions stay real links. The token
 * focus ring is shared via `.ds-button` in `styles.css`.
 */

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

type CommonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  block?: boolean;
  children: ReactNode;
};

type ButtonAsButton = CommonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className"> & { href?: undefined };

type ButtonAsLink = CommonProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "className"> & { href: string };

export type ButtonProps = ButtonAsButton | ButtonAsLink;

function classes(variant: ButtonVariant, size: ButtonSize, block: boolean): string {
  return [
    "ds-button",
    `ds-button--${variant}`,
    size !== "md" && `ds-button--${size}`,
    block && "ds-button--block",
  ]
    .filter(Boolean)
    .join(" ");
}

export function Button(props: ButtonProps): ReactElement {
  const { variant = "primary", size = "md", block = false, children, ...rest } = props;
  const className = classes(variant, size, block);

  if ("href" in rest && rest.href !== undefined) {
    return (
      <a className={className} {...(rest as AnchorHTMLAttributes<HTMLAnchorElement>)}>
        {children}
      </a>
    );
  }

  const buttonRest = rest as ButtonHTMLAttributes<HTMLButtonElement>;
  return (
    <button className={className} type={buttonRest.type ?? "button"} {...buttonRest}>
      {children}
    </button>
  );
}
