/**
 * Builds a plain-text report of a footprint result. Pure and testable so the
 * exact shared/downloaded content can be asserted in unit tests.
 */

import { formatKg, formatMultiplier, formatTonnes } from "@/lib/format";
import type { FootprintResult } from "@/lib/carbon/types";

export function buildTextReport(result: FootprintResult): string {
  const lines = [
    "EcoTrack — My Carbon Footprint",
    "================================",
    `Annual total: ${formatTonnes(result.totalAnnualTonnes)} CO2e`,
    `vs. global average: ${formatMultiplier(result.comparison.vsGlobalAverage)}`,
    `vs. sustainable target: ${formatMultiplier(
      result.comparison.vsSustainableTarget,
    )}`,
    "",
    "Breakdown:",
    ...result.breakdown.map(
      (b) =>
        `  - ${b.label}: ${formatKg(b.annualKg)} (${Math.round(b.share)}%)`,
    ),
    "",
    "Generated with EcoTrack",
  ];
  return lines.join("\n");
}
