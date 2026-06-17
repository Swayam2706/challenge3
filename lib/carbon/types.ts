/**
 * Domain types for the carbon footprint engine.
 *
 * These types are intentionally framework-agnostic so the calculation logic can
 * be unit-tested in isolation and reused on both the server and the client.
 */

/** Top-level categories that make up a person's footprint. */
export type EmissionCategory = "transport" | "energy" | "diet" | "goods";

/** Supported personal-vehicle fuel types (and "none" for car-free users). */
export type CarType = "petrol" | "diesel" | "hybrid" | "electric" | "none";

/** Dietary patterns, ordered roughly from highest to lowest impact. */
export type DietType =
  | "meat_heavy"
  | "meat_medium"
  | "meat_low"
  | "pescatarian"
  | "vegetarian"
  | "vegan";

/** Structured, validated input describing a person's typical lifestyle. */
export interface CalculatorInput {
  transport: {
    carType: CarType;
    carKmPerWeek: number;
    busKmPerWeek: number;
    trainKmPerWeek: number;
    flightHoursPerYear: number;
  };
  energy: {
    electricityKwhPerMonth: number;
    gasKwhPerMonth: number;
    /** Share of electricity from renewable sources, 0–100. */
    renewablePercent: number;
  };
  diet: {
    type: DietType;
  };
  goods: {
    /** Monthly spend on consumer goods, in USD. */
    monthlySpendUsd: number;
  };
}

/** Annual emissions (kg CO2e) attributed to a single category. */
export interface CategoryResult {
  category: EmissionCategory;
  label: string;
  annualKg: number;
  /** Percentage of the total footprint, 0–100. */
  share: number;
}

/** Complete result of a footprint calculation. */
export interface FootprintResult {
  /** Total annual emissions in kg CO2e. */
  totalAnnualKg: number;
  /** Total annual emissions in tonnes CO2e. */
  totalAnnualTonnes: number;
  /** Per-category breakdown, sorted by impact (largest first). */
  breakdown: CategoryResult[];
  /** Comparison against reference benchmarks. */
  comparison: {
    /** Ratio of this footprint to the global average (1 = average). */
    vsGlobalAverage: number;
    /** Ratio of this footprint to the sustainable per-capita target. */
    vsSustainableTarget: number;
  };
}
