import type { Concert } from "@/types/concert";

export function totalCost(c: Pick<
  Concert,
  | "ticket_cost"
  | "ticket_fees"
  | "parking_cost"
  | "food_drink_cost"
  | "merchandise_cost"
  | "lodging_cost"
  | "travel_cost"
  | "other_cost"
>): number {
  return (
    Number(c.ticket_cost) +
    Number(c.ticket_fees) +
    Number(c.parking_cost) +
    Number(c.food_drink_cost) +
    Number(c.merchandise_cost) +
    Number(c.lodging_cost) +
    Number(c.travel_cost) +
    Number(c.other_cost)
  );
}

export function costPerHour(c: Concert): number {
  const hours = Number(c.hours_at_event);
  if (hours <= 0) return 0;
  return totalCost(c) / hours;
}

/** Fun Points per $100 — higher means better value */
export function funPointsPer100(c: Concert): number {
  const cost = totalCost(c);
  if (cost <= 0) return 0;
  return (Number(c.fun_rating) / cost) * 100;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(dateStr: string): string {
  const [y, m, d] = dateStr.split("T")[0].split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export const COST_CATEGORIES = [
  { key: "ticket_cost" as const, label: "Tickets" },
  { key: "ticket_fees" as const, label: "Ticket fees" },
  { key: "parking_cost" as const, label: "Parking" },
  { key: "food_drink_cost" as const, label: "Food & drink" },
  { key: "merchandise_cost" as const, label: "Merchandise" },
  { key: "lodging_cost" as const, label: "Hotel / lodging" },
  { key: "travel_cost" as const, label: "Travel / gas" },
  { key: "other_cost" as const, label: "Other" },
];

export function topCostCategories(c: Concert, limit = 3): string[] {
  return COST_CATEGORIES.map(({ key, label }) => ({
    label,
    amount: Number(c[key]),
  }))
    .filter((x) => x.amount > 0)
    .sort((a, b) => b.amount - a.amount)
    .slice(0, limit)
    .map((x) => `${x.label} (${formatCurrency(x.amount)})`);
}

export function categoryTotals(concerts: Concert[]): { name: string; value: number }[] {
  const totals: Record<string, number> = {};
  for (const { key, label } of COST_CATEGORIES) {
    totals[label] = concerts.reduce((sum, c) => sum + Number(c[key]), 0);
  }
  return Object.entries(totals)
    .map(([name, value]) => ({ name, value }))
    .filter((x) => x.value > 0);
}
