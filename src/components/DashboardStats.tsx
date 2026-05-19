import type { Concert } from "@/types/concert";
import {
  costPerHour,
  formatCurrency,
  funPointsPer100,
  totalCost,
} from "@/lib/concert-utils";

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
              No concerts logged yet. Add your first concert to start seeing your dashboard.
            </p>
            <a href="/app/add" className="btn btn-primary">
              Add your first concert
            </a>
          </div>
        </div>
      </div>
    );
  }

  const totals = concerts.map(totalCost);
  const totalSpent = totals.reduce((a, b) => a + b, 0);
  const avgCost = totalSpent / concerts.length;
  const avgFun =
    concerts.reduce((s, c) => s + Number(c.fun_rating), 0) / concerts.length;
  const avgCostPerHour =
    concerts.reduce((s, c) => s + costPerHour(c), 0) / concerts.length;

  const withCost = concerts.filter((c) => totalCost(c) > 0);
  const bestValue =
    withCost.length > 0
      ? withCost.reduce((best, c) =>
          funPointsPer100(c) > funPointsPer100(best) ? c : best
        )
      : null;
  const mostExpensive = concerts.reduce((a, c) =>
    totalCost(c) > totalCost(a) ? c : a
  , concerts[0]);
  const highestFun = concerts.reduce((a, c) =>
    Number(c.fun_rating) > Number(a.fun_rating) ? c : a
  , concerts[0]);

  const stats = [
    { label: "Total concerts", value: String(concerts.length) },
    { label: "Total amount spent", value: formatCurrency(totalSpent) },
    { label: "Average cost per concert", value: formatCurrency(avgCost) },
    { label: "Average fun rating", value: avgFun.toFixed(1) },
    { label: "Average cost per hour", value: formatCurrency(avgCostPerHour) },
    {
      label: "Best value concert",
      value: bestValue?.concert_name ?? "—",
      sub: bestValue ? `${funPointsPer100(bestValue).toFixed(2)} Fun Points per $100` : undefined,
    },
    {
      label: "Most expensive concert",
      value: mostExpensive?.concert_name ?? "—",
      sub: mostExpensive ? formatCurrency(totalCost(mostExpensive)) : undefined,
    },
    {
      label: "Highest fun rating",
      value: highestFun?.concert_name ?? "—",
      sub: highestFun ? `${highestFun.fun_rating} / 10` : undefined,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((s) => (
        <div key={s.label} className="stat bg-base-100 shadow-md rounded-box border border-base-300">
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
