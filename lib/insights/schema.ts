/**
 * Schema for validating AI-generated insights.
 *
 * The model's output is untrusted text. We parse it as JSON and validate it
 * against this schema before showing anything to the user, so a malformed or
 * unexpected response degrades gracefully instead of breaking the UI.
 */

import { z } from "zod";

const categorySchema = z.enum(["transport", "energy", "diet", "goods"]);
const difficultySchema = z.enum(["easy", "medium", "ambitious"]);

export const aiInsightSchema = z.object({
  category: categorySchema,
  title: z.string().trim().min(1).max(120),
  description: z.string().trim().min(1).max(600),
  estimatedAnnualSavingKg: z.number().finite().min(0).max(50_000),
  difficulty: difficultySchema,
});

export const aiInsightsResponseSchema = z.object({
  summary: z.string().trim().min(1).max(600),
  insights: z.array(aiInsightSchema).min(1).max(8),
});

export type AiInsightsParsed = z.infer<typeof aiInsightsResponseSchema>;
