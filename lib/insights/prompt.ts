/**
 * Prompt construction for the AI insights provider.
 *
 * Kept as a pure function (no network, no SDK) so the exact text sent to the
 * model is unit-testable and reviewable. The prompt asks for strict JSON so the
 * response can be safely parsed and validated.
 */

import { calculateFootprint } from "@/lib/carbon/calculator";
import { CAR_LABELS, DIET_LABELS } from "@/lib/carbon/factors";
import type { CalculatorInput } from "@/lib/carbon/types";

export function buildInsightsPrompt(input: CalculatorInput): string {
  const result = calculateFootprint(input);

  const breakdownLines = result.breakdown
    .map(
      (b) =>
        `- ${b.label}: ${b.annualKg} kg CO2e/year (${b.share.toFixed(0)}% of total)`,
    )
    .join("\n");

  return [
    "You are a concise, encouraging climate coach helping someone reduce their personal carbon footprint.",
    "Use the data below to produce specific, realistic, non-judgemental recommendations.",
    "",
    "USER FOOTPRINT (estimated):",
    `- Total: ${result.totalAnnualTonnes} tonnes CO2e/year`,
    `- About ${result.comparison.vsSustainableTarget}x the sustainable per-capita target.`,
    "Breakdown by category:",
    breakdownLines,
    "",
    "LIFESTYLE DETAILS:",
    `- Car: ${CAR_LABELS[input.transport.carType]}, ${input.transport.carKmPerWeek} km/week`,
    `- Public transport: ${input.transport.busKmPerWeek} km bus, ${input.transport.trainKmPerWeek} km train per week`,
    `- Flying: ${input.transport.flightHoursPerYear} hours/year`,
    `- Electricity: ${input.energy.electricityKwhPerMonth} kWh/month (${input.energy.renewablePercent}% renewable)`,
    `- Gas: ${input.energy.gasKwhPerMonth} kWh/month`,
    `- Diet: ${DIET_LABELS[input.diet.type]}`,
    `- Goods spend: $${input.goods.monthlySpendUsd}/month`,
    "",
    "RESPOND WITH STRICT JSON ONLY (no markdown, no commentary) matching this shape:",
    "{",
    '  "summary": "one or two encouraging sentences about their footprint",',
    '  "insights": [',
    "    {",
    '      "category": "transport | energy | diet | goods",',
    '      "title": "short action title",',
    '      "description": "one or two sentences of practical guidance",',
    '      "estimatedAnnualSavingKg": number,',
    '      "difficulty": "easy | medium | ambitious"',
    "    }",
    "  ]",
    "}",
    "",
    "Provide 3 to 5 insights, prioritising the largest categories. Keep savings estimates realistic and grounded in the breakdown above.",
  ].join("\n");
}
