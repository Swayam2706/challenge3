/** Loading placeholder shown while personalized insights are generated. */
export function InsightsSkeleton() {
  return (
    <section aria-hidden="true" className="flex flex-col gap-4">
      <div className="skeleton h-6 w-56" />
      <div className="skeleton h-4 w-full" />
      <div className="skeleton h-4 w-3/4" />
      <div className="grid gap-4 sm:grid-cols-2">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex flex-col gap-3 rounded-2xl border border-slate-200 p-5 dark:border-slate-800"
          >
            <div className="skeleton h-9 w-9 rounded-xl" />
            <div className="skeleton h-5 w-2/3" />
            <div className="skeleton h-4 w-full" />
            <div className="skeleton h-4 w-1/2" />
          </div>
        ))}
      </div>
    </section>
  );
}
