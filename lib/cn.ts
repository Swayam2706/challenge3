import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Compose Tailwind class names safely.
 *
 * `clsx` handles conditional classes and `tailwind-merge` resolves conflicting
 * utilities (e.g. `px-2` vs `px-4`) so the last one wins. This is the standard
 * production pattern for building variant-driven components.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
