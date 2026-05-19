"use client";

import type { Concert } from "@/types/concert";
import {
  categoryTotals,
  funPointsPer100,
  totalCost,
} from "@/lib/concert-utils";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const CHART_COLORS = [
  "oklch(var(--p))",
  "oklch(var(--s))",
  "oklch(var(--a))",
  "oklch(var(--in))",
  "oklch(var(--su))",
  "oklch(var(--wa))",
  "oklch(var(--er))",
  "oklch(var(--n))",
];

type DashboardChartsProps = {
  concerts: Concert[];
};

export function DashboardCharts({ concerts }: DashboardChartsProps) {
  if (concerts.length === 0) return null;

  const spendingByCategory = categoryTotals(concerts);
  const byConcert = concerts.map((c) => {
    const name =
      c.concert_name.length > 18 ? `${c.concert_name.slice(0, 16)}…` : c.concert_name;
    return {
      name,
      fullName: c.concert_name,
      totalCost: totalCost(c),
      funRating: Number(c.fun_rating),
      funPer100: funPointsPer100(c),
    };
  });

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-8">
      <ChartCard title="Spending by cost category">
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={spendingByCategory}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={90}
              label={({ name, percent }: { name: string; percent?: number }) =>
                `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
              }
            >
              {spendingByCategory.map((_, i) => (
                <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(v: number) => `$${v.toFixed(2)}`} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Total cost by concert">
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={byConcert} margin={{ bottom: 48 }}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis dataKey="name" angle={-25} textAnchor="end" height={70} interval={0} />
            <YAxis tickFormatter={(v) => `$${v}`} />
            <Tooltip
              formatter={(v: number) => [`$${v.toFixed(2)}`, "Total cost"]}
              labelFormatter={(_, payload) =>
                payload?.[0]?.payload?.fullName ?? ""
              }
            />
            <Bar dataKey="totalCost" fill="oklch(var(--p))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Fun rating by concert">
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={byConcert} margin={{ bottom: 48 }}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis dataKey="name" angle={-25} textAnchor="end" height={70} interval={0} />
            <YAxis domain={[0, 10]} />
            <Tooltip labelFormatter={(_, payload) => payload?.[0]?.payload?.fullName ?? ""} />
            <Bar dataKey="funRating" fill="oklch(var(--s))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Fun Points per $100 by concert">
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={byConcert} margin={{ bottom: 48 }}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis dataKey="name" angle={-25} textAnchor="end" height={70} interval={0} />
            <YAxis />
            <Tooltip
              formatter={(v: number) => [v.toFixed(2), "Fun Points per $100"]}
              labelFormatter={(_, payload) => payload?.[0]?.payload?.fullName ?? ""}
            />
            <Bar dataKey="funPer100" fill="oklch(var(--a))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card bg-base-100 shadow-md border border-base-300">
      <div className="card-body">
        <h3 className="card-title text-base">{title}</h3>
        {children}
      </div>
    </div>
  );
}
