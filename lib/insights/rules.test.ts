import { describe, expect, it } from "vitest";
import { generateRuleBasedInsights } from "./rules";
import type { CalculatorInput } from "@/lib/carbon/types";

const highImpactInput: CalculatorInput = {
  transport: {
    carType: "petrol",
    carKmPerWeek: 300,
    busKmPerWeek: 0,
    trainKmPerWeek: 0,
    flightHoursPerYear: 20,
  },
  energy: {
    electricityKwhPerMonth: 400,
    gasKwhPerMonth: 600,
    renewablePercent: 0,
  },
  diet: { type: "meat_heavy" },
  goods: { monthlySpendUsd: 800 },
};

const lowImpactInput: CalculatorInput = {
  transport: {
    carType: "none",
    carKmPerWeek: 0,
    busKmPerWeek: 10,
    trainKmPerWeek: 10,
    flightHoursPerYear: 0,
  },
  energy: {
    electricityKwhPerMonth: 80,
    gasKwhPerMonth: 0,
    renewablePercent: 100,
  },
  diet: { type: "vegan" },
  goods: { monthlySpendUsd: 50 },
};

describe("generateRuleBasedInsights", () => {
  it("always reports the rules source", () => {
    expect(generateRuleBasedInsights(highImpactInput).source).toBe("rules");
  });

  it("returns prioritized, capped insights for a high-impact lifestyle", () => {
    const { insights } = generateRuleBasedInsights(highImpactInput);
    expect(insights.length).toBeGreaterThan(0);
    expect(insights.length).toBeLessThanOrEqual(5);

    const savings = insights.map((i) => i.estimatedAnnualSavingKg);
    expect(savings).toEqual([...savings].sort((a, b) => b - a));
    savings.forEach((s) => expect(s).toBeGreaterThanOrEqual(0));
  });

  it("suggests reducing meat for a meat-heavy diet", () => {
    const { insights } = generateRuleBasedInsights(highImpactInput);
    expect(insights.some((i) => i.id === "diet-reduce-meat")).toBe(true);
  });

  it("does not nag an already-sustainable lifestyle with car or diet tips", () => {
    const { insights } = generateRuleBasedInsights(lowImpactInput);
    expect(insights.some((i) => i.id === "transport-shift")).toBe(false);
    expect(insights.some((i) => i.id === "diet-reduce-meat")).toBe(false);
    expect(insights.some((i) => i.id === "energy-green-tariff")).toBe(false);
  });

  it("produces a non-empty summary string", () => {
    expect(
      generateRuleBasedInsights(highImpactInput).summary.length,
    ).toBeGreaterThan(0);
  });
});
