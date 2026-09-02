/**
 * Design-system barrel. Importing this once (from `App.tsx`) also pulls in
 * `styles.css` → `tokens.css` + `fonts.css`, so every screen has the tokens.
 */

import "./styles.css";

export { Button } from "./Button";
export type { ButtonProps, ButtonSize, ButtonVariant } from "./Button";
export { IconButton } from "./IconButton";
export type { IconButtonProps } from "./IconButton";
export { Card } from "./Card";
export type { CardProps } from "./Card";
export { Panel } from "./Panel";
export type { PanelProps, PanelTone } from "./Panel";
export { Heading } from "./Heading";
export type { HeadingLevel, HeadingProps, HeadingSize } from "./Heading";
export { Badge } from "./Badge";
export type { BadgeProps, BadgeTone } from "./Badge";
export { Tag } from "./Tag";
export type { TagProps } from "./Tag";

export { Dialog } from "./Dialog";
export type { DialogProps } from "./Dialog";
export { Menu } from "./Menu";
export type { MenuItemSpec, MenuProps } from "./Menu";
export { Slider } from "./Slider";
export type { SliderProps } from "./Slider";
export { Tooltip } from "./Tooltip";
export type { TooltipProps } from "./Tooltip";

export { LiveRegion, announce } from "./LiveRegion";
export { VisuallyHidden } from "./VisuallyHidden";
export type { VisuallyHiddenProps } from "./VisuallyHidden";
export { ProgressBar } from "./ProgressBar";
export type { ProgressBarProps } from "./ProgressBar";
export { ProgressRing } from "./ProgressRing";
export type { ProgressRingProps } from "./ProgressRing";

export { CelebrationBurst } from "./CelebrationBurst";
export type { CelebrationBurstProps } from "./CelebrationBurst";
export { StudioBackdrop } from "./StudioBackdrop";

export * from "./icons";
