import { describe, expect, it } from "vitest";
import {
  DIET_FACTORS,
  ENERGY_FACTORS,
  GOODS_KG_PER_USD,
  TRANSPORT_FACTORS,
} from "./factors";
import {
  DEFAULT_INPUT,
  calculateDiet,
  calculateEnergy,
  calculateFootprint,
  calculateGoods,
  calculateTransport,
} from "./calculator";
import type { CalculatorInput } from "./types";

describe("calculateTransport", () => {
  it("returns zero for a car-free person who never travels", () => {
    const result = calculateTransport({
      carType: "none",
      carKmPerWeek: 0,
      busKmPerWeek: 0,
      trainKmPerWeek: 0,
      flightHoursPerYear: 0,
    });
    expect(result).toBe(0);
  });

  it("ignores car distance when carType is 'none'", () => {
    const result = calculateTransport({
      carType: "none",
      carKmPerWeek: 500,
      busKmPerWeek: 0,
      trainKmPerWeek: 0,
      flightHoursPerYear: 0,
    });
    expect(result).toBe(0);
  });

  it("scales weekly car distance to an annual figure", () => {
    const result = calculateTransport({
      carType: "petrol",
      carKmPerWeek: 100,
      busKmPerWeek: 0,
      trainKmPerWeek: 0,
      flightHoursPerYear: 0,
    });
    // 100 km/week * petrol factor * 52 weeks
    expect(result).toBeCloseTo(100 * TRANSPORT_FACTORS.petrol * 52, 5);
  });

  it("adds flight emissions on an annual basis", () => {
    const result = calculateTransport({
      carType: "none",
      carKmPerWeek: 0,
      busKmPerWeek: 0,
      trainKmPerWeek: 0,
      flightHoursPerYear: 10,
    });
    expect(result).toBe(10 * 190);
  });

  it("treats electric cars as lower-impact than petrol for the same distance", () => {
    const base = {
      carKmPerWeek: 200,
      busKmPerWeek: 0,
      trainKmPerWeek: 0,
      flightHoursPerYear: 0,
    };
    const petrol = calculateTransport({ ...base, carType: "petrol" });
    const electric = calculateTransport({ ...base, carType: "electric" });
    expect(electric).toBeLessThan(petrol);
  });
});

describe("calculateEnergy", () => {
  it("applies the renewable share as a linear reduction to electricity", () => {
    const noRenewable = calculateEnergy({
      electricityKwhPerMonth: 100,
      gasKwhPerMonth: 0,
      renewablePercent: 0,
    });
    const fullyRenewable = calculateEnergy({
      electricityKwhPerMonth: 100,
      gasKwhPerMonth: 0,
      renewablePercent: 100,
    });
    expect(noRenewable).toBeCloseTo(100 * ENERGY_FACTORS.electricity * 12, 5);
    expect(fullyRenewable).toBe(0);
  });

  it("does not discount gas with the renewable percentage", () => {
    const result = calculateEnergy({
      electricityKwhPerMonth: 0,
      gasKwhPerMonth: 100,
      renewablePercent: 100,
    });
    expect(result).toBeCloseTo(100 * ENERGY_FACTORS.naturalGas * 12, 5);
  });

  it("clamps out-of-range renewable percentages instead of throwing", () => {
    const over = calculateEnergy({
      electricityKwhPerMonth: 100,
      gasKwhPerMonth: 0,
      renewablePercent: 250,
    });
    // 250% is clamped to 100% -> electricity fully offset.
    expect(over).toBe(0);
  });
});

describe("calculateDiet", () => {
  it("uses the per-day factor over a full year", () => {
    const result = calculateDiet({ type: "vegan" });
    expect(result).toBeCloseTo(DIET_FACTORS.vegan * 365, 5);
  });

  it("ranks diet impact from meat-heavy down to vegan", () => {
    const order: Array<keyof typeof DIET_FACTORS> = [
      "meat_heavy",
      "meat_medium",
      "meat_low",
      "pescatarian",
      "vegetarian",
      "vegan",
    ];
    const values = order.map((type) => calculateDiet({ type }));
    const sortedDescending = [...values].sort((a, b) => b - a);
    expect(values).toEqual(sortedDescending);
  });
});

describe("calculateGoods", () => {
  it("multiplies monthly spend by the factor across the year", () => {
    const result = calculateGoods({ monthlySpendUsd: 100 });
    expect(result).toBeCloseTo(100 * GOODS_KG_PER_USD * 12, 5);
  });
});

describe("calculateFootprint", () => {
  it("sums all categories into the annual total", () => {
    const result = calculateFootprint(DEFAULT_INPUT);
    const sumOfBreakdown = result.breakdown.reduce(
      (acc, item) => acc + item.annualKg,
      0,
    );
    // Rounding of individual categories can differ from rounding of the sum by
    // at most the number of categories.
    expect(Math.abs(sumOfBreakdown - result.totalAnnualKg)).toBeLessThanOrEqual(
      4,
    );
  });

  it("sorts the breakdown from largest to smallest", () => {
    const result = calculateFootprint(DEFAULT_INPUT);
    const shares = result.breakdown.map((b) => b.annualKg);
    expect(shares).toEqual([...shares].sort((a, b) => b - a));
  });

  it("produces category shares that sum to approximately 100%", () => {
    const result = calculateFootprint(DEFAULT_INPUT);
    const totalShare = result.breakdown.reduce((acc, b) => acc + b.share, 0);
    expect(totalShare).toBeGreaterThan(99);
    expect(totalShare).toBeLessThan(101);
  });

  it("reports tonnes consistently with kilograms", () => {
    const result = calculateFootprint(DEFAULT_INPUT);
    expect(result.totalAnnualTonnes).toBeCloseTo(
      result.totalAnnualKg / 1000,
      2,
    );
  });

  it("handles a zero-emission lifestyle without dividing by zero", () => {
    const zeroInput: CalculatorInput = {
      transport: {
        carType: "none",
        carKmPerWeek: 0,
        busKmPerWeek: 0,
        trainKmPerWeek: 0,
        flightHoursPerYear: 0,
      },
      energy: {
        electricityKwhPerMonth: 0,
        gasKwhPerMonth: 0,
        renewablePercent: 100,
      },
      diet: { type: "vegan" },
      goods: { monthlySpendUsd: 0 },
    };
    const result = calculateFootprint(zeroInput);
    // Diet still contributes, so total is positive and shares are finite.
    expect(result.totalAnnualKg).toBeGreaterThan(0);
    result.breakdown.forEach((item) => {
      expect(Number.isFinite(item.share)).toBe(true);
    });
  });

  it("benchmarks a typical footprint above the sustainable target", () => {
    const result = calculateFootprint(DEFAULT_INPUT);
    expect(result.comparison.vsSustainableTarget).toBeGreaterThan(1);
  });
});
