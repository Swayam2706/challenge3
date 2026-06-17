/** Locale-aware formatting helpers for emissions values. */

const numberFormatter = new Intl.NumberFormat("en", {
  maximumFractionDigits: 0,
});

const tonneFormatter = new Intl.NumberFormat("en", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 2,
});

/** Format a kilogram value, e.g. 4720 -> "4,720 kg".
 *
 * @example formatKg(4720) // "4,720 kg"
 */
export function formatKg(kg: number): string {
  return `${numberFormatter.format(Math.round(kg))} kg`;
}

/** Format a tonne value, e.g. 4.72 -> "4.72 t". */
export function formatTonnes(tonnes: number): string {
  return `${tonneFormatter.format(tonnes)} t`;
}

/** Format a 0–100 percentage, e.g. 42.3 -> "42%". */
export function formatPercent(value: number): string {
  return `${Math.round(value)}%`;
}

/** Format a multiplier comparison, e.g. 2.1 -> "2.1×". */
export function formatMultiplier(value: number): string {
  return `${value.toFixed(1)}×`;
}
