/**
 * Emission factors and reference benchmarks.
 *
 * Every constant carries a short citation so the numbers are auditable and can
 * be updated as published factors change. Values are expressed in kg CO2e per
 * the stated unit. Sources are widely-cited public datasets:
 *
 *  - UK DEFRA/BEIS Greenhouse Gas Conversion Factors (2023)
 *  - US EPA Emission Factors for Greenhouse Gas Inventories
 *  - Poore & Nemecek (2018) / Our World in Data dietary footprints
 *  - IPCC AR6 per-capita budget guidance
 *
 * These are global-average approximations intended for awareness and education,
 * not regulatory reporting.
 */

import type { CarType, DietType } from "./types";

/** Transport emission factors, kg CO2e per kilometre travelled. */
export const TRANSPORT_FACTORS: Record<Exclude<CarType, "none">, number> = {
  // Source: DEFRA 2023 average car factors (per vehicle-km).
  petrol: 0.17,
  diesel: 0.168,
  hybrid: 0.12,
  // Source: EV charged on a mixed grid (DEFRA 2023, average UK grid).
  electric: 0.05,
};

/** Public-transport factors, kg CO2e per passenger-kilometre. */
export const PUBLIC_TRANSPORT_FACTORS = {
  bus: 0.097, // DEFRA 2023 local bus average
  train: 0.035, // DEFRA 2023 national rail average
} as const;

/**
 * Aviation factor, kg CO2e per hour in the air. Derived from ~0.25 kg CO2e per
 * passenger-km (DEFRA short/medium-haul, economy) at an average cruise speed of
 * ~760 km/h, rounded to a representative figure.
 */
export const FLIGHT_KG_PER_HOUR = 190;

/** Household energy factors, kg CO2e per kWh consumed. */
export const ENERGY_FACTORS = {
  // Grid-average electricity (DEFRA 2023). Renewable share reduces this.
  electricity: 0.233,
  // Natural gas combustion (DEFRA 2023).
  naturalGas: 0.184,
} as const;

/**
 * Dietary footprints, kg CO2e per day, including food production and supply.
 * Source: Scarborough et al. (2014) / Our World in Data, scaled to daily.
 */
export const DIET_FACTORS: Record<DietType, number> = {
  meat_heavy: 7.19,
  meat_medium: 5.63,
  meat_low: 4.67,
  pescatarian: 3.91,
  vegetarian: 3.81,
  vegan: 2.89,
};

/**
 * Consumer-goods factor, kg CO2e per USD spent. A spend-based approximation
 * from environmentally-extended input–output (EEIO) analysis for general retail
 * goods. Deliberately conservative.
 */
export const GOODS_KG_PER_USD = 0.5;

/** Reference benchmarks for contextualising a footprint, kg CO2e per year. */
export const BENCHMARKS = {
  /** Approximate global average per-capita footprint (~4.7 t CO2e). */
  globalAverageKg: 4700,
  /**
   * Per-capita target compatible with limiting warming to ~1.5–2°C by 2030
   * (~2.3 t CO2e). Source: IPCC AR6 illustrative pathways.
   */
  sustainableTargetKg: 2300,
} as const;

/** Human-readable labels for each diet option, for use in the UI. */
export const DIET_LABELS: Record<DietType, string> = {
  meat_heavy: "Meat with most meals",
  meat_medium: "Meat a few times a week",
  meat_low: "Meat occasionally",
  pescatarian: "Pescatarian (fish, no meat)",
  vegetarian: "Vegetarian",
  vegan: "Vegan",
};

/** Human-readable labels for each car/fuel option, for use in the UI. */
export const CAR_LABELS: Record<CarType, string> = {
  none: "No car / car-free",
  petrol: "Petrol",
  diesel: "Diesel",
  hybrid: "Hybrid",
  electric: "Electric",
};
