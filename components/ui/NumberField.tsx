"use client";

import { useId } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

interface NumberFieldProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  /** Optional unit shown after the input (e.g. "km", "kWh"). */
  unit?: string;
  /** Optional helper text describing the field. */
  hint?: string;
  /** Validation error message; presence marks the field invalid. */
  error?: string;
  /** Optional leading icon for visual context. */
  icon?: LucideIcon;
}

/**
 * An accessible numeric input.
 *
 * - The label is programmatically associated with the input.
 * - Hints and errors are linked via `aria-describedby`.
 * - `aria-invalid` is set when an error is present, and the error is announced
 *   to assistive technology via `role="alert"`.
 */
export function NumberField({
  label,
  value,
  onChange,
  min = 0,
  max,
  step = 1,
  unit,
  hint,
  error,
  icon: Icon,
}: NumberFieldProps) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;

  const describedBy =
    [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(" ") ||
    undefined;

  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className="flex items-center gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-200"
      >
        {Icon ? (
          <Icon className="h-4 w-4 text-slate-400" aria-hidden="true" />
        ) : null}
        {label}
      </label>
      <div className="relative flex items-center">
        <input
          id={id}
          type="number"
          inputMode="decimal"
          value={Number.isFinite(value) ? value : ""}
          min={min}
          max={max}
          step={step}
          aria-describedby={describedBy}
          aria-invalid={error ? true : undefined}
          onChange={(event) => {
            const next = event.target.valueAsNumber;
            onChange(Number.isNaN(next) ? 0 : next);
          }}
          className={cn(
            "w-full rounded-xl border bg-white px-3.5 py-2.5 text-slate-900 shadow-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 dark:bg-slate-900 dark:text-slate-100",
            unit && "pr-14",
            error
              ? "border-red-400 dark:border-red-500"
              : "border-slate-300 dark:border-slate-700",
          )}
        />
        {unit ? (
          <span
            className="pointer-events-none absolute right-3.5 text-sm text-slate-400"
            aria-hidden="true"
          >
            {unit}
          </span>
        ) : null}
      </div>
      {hint ? (
        <p id={hintId} className="text-xs text-slate-500 dark:text-slate-400">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p
          id={errorId}
          role="alert"
          className="text-xs font-medium text-red-600 dark:text-red-400"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}
