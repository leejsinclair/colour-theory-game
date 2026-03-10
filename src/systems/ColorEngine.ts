export type RGB = { r: number; g: number; b: number };

export class ColorEngine {
  mixRGB(colors: RGB[]): RGB {
    if (colors.length === 0) {
      return { r: 0, g: 0, b: 0 };
    }

    const total = colors.reduce(
      (acc, color) => ({
        r: acc.r + color.r,
        g: acc.g + color.g,
        b: acc.b + color.b,
      }),
      { r: 0, g: 0, b: 0 },
    );

    return {
      r: Math.min(255, total.r),
      g: Math.min(255, total.g),
      b: Math.min(255, total.b),
    };
  }

  mixCMY(cyan: number, magenta: number, yellow: number): RGB {
    // Simple subtractive model from normalized CMY sliders.
    return {
      r: Math.round(255 * (1 - cyan) * (1 - magenta)),
      g: Math.round(255 * (1 - magenta) * (1 - yellow)),
      b: Math.round(255 * (1 - cyan) * (1 - yellow)),
    };
  }

  calculateComplement(hueDegrees: number): number {
    return (hueDegrees + 180) % 360;
  }

  applyAtmosphericPerspective(distance01: number): {
    edgeSharpness: number;
    saturation: number;
    temperatureShift: number;
  } {
    const clamped = Math.max(0, Math.min(1, distance01));
    return {
      edgeSharpness: 1 - clamped,
      saturation: 1 - 0.6 * clamped,
      temperatureShift: 0.4 * clamped,
    };
  }

  simulateOpticalMixing(dots: RGB[]): RGB {
    if (dots.length === 0) {
      return { r: 0, g: 0, b: 0 };
    }

    const total = dots.reduce(
      (acc, dot) => ({
        r: acc.r + dot.r,
        g: acc.g + dot.g,
        b: acc.b + dot.b,
      }),
      { r: 0, g: 0, b: 0 },
    );

    return {
      r: Math.round(total.r / dots.length),
      g: Math.round(total.g / dots.length),
      b: Math.round(total.b / dots.length),
    };
  }
}
