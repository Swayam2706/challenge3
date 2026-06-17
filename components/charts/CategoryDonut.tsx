import { formatTonnes } from "@/lib/format";
import type { CategoryResult } from "@/lib/carbon/types";

interface CategoryDonutProps {
  breakdown: CategoryResult[];
  totalTonnes: number;
}

export const CATEGORY_COLORS: Record<string, string> = {
  transport: "#059669",
  energy: "#f59e0b",
  diet: "#f43f5e",
  goods: "#6366f1",
};

const RADIUS = 56;
const STROKE = 24;
const SIZE = 160;
const CENTER = SIZE / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/**
 * A lightweight, dependency-free donut chart drawn with stacked SVG arcs.
 *
 * Each category is one ring segment, sized by its share via `stroke-dasharray`.
 * The chart is purely decorative (`aria-hidden`): the parent renders the same
 * data as a textual legend and a screen-reader table, so no information lives
 * only in the graphic. Avoiding a charting library keeps the bundle small.
 */
export function CategoryDonut({ breakdown, totalTonnes }: CategoryDonutProps) {
  const total = breakdown.reduce((sum, b) => sum + b.annualKg, 0) || 1;

  let accumulated = 0;
  const segments = breakdown.map((item) => {
    const fraction = item.annualKg / total;
    const dash = fraction * CIRCUMFERENCE;
    const offset = -accumulated;
    accumulated += dash;
    return {
      key: item.category,
      color: CATEGORY_COLORS[item.category] ?? "#059669",
      dash,
      offset,
    };
  });

  return (
    <div className="relative h-44 w-44 shrink-0" aria-hidden="true">
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="h-full w-full">
        <g transform={`rotate(-90 ${CENTER} ${CENTER})`}>
          {/* Track */}
          <circle
            cx={CENTER}
            cy={CENTER}
            r={RADIUS}
            fill="none"
            strokeWidth={STROKE}
            className="stroke-slate-100 dark:stroke-slate-800"
          />
          {segments.map((seg) => (
            <circle
              key={seg.key}
              cx={CENTER}
              cy={CENTER}
              r={RADIUS}
              fill="none"
              stroke={seg.color}
              strokeWidth={STROKE}
              strokeDasharray={`${seg.dash} ${CIRCUMFERENCE - seg.dash}`}
              strokeDashoffset={seg.offset}
            />
          ))}
        </g>
      </svg>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xs text-slate-500 dark:text-slate-400">
          Total
        </span>
        <span className="text-lg font-bold text-slate-900 dark:text-slate-100">
          {formatTonnes(totalTonnes)}
        </span>
      </div>
    </div>
  );
}
