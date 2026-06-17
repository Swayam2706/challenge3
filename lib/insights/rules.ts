/**
 * Deterministic, rule-based insights engine.
 *
 * The always-available fallback used when no AI key is configured or the AI
 * request fails. Domain knowledge is encoded as small, transparent rules — one
 * pure function per recommendation — so the advice is explainable and every
 * saving estimate is derived from the same emission factors as the calculator.
 */

import {
  DIET_FACTORS,
  ENERGY_FACTORS,
  FLIGHT_KG_PER_HOUR,
  GOODS_KG_PER_USD,
  TRANSPORT_FACTORS,
} from "@/lib/carbon/factors";
import {
  DAYS_PER_YEAR,
  MONTHS_PER_YEAR,
  WEEKS_PER_YEAR,
} from "@/lib/carbon/constants";
import { calculateFootprint } from "@/lib/carbon/calculator";
import type { CalculatorInput } from "@/lib/carbon/types";
import type { Insight, InsightsResponse } from "./types";

/**
 * Tunable behavioural assumptions behind each recommendation. Centralising them
 * keeps the rules readable and the estimates auditable — change the assumption,
 * not the formula.
 */
const ASSUMPTIONS = {
  /** Don't suggest car changes below this weekly distance (km). */
  carKmThreshold: 50,
  /** Share of car distance shifted to lower-carbon modes. */
  carShiftFraction: 0.3,
  /** Suggest cutting flights at or above this many hours per year. */
  flightHoursThreshold: 4,
  /** Fraction of flying time assumed to be avoidable. */
  flightReductionFraction: 0.5,
  /** Aspirational share (%) of electricity from renewables. */
  renewableTargetPercent: 80,
  /** Don't suggest heating changes below this monthly gas use (kWh). */
  gasKwhThreshold: 200,
  /** Heating energy saved by thermostat setback + draught-proofing. */
  heatingReductionFraction: 0.15,
  /** Don't suggest goods changes below this monthly spend (USD). */
  goodsSpendThreshold: 200,
  /** Discretionary goods spend assumed to be reducible. */
  goodsReductionFraction: 0.2,
  /** Maximum number of insights returned, to keep the UI focused. */
  maxInsights: 5,
} as const;

const round = (kg: number): number => Math.round(kg);

type Transport = CalculatorInput["transport"];
type Energy = CalculatorInput["energy"];
type Diet = CalculatorInput["diet"];
type Goods = CalculatorInput["goods"];

/** Suggest shifting some car journeys to lower-carbon modes. */
function carShiftRule(t: Transport): Insight | null {
  // Narrow out non-fossil cars so the factor lookup is type-safe.
  if (t.carType === "none" || t.carType === "electric") return null;
  if (t.carKmPerWeek <= ASSUMPTIONS.carKmThreshold) return null;

  const shiftedKm = t.carKmPerWeek * ASSUMPTIONS.carShiftFraction;
  const factorSaved = TRANSPORT_FACTORS[t.carType] - TRANSPORT_FACTORS.electric;
  return {
    id: "transport-shift",
    category: "transport",
    title: "Shift short car trips to lower-carbon options",
    description:
      "Replacing about a third of your car journeys with cycling, walking, public transport, or an electric vehicle meaningfully cuts transport emissions.",
    estimatedAnnualSavingKg: round(shiftedKm * factorSaved * WEEKS_PER_YEAR),
    difficulty: "medium",
  };
}

/** Suggest reducing flights for frequent flyers. */
function flightRule(t: Transport): Insight | null {
  if (t.flightHoursPerYear < ASSUMPTIONS.flightHoursThreshold) return null;
  const hoursAvoided =
    t.flightHoursPerYear * ASSUMPTIONS.flightReductionFraction;
  return {
    id: "transport-fly-less",
    category: "transport",
    title: "Combine or reduce flights",
    description:
      "Flying is one of the most carbon-intensive activities per hour. Replacing one return flight a year with rail or a virtual meeting makes a large dent.",
    estimatedAnnualSavingKg: round(hoursAvoided * FLIGHT_KG_PER_HOUR),
    difficulty: "medium",
  };
}

