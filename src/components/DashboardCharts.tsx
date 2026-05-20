"use client";

import type { Concert } from "@/types/concert";
import {
  makeCategoryBarEndLabel,
  ConcertBarShape,
} from "@/components/dashboard/chart-bar-labels";
import {
  categoryTotals,
  formatCurrency,
  monthlySpendingForYear,
  spendingChartYear,
  totalCost,
} from "@/lib/concert-utils";
import {
  CHART_ANIMATION,
  CHART_TOOLTIP_STYLE,
  colorForCategory,
  colorForConcertIndex,
} from "@/lib/chart-colors";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type DashboardChartsProps = {
  concerts: Concert[];
};

export function DashboardCharts({ concerts }: DashboardChartsProps) {
  if (concerts.length === 0) return null;

  const chartYear = spendingChartYear(concerts);
  const monthlyData = monthlySpendingForYear(concerts, chartYear);

  const spendingByCategory = categoryTotals(concerts);
  const categoryTotal = spendingByCategory.reduce((sum, row) => sum + row.value, 0);

  const categoryBarData = spendingByCategory.map((row, i) => {
    const pct = categoryTotal > 0 ? (row.value / categoryTotal) * 100 : 0;
    return {
      ...row,
      fill: colorForCategory(row.name, i),
      pct,
    };
  });

  const byConcert = concerts.map((c, index) => {
    const name =
      c.concert_name.length > 18 ? `${c.concert_name.slice(0, 16)}…` : c.concert_name;
    return {
      name,
      fullName: c.concert_name,
      totalCost: totalCost(c),
      fill: colorForConcertIndex(index),
    };
  });

  const maxCategoryValue = Math.max(...categoryBarData.map((d) => d.value), 1);
  const maxConcertCost = Math.max(...byConcert.map((d) => d.totalCost), 1);
  const CategoryLabel = makeCategoryBarEndLabel(categoryTotal);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-8">
      <ChartCard title="Monthly Concert Spending Trendline">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={monthlyData} margin={{ left: 8, right: 16, top: 8, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.25} />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis tickFormatter={(v) => formatCurrency(v).replace(/\s/g, "")} />
            <Tooltip
              {...CHART_TOOLTIP_STYLE}
              formatter={(v: number) => formatCurrency(Number(v))}
              labelFormatter={(label) => `${label} ${chartYear}`}
            />
            <Line
              {...CHART_ANIMATION}
              type="monotone"
              dataKey="total"
              stroke={colorForConcertIndex(0)}
              strokeWidth={2}
              dot={{ r: 4, fill: colorForConcertIndex(0) }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Cost breakdown by category (USD)" className="dashboard-bar-chart-card">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            className="dashboard-bar-chart"
            data={categoryBarData}
            layout="vertical"
            margin={{ left: 8, right: 56, top: 8, bottom: 8 }}
            accessibilityLayer={false}
          >
            <CartesianGrid strokeDasharray="3 3" opacity={0.25} horizontal={false} />
            <XAxis
              type="number"
              domain={[0, maxCategoryValue * 1.12]}
              tickFormatter={(v) => formatCurrency(v).replace(/\s/g, "")}
            />
            <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 12 }} />
            <Bar
              {...CHART_ANIMATION}
              dataKey="value"
              radius={[0, 6, 6, 0]}
              isAnimationActive={false}
            >
              {categoryBarData.map((entry) => (
                <Cell key={entry.name} fill={entry.fill} />
              ))}
              <LabelList dataKey="value" content={CategoryLabel} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Total cost by concert (USD)" className="xl:col-span-2 dashboard-bar-chart-card">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            className="dashboard-bar-chart"
            data={byConcert}
            margin={{ bottom: 56, left: 8, right: 8, top: 28 }}
            accessibilityLayer={false}
          >
            <CartesianGrid strokeDasharray="3 3" opacity={0.25} />
            <XAxis dataKey="name" angle={-22} textAnchor="end" height={72} interval={0} />
            <YAxis
              domain={[0, maxConcertCost * 1.15]}
              tick={{ fontSize: 12 }}
              tickFormatter={(v) => formatCurrency(v).replace(/\s/g, "")}
            />
            <Bar
              dataKey="totalCost"
              shape={ConcertBarShape}
              isAnimationActive={false}
              activeBar={false}
            >
              {byConcert.map((entry) => (
                <Cell key={entry.fullName} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}

function ChartCard({
  title,
  children,
  className = "",
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`card bg-base-100 shadow-md border border-base-300 ${className}`}>
      <div className="card-body">
        <h3 className="card-title text-base">{title}</h3>
        {children}
      </div>
    </div>
  );
}
