import { Sparkles } from "lucide-react";

/** Page hero: the product promise and a note on the AI provider. */
export function Hero() {
  return (
    <div className="mx-auto mb-10 max-w-2xl text-center">
      <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700 dark:bg-brand-900/40 dark:text-brand-300">
        <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
        Powered by Google Gemini
      </span>
      <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 sm:text-5xl">
        Understand and shrink your carbon footprint
      </h1>
      <p className="mx-auto mt-4 max-w-xl text-base text-slate-600 dark:text-slate-300 sm:text-lg">
        Answer a few questions about your everyday life to estimate your annual
        footprint, see where it comes from, and get practical, personalized
        actions to reduce it.
      </p>
    </div>
  );
}
