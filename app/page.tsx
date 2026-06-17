"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { EmptyState } from "@/components/EmptyState";
import { CalculatorForm } from "@/components/CalculatorForm";
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

// The results view (and its charts) is below the fold and only needed after a
// calculation, so it is code-split out of the initial bundle.
const ResultsPanel = dynamic(
  () => import("@/components/ResultsPanel").then((m) => m.ResultsPanel),
  {
    ssr: false,
    loading: () => (
      <div className="skeleton h-96 w-full rounded-2xl" aria-hidden="true" />
    ),
  },
);

/**
 * Application shell and state orchestrator. Holds the calculator input, the
 * computed result, persisted history, and the reduction goal, then delegates
 * presentation to focused child components.
 */
export default function HomePage() {
  const [input, setInput] = useState<CalculatorInput>(DEFAULT_INPUT);
  const [result, setResult] = useState<FootprintResult | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [goal, setGoal] = useState<Goal | null>(null);
  const { data: insights, loading, error, fetchInsights } = useInsights();

  const resultsRef = useRef<HTMLDivElement | null>(null);

  // Hydrate persisted state on mount (client-only).
  useEffect(() => {
    setHistory(loadHistory());
    setGoal(loadGoal());
  }, []);

  const handleCalculate = useCallback(() => {
    const footprint = calculateFootprint(input);
    setResult(footprint);
    setHistory(
      appendHistory({
        id: createId(),
        date: new Date().toISOString(),
        totalAnnualKg: footprint.totalAnnualKg,
        input,
      }),
    );
    void fetchInsights(input);

    // Move focus to the results so screen-reader users are taken to the answer.
    requestAnimationFrame(() => resultsRef.current?.focus());
  }, [input, fetchInsights]);

  const handleSaveGoal = useCallback((targetAnnualKg: number) => {
    const nextGoal: Goal = {
      targetAnnualKg,
      createdAt: new Date().toISOString(),
    };
    saveGoal(nextGoal);
    setGoal(nextGoal);
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main id="main" className="container flex-1 py-8 sm:py-12">
        <Hero />

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
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

          <div
            ref={resultsRef}
            tabIndex={-1}
            aria-live="polite"
            className="flex animate-fade-in flex-col gap-6 outline-none"
          >
            {result ? (
              <ResultsPanel
                result={result}
                insights={insights}
                insightsLoading={loading}
                insightsError={error}
                history={history}
                goal={goal}
                onSaveGoal={handleSaveGoal}
              />
            ) : (
              <EmptyState />
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
