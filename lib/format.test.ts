import { describe, expect, it } from "vitest";
import {
  formatKg,
  formatMultiplier,
  formatPercent,
  formatTonnes,
} from "./format";

describe("format helpers", () => {
  it("formats kilograms with thousands separators and a unit", () => {
    expect(formatKg(4720)).toBe("4,720 kg");
  });

  it("rounds kilograms to whole numbers", () => {
    expect(formatKg(4720.6)).toBe("4,721 kg");
  });

  it("formats tonnes with one or two decimals", () => {
    expect(formatTonnes(4.72)).toBe("4.72 t");
    expect(formatTonnes(4.7)).toBe("4.7 t");
  });

  it("formats percentages as whole numbers", () => {
    expect(formatPercent(42.4)).toBe("42%");
  });

  it("formats multipliers to one decimal place", () => {
    expect(formatMultiplier(2.14)).toBe("2.1×");
    expect(formatMultiplier(1)).toBe("1.0×");
  });
});
