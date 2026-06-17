import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { axe } from "vitest-axe";
import { CalculatorForm } from "./CalculatorForm";
import { FootprintSummary } from "./FootprintSummary";
import { CategoryBreakdown } from "./CategoryBreakdown";
import { InsightsList } from "./InsightsList";
import { GoalCard } from "./GoalCard";
import { calculateFootprint, DEFAULT_INPUT } from "@/lib/carbon/calculator";
import type { InsightsResponse } from "@/lib/insights/types";

// jsdom cannot compute layout, so colour-contrast checks are unreliable there;
// it is disabled here and verified separately via the AA-tuned palette. All
// other WCAG structural rules (names, roles, labels, landmarks) are enforced.
const axeOptions = {
  rules: { "color-contrast": { enabled: false } },
};

const result = calculateFootprint(DEFAULT_INPUT);

const insights: InsightsResponse = {
  source: "ai",
  summary: "A short, encouraging summary of your footprint.",
  insights: [
    {
      id: "ai-0",
      category: "transport",
      title: "Drive less",
      description: "Combine trips and walk when you can.",
      estimatedAnnualSavingKg: 300,
      difficulty: "easy",
    },
  ],
};

describe("accessibility (axe)", () => {
  it("CalculatorForm has no detectable violations", async () => {
    const { container } = render(
      <CalculatorForm
        value={DEFAULT_INPUT}
        onChange={() => {}}
        onSubmit={() => {}}
      />,
    );
    expect(await axe(container, axeOptions)).toHaveNoViolations();
  });

  it("FootprintSummary has no detectable violations", async () => {
    const { container } = render(<FootprintSummary result={result} />);
    expect(await axe(container, axeOptions)).toHaveNoViolations();
  });

  it("CategoryBreakdown has no detectable violations", async () => {
    const { container } = render(
      <CategoryBreakdown
        breakdown={result.breakdown}
        totalTonnes={result.totalAnnualTonnes}
      />,
    );
    expect(await axe(container, axeOptions)).toHaveNoViolations();
  });

  it("InsightsList has no detectable violations", async () => {
    const { container } = render(<InsightsList data={insights} />);
    expect(await axe(container, axeOptions)).toHaveNoViolations();
  });

  it("GoalCard has no detectable violations", async () => {
    const { container } = render(
      <GoalCard currentAnnualKg={5000} goal={null} onSave={() => {}} />,
    );
    expect(await axe(container, axeOptions)).toHaveNoViolations();
  });
});
