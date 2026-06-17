"use client";

import { memo, useState } from "react";
import { CheckCircle2, Target } from "lucide-react";
import { NumberField } from "@/components/ui/NumberField";
import { Button } from "@/components/ui/Button";
import { BENCHMARKS } from "@/lib/carbon/factors";
import { formatPercent, formatTonnes } from "@/lib/format";
import type { Goal } from "@/lib/storage";

interface GoalCardProps {
  currentAnnualKg: number;
  goal: Goal | null;
  onSave: (targetAnnualKg: number) => void;
}

/**
 * Lets the user set a reduction target and shows progress toward it. Progress
 * is conveyed with a labelled progress bar and in text. Memoized so it only
 * re-renders when its props change.
 */
function GoalCardImpl({ currentAnnualKg, goal, onSave }: GoalCardProps) {
  const defaultTargetTonnes = goal
    ? goal.targetAnnualKg / 1000
    : Number((BENCHMARKS.sustainableTargetKg / 1000).toFixed(1));
  const [targetTonnes, setTargetTonnes] = useState(defaultTargetTonnes);

  const targetKg = targetTonnes * 1000;
  const achieved = goal ? currentAnnualKg <= goal.targetAnnualKg : false;
  const progress = goal
    ? Math.min(
        100,
        Math.max(0, (goal.targetAnnualKg / Math.max(currentAnnualKg, 1)) * 100),
      )
    : 0;

  return (
    <section
      aria-labelledby="goal-heading"
      className="card flex flex-col gap-4 p-6"
    >
      <h2
        id="goal-heading"
        className="flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-slate-100"
      >
        <Target className="h-5 w-5 text-brand-600" aria-hidden="true" />
        Your reduction goal
      </h2>

      <form
        className="flex flex-wrap items-end gap-3"
        onSubmit={(event) => {
          event.preventDefault();
          onSave(targetKg);
        }}
      >
        <div className="w-44">
          <NumberField
            label="Target footprint"
            unit="t / yr"
            step={0.1}
            min={0.1}
            value={targetTonnes}
            onChange={setTargetTonnes}
          />
        </div>
        <Button type="submit">{goal ? "Update goal" : "Set goal"}</Button>
      </form>

      {goal ? (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600 dark:text-slate-300">
              Target: {formatTonnes(goal.targetAnnualKg / 1000)}
            </span>
            <span className="flex items-center gap-1 font-medium text-slate-800 dark:text-slate-200">
              {achieved ? (
                <>
                  <CheckCircle2
                    className="h-4 w-4 text-brand-600"
                    aria-hidden="true"
                  />
                  Goal met
                </>
              ) : (
                `${formatPercent(progress)} of the way`
              )}
            </span>
          </div>
          <div
            className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"
            role="progressbar"
            aria-valuenow={Math.round(progress)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Progress toward reduction goal"
          >
            <div
              className={`h-full rounded-full transition-all ${achieved ? "bg-brand-500" : "bg-amber-500"}`}
              style={{ width: `${progress}%` }}
            />
          </div>
          {!achieved ? (
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Cut about{" "}
              {formatTonnes((currentAnnualKg - goal.targetAnnualKg) / 1000)}{" "}
              more per year to reach your goal.
            </p>
          ) : null}
        </div>
      ) : (
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Set a target to start tracking your progress over time.
        </p>
      )}
    </section>
  );
}

export const GoalCard = memo(GoalCardImpl);
