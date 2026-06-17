import { describe, expect, it } from "vitest";
import { buildTextReport } from "./report";
import { calculateFootprint, DEFAULT_INPUT } from "@/lib/carbon/calculator";

describe("buildTextReport", () => {
  const report = buildTextReport(calculateFootprint(DEFAULT_INPUT));

  it("includes the headline total", () => {
    expect(report).toMatch(/Annual total:/);
    expect(report).toMatch(/CO2e/);
  });

  it("lists every category in the breakdown", () => {
    expect(report).toMatch(/Transport/);
    expect(report).toMatch(/Home energy/);
    expect(report).toMatch(/Food & diet/);
    expect(report).toMatch(/Goods & services/);
  });

  it("includes both benchmark comparisons", () => {
    expect(report).toMatch(/vs\. global average/);
    expect(report).toMatch(/vs\. sustainable target/);
  });
});
