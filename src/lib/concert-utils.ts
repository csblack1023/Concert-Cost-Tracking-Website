import { formatUsd, FUN_POINTS_LABEL } from "@/lib/format-usd";
import { ticketsTotalFromGroups } from "@/lib/ticket-utils";
import type { Concert, TicketGroup } from "@/types/concert";

export { formatUsd as formatCurrency, FUN_POINTS_LABEL };

type CostFields = Pick<
  Concert,
  | "ticket_fees"
  | "parking_cost"
  | "food_drink_cost"
  | "merchandise_cost"
  | "lodging_cost"
  | "travel_cost"
  | "other_cost"
>;

export function ticketCostForConcert(
  c: Pick<Concert, "ticket_cost"> & { concert_ticket_groups?: TicketGroup[] }
): number {
  const groups = c.concert_ticket_groups;
  if (groups && groups.length > 0) {
    return ticketsTotalFromGroups(groups);
  }
  return Number(c.ticket_cost) || 0;
}

export function totalCost(
  c: CostFields & Pick<Concert, "ticket_cost"> & { concert_ticket_groups?: TicketGroup[] }
): number {
  return (
    ticketCostForConcert(c) +
    Number(c.ticket_fees) +
    Number(c.parking_cost) +
    Number(c.food_drink_cost) +
    Number(c.merchandise_cost) +
    Number(c.lodging_cost) +
    Number(c.travel_cost) +
    Number(c.other_cost)
  );
}

/** Fun Points per $100 — higher is better value */
export function funPointsPer100(c: Concert): number {
  const cost = totalCost(c);
  if (cost <= 0) return 0;
  return (Number(c.fun_rating) / cost) * 100;
}

export function formatDate(dateStr: string): string {
  const [y, m, d] = dateStr.split("T")[0].split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export const OTHER_COST_FIELDS = [
  { key: "ticket_fees" as const, label: "Ticket fees" },
  { key: "parking_cost" as const, label: "Parking" },
  { key: "food_drink_cost" as const, label: "Food & drink" },
  { key: "merchandise_cost" as const, label: "Merchandise" },
  { key: "lodging_cost" as const, label: "Hotel / lodging" },
  { key: "travel_cost" as const, label: "Travel / gas" },
  { key: "other_cost" as const, label: "Other" },
];

export function topCostCategories(c: Concert, limit = 3): string[] {
  const items: { label: string; amount: number }[] = [
    { label: "Tickets", amount: ticketCostForConcert(c) },
    ...OTHER_COST_FIELDS.map(({ key, label }) => ({
      label,
      amount: Number(c[key]),
    })),
  ];
  return items
    .filter((x) => x.amount > 0)
    .sort((a, b) => b.amount - a.amount)
    .slice(0, limit)
    .map((x) => `${x.label} (${formatUsd(x.amount)})`);
}

const MONTH_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

/** Year used for Jan–Dec monthly chart (current year if any concert, else latest concert year) */
export function spendingChartYear(concerts: Concert[]): number {
  const current = new Date().getFullYear();
  if (concerts.length === 0) return current;
  const hasCurrent = concerts.some(
    (c) => new Date(c.concert_date.split("T")[0]).getFullYear() === current
  );
  if (hasCurrent) return current;
  return Math.max(
    ...concerts.map((c) => new Date(c.concert_date.split("T")[0]).getFullYear())
  );
}

export function monthlySpendingForYear(
  concerts: Concert[],
  year: number
): { month: string; total: number }[] {
  const totals = new Array(12).fill(0);
  for (const c of concerts) {
    const [y, m] = c.concert_date.split("T")[0].split("-").map(Number);
    if (y === year && m >= 1 && m <= 12) {
      totals[m - 1] += totalCost(c);
    }
  }
  return MONTH_SHORT.map((month, i) => ({ month, total: totals[i] }));
}

export function categoryTotals(concerts: Concert[]): { name: string; value: number }[] {
  const totals: Record<string, number> = {};
  for (const c of concerts) {
    const add = (label: string, amount: number) => {
      totals[label] = (totals[label] ?? 0) + amount;
    };
    add("Tickets", ticketCostForConcert(c));
    for (const { key, label } of OTHER_COST_FIELDS) {
      add(label, Number(c[key]));
    }
  }
  return Object.entries(totals)
    .map(([name, value]) => ({ name, value }))
    .filter((x) => x.value > 0);
}
