/** Types describing personalized reduction insights. */

import type { EmissionCategory } from "@/lib/carbon/types";

export type InsightDifficulty = "easy" | "medium" | "ambitious";

/** A single, actionable recommendation tailored to the user's footprint. */
export interface Insight {
  /** Stable identifier, useful as a React key and for analytics. */
  id: string;
  category: EmissionCategory;
  title: string;
  description: string;
  /** Estimated annual reduction if the action is adopted, kg CO2e. */
  estimatedAnnualSavingKg: number;
  difficulty: InsightDifficulty;
}

/** The full set of insights returned to the UI. */
export interface InsightsResponse {
  /** Whether the insights came from the AI model or the rule-based fallback. */
  source: "ai" | "rules";
  /** A short, plain-language summary of the user's footprint. */
  summary: string;
  insights: Insight[];
}