/** Suggest a renewable electricity tariff when grid share is high. */
function greenTariffRule(e: Energy): Insight | null {
  const belowTarget = e.renewablePercent < ASSUMPTIONS.renewableTargetPercent;
  if (!belowTarget || e.electricityKwhPerMonth <= 0) return null;
  const shareToGreen =
    (ASSUMPTIONS.renewableTargetPercent - e.renewablePercent) / 100;
  const saving =
    e.electricityKwhPerMonth *
    ENERGY_FACTORS.electricity *
    shareToGreen *
    MONTHS_PER_YEAR;
  return {
    id: "energy-green-tariff",
    category: "energy",
    title: "Switch to a renewable electricity tariff",
    description:
      "Choosing a certified green energy tariff (or adding rooftop solar) can decarbonise most of your electricity with no change to daily life.",
    estimatedAnnualSavingKg: round(saving),
    difficulty: "easy",
  };
}

/** Suggest trimming heating demand for high gas users. */
function heatingRule(e: Energy): Insight | null {
  if (e.gasKwhPerMonth <= ASSUMPTIONS.gasKwhThreshold) return null;
  const saving =
    e.gasKwhPerMonth *
    ENERGY_FACTORS.naturalGas *
    ASSUMPTIONS.heatingReductionFraction *
    MONTHS_PER_YEAR;
  return {
    id: "energy-heating",
    category: "energy",
    title: "Trim heating demand",
    description:
      "Lowering your thermostat by 1–2°C, draught-proofing, and improving insulation typically cuts heating gas use by around 15%.",
    estimatedAnnualSavingKg: round(saving),
    difficulty: "easy",
  };
}

/** Suggest reducing meat for meat-heavy/medium diets. */
function dietRule(d: Diet): Insight | null {
  if (d.type !== "meat_heavy" && d.type !== "meat_medium") return null;
  const dailySaving = DIET_FACTORS[d.type] - DIET_FACTORS.meat_low;
  return {
    id: "diet-reduce-meat",
    category: "diet",
    title: "Eat meat a little less often",
    description:
      "Moving toward more plant-rich meals — even a few meat-free days each week — is one of the most effective personal climate actions.",
    estimatedAnnualSavingKg: round(dailySaving * DAYS_PER_YEAR),
    difficulty: "easy",
  };
}

/** Suggest buying less / second-hand for high discretionary spenders. */
function goodsRule(g: Goods): Insight | null {
  if (g.monthlySpendUsd <= ASSUMPTIONS.goodsSpendThreshold) return null;
  const saving =
    g.monthlySpendUsd *
    ASSUMPTIONS.goodsReductionFraction *
    GOODS_KG_PER_USD *
    MONTHS_PER_YEAR;
  return {
    id: "goods-buy-better",
    category: "goods",
    title: "Buy less, choose well, repair more",
    description:
      "Extending the life of clothes and electronics and buying second-hand reduces the embodied emissions in the goods you consume.",
    estimatedAnnualSavingKg: round(saving),
    difficulty: "medium",
  };
}

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
 *
 * @example
 * ```ts
 * const { source, insights } = generateRuleBasedInsights(DEFAULT_INPUT);
 * source; // "rules"
 * insights[0]; // the highest-saving recommendation
 * ```
 */
export function generateRuleBasedInsights(
  input: CalculatorInput,
): InsightsResponse {
  const result = calculateFootprint(input);

  const insights = [
    carShiftRule(input.transport),
    flightRule(input.transport),
    greenTariffRule(input.energy),
    heatingRule(input.energy),
    dietRule(input.diet),
    goodsRule(input.goods),
  ]
    .filter((insight): insight is Insight => insight !== null)
    .sort((a, b) => b.estimatedAnnualSavingKg - a.estimatedAnnualSavingKg)
    .slice(0, ASSUMPTIONS.maxInsights);

  return {
    source: "rules",
    summary: buildSummary(
      result.totalAnnualTonnes,
      result.comparison.vsSustainableTarget,
    ),
    insights,
  };
}
