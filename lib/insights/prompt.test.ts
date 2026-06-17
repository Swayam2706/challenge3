import { describe, expect, it } from "vitest";
import { buildInsightsPrompt } from "./prompt";
import { DEFAULT_INPUT } from "@/lib/carbon/calculator";

describe("buildInsightsPrompt", () => {
  const prompt = buildInsightsPrompt(DEFAULT_INPUT);

  it("includes the computed total footprint", () => {
    expect(prompt).toMatch(/tonnes CO2e\/year/);
  });

  it("asks for strict JSON output", () => {
    expect(prompt).toMatch(/STRICT JSON ONLY/);
  });

  it("describes the user's lifestyle details", () => {
    expect(prompt).toMatch(/Diet:/);
    expect(prompt).toMatch(/Flying:/);
  });

  it("does not leak any secret-looking values", () => {
    expect(prompt).not.toMatch(/API_KEY/i);
  });
});
