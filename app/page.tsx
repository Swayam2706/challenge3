"use client";

import { useEffect, useRef, useState } from "react";
import { AlertCircle, Leaf, Sparkles } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CalculatorForm } from "@/components/CalculatorForm";
import { FootprintSummary } from "@/components/FootprintSummary";
import { CategoryBreakdown } from "@/components/CategoryBreakdown";
import { InsightsList } from "@/components/InsightsList";
import { InsightsSkeleton } from "@/components/InsightsSkeleton";
import { GoalCard } from "@/components/GoalCard";
import { ProgressChart } from "@/components/ProgressChart";
import { ShareResults } from "@/components/ShareResults";
import { Card } from "@/components/ui/Card";
import { calculateFootprint, DEFAULT_INPUT } from "@/lib/carbon/calculator";
import type { CalculatorInput, FootprintResult } from "@/lib/carbon/types";
import { useInsights } from "@/lib/useInsights";
import {
  appendHistory,
  createId,
  loadGoal,
  loadHistory,
  saveGoal,
  type Goal,
  type HistoryEntry,
} from "@/lib/storage";

export default function HomePage() {
  const [input, setInput] = useState<CalculatorInput>(DEFAULT_INPUT);
  const [result, setResult] = useState<FootprintResult | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [goal, setGoal] = useState<Goal | null>(null);
  const { data: insights, loading, error, fetchInsights } = useInsights();

  const resultsRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setHistory(loadHistory());
    setGoal(loadGoal());
  }, []);

  function handleCalculate() {
    const footprint = calculateFootprint(input);
    setResult(footprint);

    const entry: HistoryEntry = {
      id: createId(),
      date: new Date().toISOString(),
      totalAnnualKg: footprint.totalAnnualKg,
      input,
    };
    setHistory(appendHistory(entry));
    void fetchInsights(input);

    requestAnimationFrame(() => resultsRef.current?.focus());
  }

  function handleSaveGoal(targetAnnualKg: number) {
    const nextGoal: Goal = {
      targetAnnualKg,
      createdAt: new Date().toISOString(),
    };
    saveGoal(nextGoal);
    setGoal(nextGoal);
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main id="main" className="container flex-1 py-8 sm:py-12">
        {/* Hero */}
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700 dark:bg-brand-900/40 dark:text-brand-300">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            Powered by Google Gemini
          </span>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 sm:text-5xl">
            Understand and shrink your carbon footprint
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-slate-600 dark:text-slate-300 sm:text-lg">
            Answer a few questions about your everyday life to estimate your
            annual footprint, see where it comes from, and get practical,
            personalized actions to reduce it.
          </p>
        </div>

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
          {/* Calculator */}
          <Card className="p-6 sm:p-8 lg:sticky lg:top-24">
            <h2 className="mb-6 text-xl font-bold text-slate-900 dark:text-slate-100">
              Tell us about your week
            </h2>
            <CalculatorForm
              value={input}
              onChange={setInput}
              onSubmit={handleCalculate}
              busy={loading}
            />
          </Card>

          {/* Results */}
          <div
            ref={resultsRef}
            tabIndex={-1}
            aria-live="polite"
            className="flex animate-fade-in flex-col gap-6 outline-none"
          >
            {result ? (
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
                  {loading ? (
                    <InsightsSkeleton />
                  ) : error ? (
                    <p
                      role="alert"
                      className="flex items-center gap-2 text-sm font-medium text-red-600 dark:text-red-400"
                    >
                      <AlertCircle className="h-4 w-4" aria-hidden="true" />
                      {error}
                    </p>
                  ) : insights ? (
                    <InsightsList data={insights} />
                  ) : null}
                </Card>

                <GoalCard
                  currentAnnualKg={result.totalAnnualKg}
                  goal={goal}
                  onSave={handleSaveGoal}
                />

                <Card className="p-6">
                  <ProgressChart history={history} />
                </Card>
              </>
            ) : (
              <Card className="flex h-full min-h-[24rem] flex-col items-center justify-center border-dashed p-10 text-center">
                <span className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-900/40 dark:text-brand-300">
                  <Leaf className="h-8 w-8" aria-hidden="true" />
                </span>
                <p className="mt-5 max-w-sm text-slate-600 dark:text-slate-300">
                  Fill in the form and select{" "}
                  <span className="font-semibold text-slate-900 dark:text-slate-100">
                    Calculate my footprint
                  </span>{" "}
                  to see your results and tailored tips here.
                </p>
              </Card>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
