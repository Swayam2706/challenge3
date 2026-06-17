"use client";

import { useCallback, useRef, useState } from "react";
import type { CalculatorInput } from "@/lib/carbon/types";
import type { InsightsResponse } from "@/lib/insights/types";

interface UseInsightsState {
  data: InsightsResponse | null;
  loading: boolean;
  error: string | null;
}

/**
 * Hook that requests personalized insights from the API.
 *
 * - Cancels any in-flight request before starting a new one (avoids race
 *   conditions where a stale response overwrites a newer one).
 * - Surfaces a friendly error message without leaking internal details.
 */
export function useInsights() {
  const [state, setState] = useState<UseInsightsState>({
    data: null,
    loading: false,
    error: null,
  });
  const abortRef = useRef<AbortController | null>(null);

  const fetchInsights = useCallback(async (input: CalculatorInput) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const response = await fetch("/api/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const data = (await response.json()) as InsightsResponse;
      setState({ data, loading: false, error: null });
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return; // Superseded by a newer request; ignore.
      }
      setState({
        data: null,
        loading: false,
        error: "We couldn't generate insights right now. Please try again.",
      });
    }
  }, []);

  return { ...state, fetchInsights };
}
