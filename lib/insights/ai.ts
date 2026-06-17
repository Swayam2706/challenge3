/**
 * Server-only Google Gemini client.
 *
 * This module must never be imported by client components: it reads the secret
 * `GEMINI_API_KEY` from the server environment. The API key is therefore never
 * shipped to the browser.
 */

import "server-only";
import { GoogleGenerativeAI } from "@google/generative-ai";
import type { CalculatorInput } from "@/lib/carbon/types";
import type { Insight, InsightsResponse } from "./types";
import { buildInsightsPrompt } from "./prompt";
import { aiInsightsResponseSchema } from "./schema";
import { extractJson } from "./json";

const DEFAULT_MODEL = "gemini-2.5-flash";

/** Whether an AI key is configured. Used to decide the strategy up front. */
export function isAiConfigured(): boolean {
  return Boolean(process.env.GEMINI_API_KEY);
}

/**
 * Request personalized insights from Gemini. Throws on any failure so the
 * caller can fall back to the rule-based engine.
 */
export async function generateAiInsights(
  input: CalculatorInput,
): Promise<InsightsResponse> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  const client = new GoogleGenerativeAI(apiKey);
  const model = client.getGenerativeModel({
    model: process.env.GEMINI_MODEL || DEFAULT_MODEL,
    generationConfig: {
      temperature: 0.4,
      responseMimeType: "application/json",
    },
  });

  const prompt = buildInsightsPrompt(input);
  const completion = await model.generateContent(prompt);
  const text = completion.response.text();

  // Validate the untrusted model output before returning it.
  const parsed = aiInsightsResponseSchema.parse(extractJson(text));

  const insights: Insight[] = parsed.insights.map((insight, index) => ({
    id: `ai-${index}`,
    ...insight,
  }));

  return {
    source: "ai",
    summary: parsed.summary,
    insights,
  };
}
