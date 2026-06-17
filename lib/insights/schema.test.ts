import { describe, expect, it } from "vitest";
import { aiInsightsResponseSchema, aiInsightSchema } from "./schema";

const validInsight = {
  category: "transport",
  title: "Drive less",
  description: "Combine trips and walk for short journeys.",
  estimatedAnnualSavingKg: 250,
  difficulty: "easy",
};

describe("aiInsightSchema", () => {
  it("accepts a well-formed insight", () => {
    expect(aiInsightSchema.safeParse(validInsight).success).toBe(true);
  });

  it("rejects an unknown category", () => {
    expect(
      aiInsightSchema.safeParse({ ...validInsight, category: "space-travel" })
        .success,
    ).toBe(false);
  });

  it("rejects a negative saving", () => {
    expect(
      aiInsightSchema.safeParse({
        ...validInsight,
        estimatedAnnualSavingKg: -5,
      }).success,
    ).toBe(false);
  });

  it("rejects an invalid difficulty", () => {
    expect(
      aiInsightSchema.safeParse({ ...validInsight, difficulty: "trivial" })
        .success,
    ).toBe(false);
  });
});

describe("aiInsightsResponseSchema", () => {
  it("accepts a valid response", () => {
    const result = aiInsightsResponseSchema.safeParse({
      summary: "You're doing well.",
      insights: [validInsight],
    });
    expect(result.success).toBe(true);
  });

  it("rejects a response with no insights", () => {
    expect(
      aiInsightsResponseSchema.safeParse({ summary: "x", insights: [] })
        .success,
    ).toBe(false);
  });

  it("rejects a missing summary", () => {
    expect(
      aiInsightsResponseSchema.safeParse({ insights: [validInsight] }).success,
    ).toBe(false);
  });
});
