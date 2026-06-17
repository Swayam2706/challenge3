"use client";

import dynamic from "next/dynamic";
import { formatKg, formatPercent } from "@/lib/format";
import { CATEGORY_COLORS } from "@/components/charts/CategoryDonut";
import type { CategoryResult } from "@/lib/carbon/types";

// Code-split the chart so recharts stays out of the initial JS bundle.
const CategoryDonut = dynamic(
  () => import("@/components/charts/CategoryDonut").then((m) => m.CategoryDonut),
  {
    ssr: false,
    loading: () => (
      <div className="skeleton h-44 w-44 shrink-0 rounded-full" aria-hidden="true" />
    ),
  },
);

interface CategoryBreakdownProps {
  breakdown: CategoryResult[];
  totalTonnes: number;
}

/**
 * Emissions by category: a donut for quick visual scanning, paired with a
 * textual legend. Both the legend and a visually-hidden data table convey the
 * full data, so the section is usable without seeing the chart.
 */
export function CategoryBreakdown({
  breakdown,
  totalTonnes,
}: CategoryBreakdownProps) {
  return (
    <section aria-labelledby="breakdown-heading" className="flex flex-col gap-5">
      <h2
        id="breakdown-heading"
        className="text-lg font-semibold text-slate-900 dark:text-slate-100"
      >
        Where your emissions come from
      </h2>

      <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center">
        <CategoryDonut breakdown={breakdown} totalTonnes={totalTonnes} />

        <ul className="flex w-full flex-col gap-3">
          {breakdown.map((item) => (
            <li key={item.category} className="flex items-center gap-3">
              <span
                className="h-3 w-3 shrink-0 rounded-full"
                style={{ backgroundColor: CATEGORY_COLORS[item.category] }}
                aria-hidden="true"
              />
              <span className="flex-1 text-sm font-medium text-slate-800 dark:text-slate-200">
                {item.label}
              </span>
              <span className="text-sm tabular-nums text-slate-600 dark:text-slate-400">
                {formatKg(item.annualKg)}
              </span>
              <span className="w-10 text-right text-sm font-semibold tabular-nums text-slate-900 dark:text-slate-100">
                {formatPercent(item.share)}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <table className="sr-only">
        <caption>Annual emissions by category</caption>
        <thead>
          <tr>
            <th scope="col">Category</th>
            <th scope="col">Annual emissions</th>
            <th scope="col">Share</th>
          </tr>
        </thead>
        <tbody>
          {breakdown.map((item) => (
            <tr key={item.category}>
              <td>{item.label}</td>
              <td>{formatKg(item.annualKg)}</td>
              <td>{formatPercent(item.share)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
