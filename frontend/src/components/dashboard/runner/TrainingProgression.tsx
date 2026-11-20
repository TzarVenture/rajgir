import { LuCalendarRange, LuFootprints, LuRoute } from "react-icons/lu";
import { Badge } from "@/components/ui";
import { formatDate } from "@/lib/event";
import type { TrainingStatus } from "@/lib/training";

/** Weekly volume progression for the runner's category, with the current plan week emphasised. */
export function TrainingProgression({ plan, distance }: { plan: TrainingStatus; distance: string }) {
  const { weeks, totalWeeks, currentWeek } = plan;
  const max = Math.max(...weeks.map((w) => w.weeklyKm));
  const notStarted = currentWeek === 0;
  const finished = currentWeek > totalWeeks;
  const focusWeek = weeks[Math.min(Math.max(currentWeek, 1), totalWeeks) - 1];
  const { weeksUntilStart } = plan;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2 text-sm text-charcoal-600">
        {notStarted ? (
          <>
            <Badge tone="info">Plan starts {formatDate(plan.planStart)}</Badge>
            <span>
              {totalWeeks}-week build-up for the {distance}. {weeksUntilStart} weeks to go: keep a steady base of easy runs until then.
            </span>
          </>
        ) : finished ? (
          <Badge tone="success">Plan complete</Badge>
        ) : (
          <>
            <Badge tone="brand">
              Week {currentWeek} of {totalWeeks}
            </Badge>
            <Badge tone="neutral">{focusWeek.phase}</Badge>
            <span>{plan.daysToRace} days to race day</span>
          </>
        )}
      </div>

      {!finished ? (
        <dl className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {[
            { icon: LuRoute, label: notStarted ? "Week 1 volume" : "This week's volume", value: `${focusWeek.weeklyKm} km` },
            { icon: LuFootprints, label: "Long run", value: `${focusWeek.longRunKm} km` },
            { icon: LuCalendarRange, label: "Focus", value: focusWeek.focus, small: true },
          ].map((item) => (
            <div key={item.label} className="rounded-card border border-charcoal-200 bg-surface-soft p-3">
              <dt className="flex items-center gap-1.5 text-xs font-semibold text-charcoal-500">
                <item.icon className="h-4 w-4" aria-hidden /> {item.label}
              </dt>
              <dd className={item.small ? "mt-1 text-sm font-semibold text-charcoal-900" : "mt-1 font-barlow text-3xl font-bold text-charcoal-900"}>
                {item.value}
              </dd>
            </div>
          ))}
        </dl>
      ) : null}

      {/* Weekly km bars: one series, so no legend; the heading names it. */}
      <figure>
        <figcaption className="mb-2 text-xs font-semibold text-charcoal-500">Weekly running volume (km)</figcaption>
        <div className="flex h-40 items-end gap-[2px] border-b border-charcoal-200" role="list" aria-label="Weekly running volume">
          {weeks.map((w) => {
            const current = w.week === currentWeek;
            return (
              <div key={w.week} role="listitem" className="group relative flex h-full flex-1 items-end" tabIndex={0} aria-label={`Week ${w.week}, ${w.phase}: ${w.weeklyKm} km, long run ${w.longRunKm} km`}>
                <div
                  className={`w-full rounded-t-[4px] ${current ? "bg-brand-red" : w.week < currentWeek ? "bg-charcoal-400" : "bg-charcoal-200"}`}
                  style={{ height: `${Math.max(4, (w.weeklyKm / max) * 100)}%` }}
                />
                <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 hidden w-max -translate-x-1/2 rounded-btn bg-charcoal-900 px-2 py-1 text-[11px] text-white group-hover:block group-focus:block">
                  W{w.week} {w.phase}: {w.weeklyKm} km (long {w.longRunKm} km)
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-1 flex gap-[2px] text-[10px] text-charcoal-500" aria-hidden>
          {weeks.map((w) => (
            <span key={w.week} className={`flex-1 text-center ${w.week === currentWeek ? "font-bold text-charcoal-900" : ""}`}>
              {totalWeeks > 12 && w.week % 2 === 0 && w.week !== totalWeeks ? "" : w.week}
            </span>
          ))}
        </div>
      </figure>

      <details className="rounded-card border border-charcoal-200">
        <summary className="cursor-pointer px-4 py-3 text-sm font-semibold text-charcoal-800">Week-by-week table</summary>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead className="bg-surface-soft text-xs text-charcoal-500">
              <tr>
                <th className="px-4 py-2 font-semibold">Week</th>
                <th className="px-4 py-2 font-semibold">Starts</th>
                <th className="px-4 py-2 font-semibold">Phase</th>
                <th className="px-4 py-2 text-right font-semibold">Weekly km</th>
                <th className="px-4 py-2 text-right font-semibold">Long run</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal-200">
              {weeks.map((w) => (
                <tr key={w.week} className={w.week === currentWeek ? "bg-brand-red-light/60 font-semibold" : ""}>
                  <td className="px-4 py-2">{w.week}</td>
                  <td className="px-4 py-2">{formatDate(w.weekStart, { year: undefined })}</td>
                  <td className="px-4 py-2">{w.phase}</td>
                  <td className="px-4 py-2 text-right tabular-nums">{w.weeklyKm}</td>
                  <td className="px-4 py-2 text-right tabular-nums">{w.longRunKm} km</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
      <p className="text-xs text-charcoal-500">
        General guidance for healthy adults, not a personal coaching plan. Consult a doctor before starting if you have a medical condition.
      </p>
    </div>
  );
}
