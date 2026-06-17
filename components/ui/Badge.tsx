import { cn } from "@/lib/cn";

type Tone = "brand" | "amber" | "rose" | "indigo" | "neutral";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
}

const tones: Record<Tone, string> = {
  brand: "bg-brand-100 text-brand-800 dark:bg-brand-900/60 dark:text-brand-100",
  amber: "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-100",
  rose: "bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-100",
  indigo:
    "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-100",
  neutral: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
};

/** A small status/label pill. */
export function Badge({ className, tone = "neutral", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}
