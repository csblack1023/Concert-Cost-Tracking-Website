/**
 * Dashboard chart palette — fixed hex colors readable on light and dark backgrounds.
 * Maps cost category labels to distinct colors.
 */
export const CATEGORY_COLORS: Record<string, string> = {
  Tickets: "#4f46e5",
  "Ticket fees": "#7c3aed",
  Parking: "#0284c7",
  "Food & drink": "#0d9488",
  Merchandise: "#d97706",
  "Hotel / lodging": "#db2777",
  "Travel / gas": "#16a34a",
  Other: "#64748b",
};

/** Colors for per-concert bars (cycle when there are many shows) */
export const CONCERT_BAR_COLORS = [
  "#4f46e5",
  "#0d9488",
  "#d97706",
  "#db2777",
  "#2563eb",
  "#059669",
  "#7c3aed",
  "#dc2626",
  "#0891b2",
  "#ca8a04",
];

export function colorForCategory(name: string, fallbackIndex = 0): string {
  return (
    CATEGORY_COLORS[name] ??
    CONCERT_BAR_COLORS[fallbackIndex % CONCERT_BAR_COLORS.length]
  );
}

export function colorForConcertIndex(index: number): string {
  return CONCERT_BAR_COLORS[index % CONCERT_BAR_COLORS.length];
}

/** Shared Recharts tooltip + grid styling */
export const CHART_TOOLTIP_STYLE = {
  contentStyle: {
    borderRadius: "8px",
    border: "1px solid oklch(var(--bc) / 0.2)",
    background: "oklch(var(--b1))",
    color: "oklch(var(--bc))",
  },
  cursor: { fill: "oklch(var(--p) / 0.12)" },
};

export const CHART_ANIMATION = { animationDuration: 600, animationEasing: "ease-out" as const };
