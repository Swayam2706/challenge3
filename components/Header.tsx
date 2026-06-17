import { Leaf } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

/** Sticky site header with the product identity and theme toggle. */
export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/80 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-950/80">
      <div className="container flex items-center justify-between py-3.5">
        <div className="flex items-center gap-2.5">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white shadow-soft">
            <Leaf className="h-5 w-5" aria-hidden="true" />
          </span>
          <div className="leading-tight">
            <p className="text-base font-bold tracking-tight text-slate-900 dark:text-slate-100">
              EcoTrack
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Understand · Track · Reduce
            </p>
          </div>
        </div>
        <ThemeToggle />
      </div>
    </header>
  );
}
