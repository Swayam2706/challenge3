"use client";

import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { HistoryEntry } from "@/lib/storage";

interface TrendChartProps {
  history: HistoryEntry[];
}

/**
 * An area chart of footprint estimates over time.
 *
 * Marked `aria-hidden`: the parent renders an equivalent screen-reader data
 * table and a text summary of the trend, so no information is locked in SVG.
 */
export function TrendChart({ history }: TrendChartProps) {
  const data = history.map((entry) => ({
    date: new Date(entry.date).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    }),
    tonnes: Number((entry.totalAnnualKg / 1000).toFixed(2)),
  }));

  return (
    <div className="h-48 w-full" aria-hidden="true">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 8, right: 8, bottom: 0, left: -16 }}
        >
          <defs>
            <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#059669" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#059669" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: "#94a3b8" }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#94a3b8" }}
            tickLine={false}
            axisLine={false}
            width={48}
            unit="t"
          />
          <Tooltip
            contentStyle={{
              borderRadius: 12,
              border: "1px solid #e2e8f0",
              fontSize: 12,
            }}
            formatter={(value: number) => [`${value} t`, "Footprint"]}
          />
          <Area
            type="monotone"
            dataKey="tonnes"
            stroke="#059669"
            strokeWidth={2.5}
            fill="url(#trendFill)"
            dot={{ r: 3, fill: "#047857" }}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
