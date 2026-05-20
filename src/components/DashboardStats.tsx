"use client";

import type { Concert } from "@/types/concert";
import { formatCurrency, ticketCostForConcert, totalCost } from "@/lib/concert-utils";
import { CONCERT_BAR_COLORS } from "@/lib/chart-colors";

type DashboardStatsProps = {
  concerts: Concert[];
};

export function DashboardStats({ concerts }: DashboardStatsProps) {
  if (concerts.length === 0) {
    return (
      <div className="hero bg-base-200 rounded-box py-12 px-6 text-center">
        <div className="hero-content">
          <div>
            <h2 className="text-2xl font-bold">No concerts logged yet</h2>
            <p className="py-4 opacity-80 max-w-md mx-auto">
              Add your first concert to start seeing your dashboard.
            </p>
            <a href="/app/add" className="btn btn-primary">
              Add your first concert
            </a>
          </div>
        </div>
      </div>
    );
  }

  const totalSpent = concerts.reduce((s, c) => s + totalCost(c), 0);
  const avgCost = totalSpent / concerts.length;
  const totalTicketSpend = concerts.reduce((s, c) => s + ticketCostForConcert(c), 0);

  const mostExpensive = concerts.reduce((a, c) =>
    totalCost(c) > totalCost(a) ? c : a
  , concerts[0]);
  const leastExpensive = concerts.reduce((a, c) =>
    totalCost(c) < totalCost(a) ? c : a
  , concerts[0]);

  const stats: {
    label: string;
    value: string;
    sub?: string;
    accent: string;
  }[] = [
    {
      label: "Total concerts",
      value: String(concerts.length),
      accent: CONCERT_BAR_COLORS[0],
    },
    {
      label: "Total spent (USD)",
      value: formatCurrency(totalSpent),
      accent: CONCERT_BAR_COLORS[1],
    },
    {
      label: "Average cost per concert",
      value: formatCurrency(avgCost),
      accent: CONCERT_BAR_COLORS[2],
    },
    {
      label: "Total ticket spend",
      value: formatCurrency(totalTicketSpend),
      accent: CONCERT_BAR_COLORS[3],
    },
    {
      label: "Most expensive concert",
      value: mostExpensive?.concert_name ?? "—",
      sub: mostExpensive ? formatCurrency(totalCost(mostExpensive)) : undefined,
      accent: CONCERT_BAR_COLORS[4],
    },
    {
      label: "Lowest cost concert",
      value: leastExpensive?.concert_name ?? "—",
      sub: leastExpensive ? formatCurrency(totalCost(leastExpensive)) : undefined,
      accent: CONCERT_BAR_COLORS[5],
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((s) => (
        <div
          key={s.label}
          className="stat bg-base-100 shadow-md rounded-box border border-base-300 border-l-4 transition-shadow hover:shadow-lg"
          style={{ borderLeftColor: s.accent }}
        >
          <div className="stat-title text-xs uppercase tracking-wide">{s.label}</div>
          <div className="stat-value text-lg leading-tight truncate" title={s.value}>
            {s.value}
          </div>
          {s.sub && <div className="stat-desc">{s.sub}</div>}
        </div>
      ))}
    </div>
  );
}
