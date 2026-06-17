import {
  Car,
  Leaf,
  ShoppingBag,
  Sparkles,
  Utensils,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { formatKg } from "@/lib/format";
import type { EmissionCategory } from "@/lib/carbon/types";
import type { InsightDifficulty, InsightsResponse } from "@/lib/insights/types";

interface InsightsListProps {
  data: InsightsResponse;
}

const CATEGORY_ICON: Record<EmissionCategory, LucideIcon> = {
  transport: Car,
  energy: Zap,
  diet: Utensils,
  goods: ShoppingBag,
};

const DIFFICULTY: Record<
  InsightDifficulty,
  { label: string; tone: "brand" | "amber" | "rose" }
> = {
  easy: { label: "Easy win", tone: "brand" },
  medium: { label: "Worth planning", tone: "amber" },
  ambitious: { label: "Ambitious", tone: "rose" },
};

/** Renders the personalized recommendation cards and the footprint summary. */
export function InsightsList({ data }: InsightsListProps) {
  const totalPotential = data.insights.reduce(
    (acc, insight) => acc + insight.estimatedAnnualSavingKg,
    0,
  );

  return (
    <section aria-labelledby="insights-heading" className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <h2
          id="insights-heading"
          className="text-lg font-semibold text-slate-900 dark:text-slate-100"
        >
          Your personalized actions
        </h2>
        <Badge tone={data.source === "ai" ? "brand" : "neutral"}>
          <Sparkles className="h-3 w-3" aria-hidden="true" />
          {data.source === "ai" ? "AI-personalized" : "Smart suggestions"}
        </Badge>
      </div>

      <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
        {data.summary}
      </p>

      {totalPotential > 0 ? (
        <p className="flex items-center gap-2 rounded-xl bg-brand-50 px-4 py-3 text-sm font-medium text-brand-800 dark:bg-brand-950/60 dark:text-brand-100">
          <Leaf className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>
            Adopting these actions could save roughly{" "}
            <strong>{formatKg(totalPotential)} CO₂e per year</strong>.
          </span>
        </p>
      ) : null}

      <ul className="grid gap-4 sm:grid-cols-2">
        {data.insights.map((insight) => {
          const Icon = CATEGORY_ICON[insight.category];
          const difficulty = DIFFICULTY[insight.difficulty];
          return (
            <li
              key={insight.id}
              className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-soft transition hover:shadow-soft-lg dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-700 dark:bg-brand-900/50 dark:text-brand-300">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <Badge tone={difficulty.tone}>{difficulty.label}</Badge>
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                {insight.title}
              </h3>
              <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                {insight.description}
              </p>
              {insight.estimatedAnnualSavingKg > 0 ? (
                <p className="mt-auto pt-1 text-sm font-semibold text-brand-700 dark:text-brand-300">
                  Saves ~{formatKg(insight.estimatedAnnualSavingKg)} / year
                </p>
              ) : null}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
