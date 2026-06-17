"use client";

import { useId } from "react";
import { ChevronDown, type LucideIcon } from "lucide-react";

interface SelectOption<T extends string> {
  value: T;
  label: string;
}

interface SelectFieldProps<T extends string> {
  label: string;
  value: T;
  options: ReadonlyArray<SelectOption<T>>;
  onChange: (value: T) => void;
  hint?: string;
  icon?: LucideIcon;
}

/**
 * An accessible select control. The label is associated with the native
 * `<select>` and an optional hint is linked via `aria-describedby`, keeping
 * keyboard and screen-reader behaviour fully native.
 */
export function SelectField<T extends string>({
  label,
  value,
  options,
  onChange,
  hint,
  icon: Icon,
}: SelectFieldProps<T>) {
  const id = useId();
  const hintId = `${id}-hint`;

  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className="flex items-center gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-200"
      >
        {Icon ? <Icon className="h-4 w-4 text-slate-400" aria-hidden="true" /> : null}
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          value={value}
          aria-describedby={hint ? hintId : undefined}
          onChange={(event) => onChange(event.target.value as T)}
          className="w-full appearance-none rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 pr-10 text-slate-900 shadow-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
          aria-hidden="true"
        />
      </div>
      {hint ? (
        <p id={hintId} className="text-xs text-slate-500 dark:text-slate-400">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
