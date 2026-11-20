"use client";

import { useEffect, useState } from "react";
import { LuFlag, LuTimer } from "react-icons/lu";
import { Badge } from "@/components/ui";

/** Live countdown to the runner's gun time; switches to "in progress" and "complete" on race day. */
export function RaceCountdown({
  startIso,
  cutoffMinutes,
  startLabel,
  dateLabel,
}: {
  startIso: string;
  cutoffMinutes: number;
  startLabel: string;
  dateLabel: string;
}) {
  // Start empty so server and client render the same markup; fill in after mount.
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setNow(Date.now());
    const first = setTimeout(tick, 0);
    const id = setInterval(tick, 1000);
    return () => {
      clearTimeout(first);
      clearInterval(id);
    };
  }, []);

  const start = new Date(startIso).getTime();
  const end = start + cutoffMinutes * 60_000;
  const remaining = now == null ? null : start - now;

  const units =
    remaining != null && remaining > 0
      ? [
          { label: "Days", value: Math.floor(remaining / 86_400_000) },
          { label: "Hours", value: Math.floor((remaining % 86_400_000) / 3_600_000) },
          { label: "Minutes", value: Math.floor((remaining % 3_600_000) / 60_000) },
          { label: "Seconds", value: Math.floor((remaining % 60_000) / 1000) },
        ]
      : null;

  const phase = now == null ? "loading" : now < start ? "before" : now < end ? "live" : "done";

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2 text-sm text-charcoal-600">
        <LuTimer className="h-4 w-4 text-brand-red" aria-hidden />
        <span>
          Gun time <strong className="text-charcoal-900">{startLabel}</strong>, {dateLabel}
        </span>
      </div>

      {phase === "live" ? (
        <div className="flex items-center gap-3 rounded-card bg-[#DCFCE7] p-4 text-[#14532D]" role="status">
          <LuFlag className="h-6 w-6" aria-hidden />
          <div>
            <p className="font-bold">Your race is under way</p>
            <p className="text-sm">Results and splits appear here once the timing team publishes them.</p>
          </div>
        </div>
      ) : phase === "done" ? (
        <div className="flex items-center gap-3 rounded-card bg-surface-soft p-4" role="status">
          <LuFlag className="h-6 w-6 text-charcoal-700" aria-hidden />
          <div>
            <p className="font-bold text-charcoal-900">Race complete</p>
            <p className="text-sm text-charcoal-600">See your official result and splits below.</p>
          </div>
        </div>
      ) : (
        <div
          className="grid grid-cols-4 gap-2 sm:gap-3"
          role="timer"
          aria-live="off"
          aria-label={units ? `${units[0].value} days ${units[1].value} hours ${units[2].value} minutes to the start` : "Loading countdown"}
        >
          {(units ?? ["Days", "Hours", "Minutes", "Seconds"].map((label) => ({ label, value: null as number | null }))).map((u) => (
            <div key={u.label} className="rounded-card border border-charcoal-200 bg-surface-soft px-1 py-3 text-center">
              <span className="block font-barlow text-3xl font-bold tabular-nums leading-none text-charcoal-900 sm:text-4xl">
                {u.value == null ? "--" : String(u.value).padStart(2, "0")}
              </span>
              <span className="mt-1 block text-[11px] font-semibold uppercase tracking-wide text-charcoal-500">{u.label}</span>
            </div>
          ))}
        </div>
      )}

      {phase === "before" && remaining != null && remaining < 7 * 86_400_000 ? (
        <Badge tone="warning" className="mt-3">
          Race week: collect your kit at the expo
        </Badge>
      ) : null}
    </div>
  );
}
