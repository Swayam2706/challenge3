/**
 * Deterministic, rule-based insights engine.
 *
 * This is the always-available fallback used when no AI key is configured or
 * the AI request fails. It encodes domain knowledge as transparent rules, so
 * the recommendations are explainable and the estimated savings are derived
 * from the same emission factors as the calculator.
 */

import {
  DIET_FACTORS,
  ENERGY_FACTORS,
  TRANSPORT_FACTORS,
} from "@/lib/carbon/factors";
import { calculateFootprint } from "@/lib/carbon/calculator";
import type { CalculatorInput } from "@/lib/carbon/types";
import type { Insight, InsightsResponse } from "./types";

const WEEKS_PER_YEAR = 52;
const MONTHS_PER_YEAR = 12;
const DAYS_PER_YEAR = 365;

/** Build a short, encouraging summary based on the benchmark comparison. */
function buildSummary(totalTonnes: number, vsTarget: number): string {
  if (vsTarget <= 1) {
    return `Your estimated footprint is about ${totalTonnes} tonnes CO2e per year — already at or below the sustainable per-capita target. Keep it up, and focus on locking in these habits.`;
  }
  if (vsTarget <= 2) {
    return `Your estimated footprint is about ${totalTonnes} tonnes CO2e per year, above the sustainable target of ~2.3 tonnes. A few focused changes can close much of that gap.`;
  }
  return `Your estimated footprint is about ${totalTonnes} tonnes CO2e per year, well above the sustainable target of ~2.3 tonnes. The actions below target your largest sources first for the biggest impact.`;
}

/**
 * Generate tailored insights from a validated input. Pure and synchronous so it
 * can be unit-tested and used as a safe fallback on the server.
 */
export function generateRuleBasedInsights(
  input: CalculatorInput,
): InsightsResponse {
  const result = calculateFootprint(input);
  const insights: Insight[] = [];

  // --- Transport ----------------------------------------------------------
  if (
    input.transport.carType !== "none" &&
    input.transport.carType !== "electric" &&
    input.transport.carKmPerWeek > 50
  ) {
    const currentFactor = TRANSPORT_FACTORS[input.transport.carType];
    // Shifting 30% of car km to an electric vehicle / public transport.
    const shiftedKm = input.transport.carKmPerWeek * 0.3;
    const saving =
      shiftedKm * (currentFactor - TRANSPORT_FACTORS.electric) * WEEKS_PER_YEAR;
    insights.push({
      id: "transport-shift",
      category: "transport",
      title: "Shift short car trips to lower-carbon options",
      description:
        "Replacing about a third of your car journeys with cycling, walking, public transport, or an electric vehicle meaningfully cuts transport emissions.",
      estimatedAnnualSavingKg: Math.round(saving),
      difficulty: "medium",
    });
  }

  if (input.transport.flightHoursPerYear >= 4) {
    // Halving flying time.
    const saving = (input.transport.flightHoursPerYear / 2) * 190;
    insights.push({
      id: "transport-fly-less",
      category: "transport",
      title: "Combine or reduce flights",
      description:
        "Flying is one of the most carbon-intensive activities per hour. Replacing one return flight a year with rail or a virtual meeting makes a large dent.",
      estimatedAnnualSavingKg: Math.round(saving),
      difficulty: "medium",
    });
  }

  // --- Energy -------------------------------------------------------------
  if (input.energy.renewablePercent < 80 && input.energy.electricityKwhPerMonth > 0) {
    const remainingShare = (80 - input.energy.renewablePercent) / 100;
    const saving =
      input.energy.electricityKwhPerMonth *
      ENERGY_FACTORS.electricity *
      remainingShare *
      MONTHS_PER_YEAR;
    insights.push({
      id: "energy-green-tariff",
      category: "energy",
      title: "Switch to a renewable electricity tariff",
      description:
        "Choosing a certified green energy tariff (or adding rooftop solar) can decarbonise most of your electricity with no change to daily life.",
      estimatedAnnualSavingKg: Math.round(saving),
      difficulty: "easy",
    });
  }

  if (input.energy.gasKwhPerMonth > 200) {
    // ~15% reduction from thermostat setback and draught-proofing.
    const saving =
      input.energy.gasKwhPerMonth *
      ENERGY_FACTORS.naturalGas *
      0.15 *
      MONTHS_PER_YEAR;
    insights.push({
      id: "energy-heating",
      category: "energy",
      title: "Trim heating demand",
      description:
        "Lowering your thermostat by 1–2°C, draught-proofing, and improving insulation typically cuts heating gas use by around 15%.",
      estimatedAnnualSavingKg: Math.round(saving),
      difficulty: "easy",
    });
  }

  // --- Diet ---------------------------------------------------------------
  if (input.diet.type === "meat_heavy" || input.diet.type === "meat_medium") {
    const target = DIET_FACTORS.meat_low;
    const saving = (DIET_FACTORS[input.diet.type] - target) * DAYS_PER_YEAR;
    insights.push({
      id: "diet-reduce-meat",
      category: "diet",
      title: "Eat meat a little less often",
      description:
        "Moving toward more plant-rich meals — even a few meat-free days each week — is one of the most effective personal climate actions.",
      estimatedAnnualSavingKg: Math.round(saving),
      difficulty: "easy",
    });
  }

  // --- Goods --------------------------------------------------------------
  if (input.goods.monthlySpendUsd > 200) {
    // Cutting discretionary goods spend by 20%, favouring second-hand/repair.
    const saving =
      input.goods.monthlySpendUsd * 0.2 * 0.5 * MONTHS_PER_YEAR;
    insights.push({
      id: "goods-buy-better",
      category: "goods",
      title: "Buy less, choose well, repair more",
      description:
        "Extending the life of clothes and electronics and buying second-hand reduces the embodied emissions in the goods you consume.",
      estimatedAnnualSavingKg: Math.round(saving),
      difficulty: "medium",
    });
  }

  // Highest-impact actions first, capped to keep the UI focused.
  insights.sort((a, b) => b.estimatedAnnualSavingKg - a.estimatedAnnualSavingKg);

  return {
    source: "rules",
    summary: buildSummary(
      result.totalAnnualTonnes,
      result.comparison.vsSustainableTarget,
    ),
    insights: insights.slice(0, 5),
  };
}
