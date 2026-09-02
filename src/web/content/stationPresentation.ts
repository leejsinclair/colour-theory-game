/**
 * Presentation-only copy for the Studio station cards (US2, FR-028, FR-029).
 *
 * No game rules live here — the domain (`src/content/gameContent.ts`) owns
 * station identity, order and unlock logic. This module only supplies the short
 * "what you'll do here" line and the per-station hue token used to give each
 * card a distinct game-world identity.
 */

export type StationPresentation = {
  /** Short in-world description for the Studio card. */
  blurb: string;
  /** `design-system/tokens.css` custom property carrying this station's hue. */
  accentVar: string;
};

const PRESENTATION: Record<string, StationPresentation> = {
  "station-01": {
    blurb: "Mix beams of coloured light and watch red, green and blue add up to white.",
    accentVar: "--station-01",
  },
  "station-02": {
    blurb: "Train your eye for light and shadow — order the tones from bright to dark.",
    accentVar: "--station-02",
  },
  "station-03": {
    blurb: "Spin the wheel to learn hue families, complements and harmonious triads.",
    accentVar: "--station-03",
  },
  "station-04": {
    blurb: "See how neighbouring colours trick the eye — one swatch, two faces.",
    accentVar: "--station-04",
  },
  "station-05": {
    blurb: "Paint depth and air as colours cool and fade toward the horizon.",
    accentVar: "--station-05",
  },
  "station-06": {
    blurb: "Get your hands dirty at the bench, mixing pigments warm, cool, clean and muted.",
    accentVar: "--station-06",
  },
  "station-07": {
    blurb: "Bring it all together into palettes that carry a mood and a message.",
    accentVar: "--station-07",
  },
};

/**
 * Presentation for `stationId`, falling back to a generic blurb and an
 * index-derived hue so an unrecognised station still renders sensibly.
 */
export function stationPresentation(stationId: string, index: number): StationPresentation {
  return (
    PRESENTATION[stationId] ?? {
      blurb: "A colour machine hums in the dark, waiting to be switched on.",
      accentVar: `--station-0${Math.min(index + 1, 7)}`,
    }
  );
}
