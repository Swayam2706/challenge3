"use client";

import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { formatTonnes } from "@/lib/format";
import type { CategoryResult } from "@/lib/carbon/types";

interface CategoryDonutProps {
  breakdown: CategoryResult[];
  totalTonnes: number;
}

export const CATEGORY_COLORS: Record<string, string> = {
  transport: "#059669",
  energy: "#f59e0b",
  diet: "#f43f5e",
  goods: "#6366f1",
};

/**
 * A donut chart of emissions share by category.
 *
 * The chart is decorative: it is marked `aria-hidden` because the parent
 * component renders the same data as an accessible legend and a screen-reader
 * data table. This keeps the visual rich without trapping information in SVG.
 */
export function CategoryDonut({ breakdown, totalTonnes }: CategoryDonutProps) {
  const data = breakdown.map((b) => ({
    name: b.label,
    value: b.annualKg,
    category: b.category,
  }));

  return (
    <div className="relative h-44 w-44 shrink-0" aria-hidden="true">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={56}
            outerRadius={80}
            paddingAngle={2}
            stroke="none"
            isAnimationActive={false}
          >
            {data.map((entry) => (
              <Cell
                key={entry.category}
                fill={CATEGORY_COLORS[entry.category] ?? "#059669"}
              />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xs text-slate-500 dark:text-slate-400">Total</span>
        <span className="text-lg font-bold text-slate-900 dark:text-slate-100">
          {formatTonnes(totalTonnes)}
        </span>
      </div>
    </div>
  );
}
