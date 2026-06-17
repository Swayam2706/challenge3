import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CalculatorForm } from "./CalculatorForm";
import { DEFAULT_INPUT } from "@/lib/carbon/calculator";

describe("CalculatorForm", () => {
  it("renders accessible, grouped sections", () => {
    render(
      <CalculatorForm value={DEFAULT_INPUT} onChange={() => {}} onSubmit={() => {}} />,
    );
    // Native labels are associated with their controls.
    expect(screen.getByLabelText(/main car type/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/typical diet/i)).toBeInTheDocument();
  });

  it("submits valid input", async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(
      <CalculatorForm value={DEFAULT_INPUT} onChange={() => {}} onSubmit={onSubmit} />,
    );
    await user.click(
      screen.getByRole("button", { name: /calculate my footprint/i }),
    );
    expect(onSubmit).toHaveBeenCalledOnce();
  });

  it("propagates edits through onChange", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(
      <CalculatorForm value={DEFAULT_INPUT} onChange={onChange} onSubmit={() => {}} />,
    );
    const diet = screen.getByLabelText(/typical diet/i);
    await user.selectOptions(diet, "vegan");
    expect(onChange).toHaveBeenCalled();
    const lastCall = onChange.mock.calls.at(-1)?.[0];
    expect(lastCall.diet.type).toBe("vegan");
  });

  it("disables the submit button while busy", () => {
    render(
      <CalculatorForm
        value={DEFAULT_INPUT}
        onChange={() => {}}
        onSubmit={() => {}}
        busy
      />,
    );
    expect(screen.getByRole("button", { name: /calculating/i })).toBeDisabled();
  });
});
