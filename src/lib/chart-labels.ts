/** Relative luminance (0–1) for hex colors — pick readable label contrast */
export function hexLuminance(hex: string): number {
  const normalized = hex.replace("#", "");
  if (normalized.length !== 6) return 0.4;
  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

export function labelColorsForBar(fill: string): { inside: string; outside: string } {
  const lightBar = hexLuminance(fill) > 0.55;
  return lightBar
    ? { inside: "#1e293b", outside: "#334155" }
    : { inside: "#ffffff", outside: "#334155" };
}

/** Minimum bar size (px) to keep labels inside */
export const MIN_HORIZONTAL_BAR_WIDTH_FOR_INSIDE_LABEL = 88;
export const MIN_VERTICAL_BAR_HEIGHT_FOR_INSIDE_LABEL = 32;
export const OUTSIDE_LABEL_OFFSET = 6;

/** Match Recharts axis tick size used on dashboard charts */
export const CHART_AXIS_TICK_FONT_SIZE = 12;
