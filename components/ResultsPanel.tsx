"use client";

import { AlertCircle } from "lucide-react";
import { FootprintSummary } from "@/components/FootprintSummary";
import { ShareResults } from "@/components/ShareResults";
import { CategoryBreakdown } from "@/components/CategoryBreakdown";
import { InsightsList } from "@/components/InsightsList";
import { InsightsSkeleton } from "@/components/InsightsSkeleton";
import { GoalCard } from "@/components/GoalCard";
import { ProgressChart } from "@/components/ProgressChart";
import { Card } from "@/components/ui/Card";
import type { FootprintResult } from "@/lib/carbon/types";
import type { InsightsResponse } from "@/lib/insights/types";
import type { Goal, HistoryEntry } from "@/lib/storage";

interface ResultsPanelProps {
  result: FootprintResult;
  insights: InsightsResponse | null;
  insightsLoading: boolean;
  insightsError: string | null;
  history: HistoryEntry[];
  goal: Goal | null;
  onSaveGoal: (targetAnnualKg: number) => void;
}

/** Insights area shown once a footprint has been calculated. */
function InsightsSection({
  loading,
  error,
  insights,
}: {
  loading: boolean;
  error: string | null;
  insights: InsightsResponse | null;
}) {
  if (loading) return <InsightsSkeleton />;
  if (error) {
    return (
      <p
        role="alert"
        className="flex items-center gap-2 text-sm font-medium text-red-600 dark:text-red-400"
      >
        <AlertCircle className="h-4 w-4" aria-hidden="true" />
        {error}
      </p>
    );
  }
  return insights ? <InsightsList data={insights} /> : null;
}

/**
 * Composes the full results view: headline summary, share actions, category
 * breakdown, personalized insights, goal tracking, and the progress trend.
 */
export function ResultsPanel({
  result,
  insights,
  insightsLoading,
  insightsError,
  history,
  goal,
  onSaveGoal,
}: ResultsPanelProps) {
  return (
    <>
      <FootprintSummary result={result} />
      <ShareResults result={result} />

      <Card className="p-6">
        <CategoryBreakdown
          breakdown={result.breakdown}
          totalTonnes={result.totalAnnualTonnes}
        />
      </Card>

      <Card className="p-6">
        <InsightsSection
          loading={insightsLoading}
          error={insightsError}
          insights={insights}
        />
      </Card>

      <GoalCard
        currentAnnualKg={result.totalAnnualKg}
        goal={goal}
        onSave={onSaveGoal}
      />

      <Card className="p-6">
        <ProgressChart history={history} />
      </Card>
    </>
  );
}
