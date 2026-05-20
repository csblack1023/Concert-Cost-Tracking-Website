"use client";

import { formatCurrency } from "@/lib/concert-utils";
import {
  CHART_AXIS_TICK_FONT_SIZE,
  labelColorsForBar,
  MIN_HORIZONTAL_BAR_WIDTH_FOR_INSIDE_LABEL,
  MIN_VERTICAL_BAR_HEIGHT_FOR_INSIDE_LABEL,
  OUTSIDE_LABEL_OFFSET,
} from "@/lib/chart-labels";

type BarRow = {
  fill?: string;
  value?: number;
  totalCost?: number;
  pct?: number;
};

type RechartsBarLabelProps = {
  x?: number | string;
  y?: number | string;
  width?: number | string;
  height?: number | string;
  value?: number | string;
  index?: number;
  payload?: BarRow;
};

function num(v: number | string | undefined, fallback = 0): number {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function rowFromProps(props: RechartsBarLabelProps): BarRow {
  const p = props.payload;
  if (p && typeof p === "object") return p as BarRow;
  return {};
}

/** Factory — pct computed from amount / total so labels always show correct % */
export function makeCategoryBarEndLabel(categoryTotal: number) {
  return function CategoryBarEndLabel(props: RechartsBarLabelProps) {
    const x = num(props.x);
    const y = num(props.y);
    const width = num(props.width);
    const height = num(props.height);
    const row = rowFromProps(props);
    const amount = num(props.value ?? row.value);
    const pct =
      row.pct ??
      (categoryTotal > 0 ? (amount / categoryTotal) * 100 : 0);
    const fill = row.fill ?? "#4f46e5";
    const colors = labelColorsForBar(fill);

    const costStr = formatCurrency(amount).replace(/\s/g, "");
    const pctStr = pct < 10 && pct > 0 ? pct.toFixed(1) : pct.toFixed(0);
    const text = `${costStr}  (${pctStr}%)`;

    const cy = y + height / 2;
    const fitsInside = width >= MIN_HORIZONTAL_BAR_WIDTH_FOR_INSIDE_LABEL;

    if (fitsInside) {
      return (
        <text
          x={x + width - OUTSIDE_LABEL_OFFSET}
          y={cy}
          fill={colors.inside}
          textAnchor="end"
          dominantBaseline="middle"
          fontSize={11}
          fontWeight={600}
        >
          {text}
        </text>
      );
    }

    return (
      <text
        x={x + width + OUTSIDE_LABEL_OFFSET}
        y={cy}
        fill={colors.outside}
        textAnchor="start"
        dominantBaseline="middle"
        fontSize={11}
        fontWeight={600}
      >
        {text}
      </text>
    );
  };
}

type ConcertBarShapeProps = RechartsBarLabelProps & {
  fill?: string;
  background?: unknown;
};

/** Custom bar + label — avoids LabelList / tooltip overlap on the concert chart */
export function ConcertBarShape(props: unknown) {
  const p = props as ConcertBarShapeProps;
  const x = num(p.x);
  const y = num(p.y);
  const width = num(p.width);
  const height = num(p.height);
  const row = rowFromProps(p);
  const amount = num(p.value ?? row.totalCost);
  const fill = p.fill ?? row.fill ?? "#4f46e5";
  const colors = labelColorsForBar(fill);
  const costStr = formatCurrency(amount).replace(/\s/g, "");
  const fitsInside = height >= MIN_VERTICAL_BAR_HEIGHT_FOR_INSIDE_LABEL;

  const labelX = x + width / 2;
  const labelY = fitsInside ? y + height / 2 : y - OUTSIDE_LABEL_OFFSET;

  return (
    <g className="recharts-bar-rectangle">
      <rect x={x} y={y} width={width} height={height} fill={fill} rx={6} ry={6} />
      <text
        x={labelX}
        y={labelY}
        fill={fitsInside ? colors.inside : colors.outside}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={CHART_AXIS_TICK_FONT_SIZE}
        fontWeight={600}
        pointerEvents="none"
      >
        {costStr}
      </text>
    </g>
  );
}

/** Vertical bar (per concert): total cost at the top-right inside the bar */
export function ConcertBarEndLabel(props: RechartsBarLabelProps) {
  const x = num(props.x);
  const y = num(props.y);
  const width = num(props.width);
  const height = num(props.height);
  const row = rowFromProps(props);
  const amount = num(props.value ?? row.totalCost);
  const fill = row.fill ?? "#4f46e5";
  const colors = labelColorsForBar(fill);
  const costStr = formatCurrency(amount).replace(/\s/g, "");

  const fitsInside = height >= MIN_VERTICAL_BAR_HEIGHT_FOR_INSIDE_LABEL;

  if (fitsInside) {
    return (
      <text
        x={x + width - OUTSIDE_LABEL_OFFSET}
        y={y + 14}
        fill={colors.inside}
        textAnchor="end"
        dominantBaseline="middle"
        fontSize={11}
        fontWeight={600}
      >
        {costStr}
      </text>
    );
  }

  return (
    <text
      x={x + width / 2}
      y={y - OUTSIDE_LABEL_OFFSET}
      fill={colors.outside}
      textAnchor="middle"
      dominantBaseline="auto"
      fontSize={11}
      fontWeight={600}
    >
      {costStr}
    </text>
  );
}
