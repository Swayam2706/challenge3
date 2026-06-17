import { Leaf } from "lucide-react";
import { Card } from "@/components/ui/Card";

/** Placeholder shown in the results column before the first calculation. */
export function EmptyState() {
  return (
    <Card className="flex h-full min-h-[24rem] flex-col items-center justify-center border-dashed p-10 text-center">
      <span className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-900/40 dark:text-brand-300">
        <Leaf className="h-8 w-8" aria-hidden="true" />
      </span>
      <p className="mt-5 max-w-sm text-slate-600 dark:text-slate-300">
        Fill in the form and select{" "}
        <span className="font-semibold text-slate-900 dark:text-slate-100">
          Calculate my footprint
        </span>{" "}
        to see your results and tailored tips here.
      </p>
    </Card>
  );
}
