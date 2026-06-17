import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { CategoryBreakdown } from "./CategoryBreakdown";
import type { CategoryResult } from "@/lib/carbon/types";

const breakdown: CategoryResult[] = [
  { category: "transport", label: "Transport", annualKg: 3000, share: 60 },
  { category: "diet", label: "Food & diet", annualKg: 2000, share: 40 },
];

describe("CategoryBreakdown", () => {
  it("renders a labelled region", () => {
    render(<CategoryBreakdown breakdown={breakdown} totalTonnes={5} />);
    expect(
      screen.getByRole("heading", { name: /where your emissions come from/i }),
    ).toBeInTheDocument();
  });

  it("shows each category label", () => {
    render(<CategoryBreakdown breakdown={breakdown} totalTonnes={5} />);
    // Appears in both the legend and the screen-reader table.
    expect(screen.getAllByText("Transport").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Food & diet").length).toBeGreaterThan(0);
  });

  it("shows values and shares as text", () => {
    render(<CategoryBreakdown breakdown={breakdown} totalTonnes={5} />);
    expect(screen.getAllByText("3,000 kg").length).toBeGreaterThan(0);
    expect(screen.getAllByText("60%").length).toBeGreaterThan(0);
    expect(screen.getAllByText("2,000 kg").length).toBeGreaterThan(0);
    expect(screen.getAllByText("40%").length).toBeGreaterThan(0);
  });

  it("provides a screen-reader data table", () => {
    render(<CategoryBreakdown breakdown={breakdown} totalTonnes={5} />);
    expect(
      screen.getByRole("table", { name: /annual emissions by category/i }),
    ).toBeInTheDocument();
  });
});
