"use client";

import { useState } from "react";
import {
  Bus,
  Car,
  Flame,
  Plane,
  ShoppingBag,
  Train,
  Utensils,
  Zap,
} from "lucide-react";
import { NumberField } from "@/components/ui/NumberField";
import { SelectField } from "@/components/ui/SelectField";
import { RangeField } from "@/components/ui/RangeField";
import { Button } from "@/components/ui/Button";
import { CAR_LABELS, DIET_LABELS } from "@/lib/carbon/factors";
import { calculatorInputSchema } from "@/lib/carbon/schema";
import type { CalculatorInput, CarType, DietType } from "@/lib/carbon/types";

interface CalculatorFormProps {
  value: CalculatorInput;
  onChange: (next: CalculatorInput) => void;
  onSubmit: () => void;
  /** Disables the submit button while insights are loading. */
  busy?: boolean;
}

const CAR_OPTIONS = (Object.keys(CAR_LABELS) as CarType[]).map((value) => ({
  value,
  label: CAR_LABELS[value],
}));

const DIET_OPTIONS = (Object.keys(DIET_LABELS) as DietType[]).map((value) => ({
  value,
  label: DIET_LABELS[value],
}));

function Legend({
  icon: Icon,
  children,
}: {
  icon: typeof Car;
  children: React.ReactNode;
}) {
  return (
    <legend className="mb-3 flex items-center gap-2 text-base font-semibold text-slate-900 dark:text-slate-100">
      <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-brand-50 text-brand-700 dark:bg-brand-900/50 dark:text-brand-300">
        <Icon className="h-4 w-4" aria-hidden="true" />
      </span>
      {children}
    </legend>
  );
}

/**
 * The footprint questionnaire. Sections are grouped with `<fieldset>`/
 * `<legend>` so assistive technology announces the structure. The form is
 * validated with the shared Zod schema on submit; errors are surfaced in an
 * alert region for screen-reader users.
 */
export function CalculatorForm({
  value,
  onChange,
  onSubmit,
  busy = false,
}: CalculatorFormProps) {
  const [formError, setFormError] = useState<string | null>(null);

  // Typed section updaters keep the JSX free of repetitive nested spreads.
  const setTransport = (patch: Partial<CalculatorInput["transport"]>) =>
    onChange({ ...value, transport: { ...value.transport, ...patch } });
  const setEnergy = (patch: Partial<CalculatorInput["energy"]>) =>
    onChange({ ...value, energy: { ...value.energy, ...patch } });
  const setDiet = (patch: Partial<CalculatorInput["diet"]>) =>
    onChange({ ...value, diet: { ...value.diet, ...patch } });
  const setGoods = (patch: Partial<CalculatorInput["goods"]>) =>
    onChange({ ...value, goods: { ...value.goods, ...patch } });

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const parsed = calculatorInputSchema.safeParse(value);
    if (!parsed.success) {
      setFormError(
        "Some values look out of range. Please check the highlighted fields and try again.",
      );
      return;
    }
    setFormError(null);
    onSubmit();
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-8">
      <fieldset className="flex flex-col gap-4">
        <Legend icon={Car}>Transport</Legend>
        <SelectField
          label="Main car type"
          icon={Car}
          value={value.transport.carType}
          options={CAR_OPTIONS}
          onChange={(carType) => setTransport({ carType })}
        />
        <NumberField
          label="Car distance"
          icon={Car}
          unit="km/wk"
          value={value.transport.carKmPerWeek}
          onChange={(carKmPerWeek) => setTransport({ carKmPerWeek })}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <NumberField
            label="Bus distance"
            icon={Bus}
            unit="km/wk"
            value={value.transport.busKmPerWeek}
            onChange={(busKmPerWeek) => setTransport({ busKmPerWeek })}
          />
          <NumberField
            label="Train distance"
            icon={Train}
            unit="km/wk"
            value={value.transport.trainKmPerWeek}
            onChange={(trainKmPerWeek) => setTransport({ trainKmPerWeek })}
          />
        </div>
        <NumberField
          label="Time spent flying"
          icon={Plane}
          unit="hrs/yr"
          hint="Roughly add up the flight time of trips you take in a year."
          value={value.transport.flightHoursPerYear}
          onChange={(flightHoursPerYear) =>
            setTransport({ flightHoursPerYear })
          }
        />
      </fieldset>

      <fieldset className="flex flex-col gap-4">
        <Legend icon={Zap}>Home energy</Legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <NumberField
            label="Electricity use"
            icon={Zap}
            unit="kWh/mo"
            hint="Check a recent bill, or estimate."
            value={value.energy.electricityKwhPerMonth}
            onChange={(electricityKwhPerMonth) =>
              setEnergy({ electricityKwhPerMonth })
            }
          />
          <NumberField
            label="Natural gas use"
            icon={Flame}
            unit="kWh/mo"
            value={value.energy.gasKwhPerMonth}
            onChange={(gasKwhPerMonth) => setEnergy({ gasKwhPerMonth })}
          />
        </div>
        <RangeField
          label="Share of electricity from renewables"
          suffix="%"
          value={value.energy.renewablePercent}
          onChange={(renewablePercent) => setEnergy({ renewablePercent })}
        />
      </fieldset>

      <fieldset className="flex flex-col gap-4">
        <Legend icon={Utensils}>Food &amp; goods</Legend>
        <SelectField
          label="Typical diet"
          icon={Utensils}
          value={value.diet.type}
          options={DIET_OPTIONS}
          onChange={(type) => setDiet({ type })}
        />
        <NumberField
          label="Spending on goods & shopping"
          icon={ShoppingBag}
          unit="$/mo"
          hint="Clothes, electronics, and other non-food purchases."
          value={value.goods.monthlySpendUsd}
          onChange={(monthlySpendUsd) => setGoods({ monthlySpendUsd })}
        />
      </fieldset>

      {formError ? (
        <p
          role="alert"
          className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:bg-red-950/50 dark:text-red-300"
        >
          {formError}
        </p>
      ) : null}

      <Button type="submit" size="lg" disabled={busy} className="w-full">
        {busy ? "Calculating…" : "Calculate my footprint"}
      </Button>
    </form>
  );
}
