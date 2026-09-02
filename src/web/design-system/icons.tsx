import type { ReactElement, SVGProps } from "react";

/**
 * Inline SVG icons — replaces the five `@mui/icons-material` imports
 * (research.md R7) so `@mui/icons-material` can leave `package.json`. Each icon
 * is decorative by default (`aria-hidden`); pass `role="img"` + `aria-label` to
 * make one meaningful on its own.
 */

export type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function Svg({ size = 20, children, ...rest }: IconProps & { children: ReactElement | ReactElement[] }): ReactElement {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={rest["aria-label"] ? undefined : true}
      focusable="false"
      {...rest}
    >
      {children}
    </svg>
  );
}

/** Sparkle — "auto awesome" / auto-solve / reward accent. */
export function AutoAwesomeIcon(props: IconProps): ReactElement {
  return (
    <Svg {...props}>
      <path d="M12 3l1.9 4.6L18.5 9.5 13.9 11.4 12 16l-1.9-4.6L5.5 9.5l4.6-1.9z" />
      <path d="M18 15l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z" />
    </Svg>
  );
}

/** Trophy — milestones / Grand Canvas / "Chromatic Master". */
export function TrophyIcon(props: IconProps): ReactElement {
  return (
    <Svg {...props}>
      <path d="M7 4h10v4a5 5 0 0 1-10 0z" />
      <path d="M7 6H4v2a3 3 0 0 0 3 3M17 6h3v2a3 3 0 0 1-3 3" />
      <path d="M10 13.5V17M14 13.5V17M8 21h8M9 21a3 3 0 0 1 6 0" />
    </Svg>
  );
}

/** Speech bubble — feedback link. */
export function FeedbackIcon(props: IconProps): ReactElement {
  return (
    <Svg {...props}>
      <path d="M4 5h16v11H8l-4 3z" />
      <path d="M8 9h8M8 12h5" />
    </Svg>
  );
}

/** Vertical ellipsis — the app / options menu trigger. */
export function MoreVertIcon(props: IconProps): ReactElement {
  return (
    <Svg {...props}>
      <circle cx="12" cy="5" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="12" cy="19" r="1.4" fill="currentColor" stroke="none" />
    </Svg>
  );
}

/** Paw — Chromatic Pet collection. */
export function PetsIcon(props: IconProps): ReactElement {
  return (
    <Svg {...props}>
      <ellipse cx="7" cy="9" rx="1.7" ry="2.2" fill="currentColor" stroke="none" />
      <ellipse cx="12" cy="7" rx="1.7" ry="2.2" fill="currentColor" stroke="none" />
      <ellipse cx="17" cy="9" rx="1.7" ry="2.2" fill="currentColor" stroke="none" />
      <path
        d="M12 12c-2.5 0-4.5 1.8-4.5 4 0 1.6 1.3 2.5 3 2.5.9 0 1.2-.4 1.5-.4s.6.4 1.5.4c1.7 0 3-.9 3-2.5 0-2.2-2-4-4-4z"
        fill="currentColor"
        stroke="none"
      />
    </Svg>
  );
}

/** Close — the info-modal dismiss control. */
export function CloseIcon(props: IconProps): ReactElement {
  return (
    <Svg {...props}>
      <path d="M6 6l12 12M18 6L6 18" />
    </Svg>
  );
}
