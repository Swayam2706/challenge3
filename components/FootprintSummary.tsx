"use client";

import { memo } from "react";
import { Globe2, Target } from "lucide-react";
import { BENCHMARKS } from "@/lib/carbon/factors";
import { formatMultiplier, formatTonnes } from "@/lib/format";
import type { FootprintResult } from "@/lib/carbon/types";

interface FootprintSummaryProps {
  result: FootprintResult;
}

/**
 * Headline result: the total annual footprint plus context against the global
 * average and the sustainable per-capita target. Comparisons are expressed in
 * words as well as figures, so meaning never depends on colour alone.
 *
 * Memoized: it only re-renders when `result` changes, not on every keystroke in
 * the calculator form above it.
 */
function FootprintSummaryImpl({ result }: FootprintSummaryProps) {
  const { totalAnnualTonnes, comparison } = result;
  const aboveTarget = comparison.vsSustainableTarget > 1;

  return (
    <section
      aria-labelledby="summary-heading"
      className="overflow-hidden rounded-2xl bg-gradient-to-br from-brand-600 via-brand-700 to-brand-800 p-6 text-white shadow-soft-lg sm:p-8"
    >
      <h2
        id="summary-heading"
        className="text-xs font-semibold uppercase tracking-wider text-brand-100"
      >
        Your estimated annual footprint
      </h2>
      <p className="mt-2 flex items-baseline gap-2">
        <span className="text-5xl font-extrabold tabular-nums sm:text-6xl">
          {formatTonnes(totalAnnualTonnes)}
        </span>
        <span className="text-lg font-medium text-brand-100">CO₂e / year</span>
      </p>

      <dl className="mt-6 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl bg-white/10 p-4 backdrop-blur-sm">
          <dt className="flex items-center gap-2 text-sm text-brand-100">
            <Globe2 className="h-4 w-4" aria-hidden="true" />
            vs. global average
          </dt>
          <dd className="mt-1">
            <span className="block text-2xl font-bold tabular-nums">
              {formatMultiplier(comparison.vsGlobalAverage)}
            </span>
            <span className="block text-xs text-brand-100">
              Global average ≈ {formatTonnes(BENCHMARKS.globalAverageKg / 1000)}
            </span>
          </dd>
        </div>
        <div className="rounded-xl bg-white/10 p-4 backdrop-blur-sm">
          <dt className="flex items-center gap-2 text-sm text-brand-100">
            <Target className="h-4 w-4" aria-hidden="true" />
            vs. sustainable target
          </dt>
          <dd className="mt-1">
            <span className="block text-2xl font-bold tabular-nums">
              {formatMultiplier(comparison.vsSustainableTarget)}
            </span>
            <span className="block text-xs text-brand-100">
              2030 target ≈{" "}
              {formatTonnes(BENCHMARKS.sustainableTargetKg / 1000)}
            </span>
          </dd>
        </div>
      </dl>

      <p className="mt-5 text-sm leading-relaxed text-brand-50">
        {aboveTarget
          ? "You're above the sustainable target — the actions below show where you can make the biggest difference."
          : "You're at or below the sustainable target. Excellent — focus on keeping these habits consistent."}
      </p>
    </section>
  );
}

export const FootprintSummary = memo(FootprintSummaryImpl);
