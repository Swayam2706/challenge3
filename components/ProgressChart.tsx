"use client";

import dynamic from "next/dynamic";
import { TrendingDown, TrendingUp, Minus } from "lucide-react";
import { formatTonnes } from "@/lib/format";
import type { HistoryEntry } from "@/lib/storage";

const TrendChart = dynamic(
  () => import("@/components/charts/TrendChart").then((m) => m.TrendChart),
  {
    ssr: false,
    loading: () => <div className="skeleton h-48 w-full" aria-hidden="true" />,
  },
);

interface ProgressChartProps {
  history: HistoryEntry[];
}

/**
 * Footprint trend over time. Shows an area chart plus a text trend summary and
 * a visually-hidden data table for assistive technology.
 */
export function ProgressChart({ history }: ProgressChartProps) {
  if (history.length < 2) {
    return (
      <section
        aria-labelledby="progress-heading"
        className="flex flex-col gap-2"
      >
        <h2
          id="progress-heading"
          className="text-lg font-semibold text-slate-900 dark:text-slate-100"
        >
          Your footprint over time
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Recalculate on different days to build a trend and watch your progress
          here.
        </p>
      </section>
    );
  }

  const first = history[0]!.totalAnnualKg;
  const last = history[history.length - 1]!.totalAnnualKg;
  const delta = last - first;
  const trend = delta < 0 ? "down" : delta > 0 ? "up" : "flat";

  const TrendIcon =
    trend === "down" ? TrendingDown : trend === "up" ? TrendingUp : Minus;
  const trendTone =
    trend === "down"
      ? "text-brand-600 dark:text-brand-400"
      : trend === "up"
        ? "text-rose-600 dark:text-rose-400"
        : "text-slate-500";

  return (
    <section aria-labelledby="progress-heading" className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2
          id="progress-heading"
          className="text-lg font-semibold text-slate-900 dark:text-slate-100"
        >
          Your footprint over time
        </h2>
        <span
          className={`flex items-center gap-1 text-sm font-medium ${trendTone}`}
        >
          <TrendIcon className="h-4 w-4" aria-hidden="true" />
          {trend === "flat"
            ? "No change"
            : `${formatTonnes(Math.abs(delta) / 1000)} ${trend === "down" ? "lower" : "higher"}`}
        </span>
      </div>

      <TrendChart history={history} />

      <table className="sr-only">
        <caption>Footprint history</caption>
        <thead>
          <tr>
            <th scope="col">Date</th>
            <th scope="col">Annual footprint</th>
          </tr>
        </thead>
        <tbody>
          {history.map((entry) => (
            <tr key={entry.id}>
              <td>{new Date(entry.date).toLocaleDateString()}</td>
              <td>{formatTonnes(entry.totalAnnualKg / 1000)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
