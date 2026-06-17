/**
 * Zod schemas for validating calculator input.
 *
 * The same schema is used by the client form and by the server API route. This
 * "validate at every trust boundary" approach means malformed or malicious
 * payloads are rejected with clear errors before they ever reach the
 * calculation logic or the AI provider.
 */

import { z } from "zod";

const carTypeSchema = z.enum([
  "petrol",
  "diesel",
  "hybrid",
  "electric",
  "none",
]);

const dietTypeSchema = z.enum([
  "meat_heavy",
  "meat_medium",
  "meat_low",
  "pescatarian",
  "vegetarian",
  "vegan",
]);

/**
 * A non-negative number with a generous-but-finite upper bound. Bounds prevent
 * absurd inputs (and integer-overflow style abuse) while comfortably covering
 * any realistic lifestyle.
 */
const boundedNonNegative = (max: number) =>
  z
    .number({ invalid_type_error: "Please enter a number" })
    .finite("Please enter a valid number")
    .min(0, "Value cannot be negative")
    .max(max, `Value cannot exceed ${max.toLocaleString()}`);

export const calculatorInputSchema = z.object({
  transport: z.object({
    carType: carTypeSchema,
    carKmPerWeek: boundedNonNegative(10_000),
    busKmPerWeek: boundedNonNegative(10_000),
    trainKmPerWeek: boundedNonNegative(10_000),
    flightHoursPerYear: boundedNonNegative(2_000),
  }),
  energy: z.object({
    electricityKwhPerMonth: boundedNonNegative(100_000),
    gasKwhPerMonth: boundedNonNegative(100_000),
    renewablePercent: boundedNonNegative(100),
  }),
  diet: z.object({
    type: dietTypeSchema,
  }),
  goods: z.object({
    monthlySpendUsd: boundedNonNegative(1_000_000),
  }),
});

/**
 * Schema for the /api/insights request body. We accept the raw input plus the
 * already-computed total so the server can validate consistency, but the server
 * recomputes the breakdown itself rather than trusting client-sent figures.
 */
export const insightsRequestSchema = z.object({
  input: calculatorInputSchema,
});

export type CalculatorInputParsed = z.infer<typeof calculatorInputSchema>;
