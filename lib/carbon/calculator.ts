/**
 * Pure carbon-footprint calculation functions.
 *
 * Nothing here touches the DOM, network, or storage, which keeps the maths
 * deterministic and trivially unit-testable. All public functions take fully
 * validated input (see `lib/carbon/schema.ts`).
 */

import {
  BENCHMARKS,
  DIET_FACTORS,
  ENERGY_FACTORS,
  FLIGHT_KG_PER_HOUR,
  GOODS_KG_PER_USD,
  PUBLIC_TRANSPORT_FACTORS,
  TRANSPORT_FACTORS,
} from "./factors";
import { DAYS_PER_YEAR, MONTHS_PER_YEAR, WEEKS_PER_YEAR } from "./constants";
import type {
  CalculatorInput,
  CategoryResult,
  EmissionCategory,
  FootprintResult,
} from "./types";

const CATEGORY_LABELS: Record<EmissionCategory, string> = {
  transport: "Transport",
  energy: "Home energy",
  diet: "Food & diet",
  goods: "Goods & services",
};

/** Round to a sensible whole-kilogram value to avoid noisy decimals in the UI. */
function roundKg(value: number): number {
  return Math.round(value);
}

/** Annual transport emissions (kg CO2e). */
export function calculateTransport(
  input: CalculatorInput["transport"],
): number {
  const carFactor =
    input.carType === "none" ? 0 : TRANSPORT_FACTORS[input.carType];

  const weeklyKg =
    input.carKmPerWeek * carFactor +
    input.busKmPerWeek * PUBLIC_TRANSPORT_FACTORS.bus +
    input.trainKmPerWeek * PUBLIC_TRANSPORT_FACTORS.train;

  const flightKg = input.flightHoursPerYear * FLIGHT_KG_PER_HOUR;

  return weeklyKg * WEEKS_PER_YEAR + flightKg;
}

/** Annual home-energy emissions (kg CO2e). */
export function calculateEnergy(input: CalculatorInput["energy"]): number {
  const renewableShare = clampPercent(input.renewablePercent) / 100;
  const effectiveElectricityFactor =
    ENERGY_FACTORS.electricity * (1 - renewableShare);

  const monthlyKg =
    input.electricityKwhPerMonth * effectiveElectricityFactor +
    input.gasKwhPerMonth * ENERGY_FACTORS.naturalGas;

  return monthlyKg * MONTHS_PER_YEAR;
}

/** Annual dietary emissions (kg CO2e). */
export function calculateDiet(input: CalculatorInput["diet"]): number {
  return DIET_FACTORS[input.type] * DAYS_PER_YEAR;
}

/** Annual goods & services emissions (kg CO2e). */
export function calculateGoods(input: CalculatorInput["goods"]): number {
  return input.monthlySpendUsd * GOODS_KG_PER_USD * MONTHS_PER_YEAR;
}

/** Constrain a percentage to the inclusive range [0, 100]. */
function clampPercent(value: number): number {
  if (Number.isNaN(value)) return 0;
  return Math.min(100, Math.max(0, value));
}

/**
 * Calculate a complete footprint result from validated input.
 *
 * The breakdown is sorted largest-first so the UI can surface the highest-
 * impact category without additional work, and shares always sum to ~100%.
 *
 * @example
 * ```ts
 * const result = calculateFootprint(DEFAULT_INPUT);
 * result.totalAnnualTonnes; // e.g. 7.4
 * result.breakdown[0];       // the largest-impact category
 * result.comparison.vsSustainableTarget; // ratio vs the ~2.3 t target
 * ```
 */
export function calculateFootprint(input: CalculatorInput): FootprintResult {
  const rawTotals: Record<EmissionCategory, number> = {
    transport: calculateTransport(input.transport),
    energy: calculateEnergy(input.energy),
    diet: calculateDiet(input.diet),
    goods: calculateGoods(input.goods),
  };

  const totalAnnualKg = roundKg(
    rawTotals.transport + rawTotals.energy + rawTotals.diet + rawTotals.goods,
  );

  const breakdown: CategoryResult[] = (
    Object.keys(rawTotals) as EmissionCategory[]
  )
    .map((category) => {
      const annualKg = roundKg(rawTotals[category]);
      return {
        category,
        label: CATEGORY_LABELS[category],
        annualKg,
        share: totalAnnualKg > 0 ? (annualKg / totalAnnualKg) * 100 : 0,
      };
    })
    .sort((a, b) => b.annualKg - a.annualKg);

  return {
    totalAnnualKg,
    totalAnnualTonnes: Number((totalAnnualKg / 1000).toFixed(2)),
    breakdown,
    comparison: {
      vsGlobalAverage: Number(
        (totalAnnualKg / BENCHMARKS.globalAverageKg).toFixed(2),
      ),
      vsSustainableTarget: Number(
        (totalAnnualKg / BENCHMARKS.sustainableTargetKg).toFixed(2),
      ),
    },
  };
}

/** A neutral, realistic starting point for the calculator form. */
export const DEFAULT_INPUT: CalculatorInput = {
  transport: {
    carType: "petrol",
    carKmPerWeek: 150,
    busKmPerWeek: 20,
    trainKmPerWeek: 30,
    flightHoursPerYear: 6,
  },
  energy: {
    electricityKwhPerMonth: 250,
    gasKwhPerMonth: 400,
    renewablePercent: 20,
  },
  diet: {
    type: "meat_medium",
  },
  goods: {
    monthlySpendUsd: 300,
  },
};
