"use client";

import { useId } from "react";
import { Leaf } from "lucide-react";

interface RangeFieldProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  /** Renders the current value with this suffix (e.g. "%"). */
  suffix?: string;
}

/**
 * An accessible slider. The current value is shown visibly and exposed to
 * assistive technology via `aria-valuetext`, so screen-reader users hear a
 * meaningful value (e.g. "40 percent") rather than a bare number.
 */
export function RangeField({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  suffix = "",
}: RangeFieldProps) {
  const id = useId();

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <label
          htmlFor={id}
          className="flex items-center gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-200"
        >
          <Leaf className="h-4 w-4 text-slate-400" aria-hidden="true" />
          {label}
        </label>
        <span className="rounded-lg bg-brand-50 px-2 py-0.5 text-sm font-semibold text-brand-700 dark:bg-brand-900/40 dark:text-brand-300">
          {value}
          {suffix}
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-valuetext={`${value}${suffix ? ` ${suffix}` : ""}`}
        onChange={(event) => onChange(event.target.valueAsNumber)}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-brand-600 dark:bg-slate-700"
      />
    </div>
  );
}
