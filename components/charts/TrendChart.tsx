import { formatTonnes } from "@/lib/format";
import type { HistoryEntry } from "@/lib/storage";

interface TrendChartProps {
  history: HistoryEntry[];
}

const WIDTH = 320;
const HEIGHT = 140;
const PADDING = 12;

/**
 * A lightweight, dependency-free area/line chart of footprint estimates over
 * time, drawn directly as SVG.
 *
 * Marked `aria-hidden`: the parent renders an equivalent screen-reader data
 * table and a text summary of the trend, so the information is never locked in
 * the graphic. Avoiding a charting library keeps the bundle small.
 */
export function TrendChart({ history }: TrendChartProps) {
  const values = history.map((h) => h.totalAnnualKg / 1000);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const points = values.map((value, index) => {
    const x =
      PADDING +
      (values.length === 1
        ? (WIDTH - PADDING * 2) / 2
        : (index / (values.length - 1)) * (WIDTH - PADDING * 2));
    const y =
      HEIGHT - PADDING - ((value - min) / range) * (HEIGHT - PADDING * 2);
    return { x, y };
  });

  const linePath = points
    .map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`)
    .join(" ");
  const areaPath =
    `${linePath} L${points[points.length - 1]!.x.toFixed(1)},${HEIGHT - PADDING}` +
    ` L${points[0]!.x.toFixed(1)},${HEIGHT - PADDING} Z`;

  return (
    <div className="h-48 w-full" aria-hidden="true">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        preserveAspectRatio="none"
        className="h-full w-full"
      >
        <defs>
          <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#059669" stopOpacity={0.3} />
            <stop offset="100%" stopColor="#059669" stopOpacity={0} />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#trendFill)" stroke="none" />
        <path
          d={linePath}
          fill="none"
          stroke="#059669"
          strokeWidth={2.5}
          strokeLinejoin="round"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={3} fill="#047857" />
        ))}
      </svg>
      <p className="sr-only">
        Latest footprint {formatTonnes(values[values.length - 1] ?? 0)}.
      </p>
    </div>
  );
}
