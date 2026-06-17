import { Lock, Sparkles } from "lucide-react";

/** Site footer with transparency notes about methodology and privacy. */
export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
      <div className="container py-8">
        <div className="grid gap-4 text-sm text-slate-500 dark:text-slate-400 sm:grid-cols-2">
          <p className="flex items-start gap-2">
            <Lock className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" aria-hidden="true" />
            <span>
              Your data stays on your device. Estimates use published average
              emission factors (DEFRA, EPA, and peer-reviewed dietary studies)
              and are intended for awareness, not regulatory reporting.
            </span>
          </p>
          <p className="flex items-start gap-2">
            <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" aria-hidden="true" />
            <span>
              AI-personalized insights are powered by Google Gemini when
              configured, with a built-in fallback so EcoTrack always works.
            </span>
          </p>
        </div>
        <p className="mt-6 text-xs text-slate-400 dark:text-slate-500">
          © {new Date().getFullYear()} EcoTrack. Built for a more sustainable
          everyday.
        </p>
      </div>
    </footer>
  );
}
