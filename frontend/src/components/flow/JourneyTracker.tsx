"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LuChevronDown, LuWaypoints } from "react-icons/lu";
import { JourneyStepper } from "./JourneyStepper";
import type { Journey, JourneyProgress } from "@/lib/navigation";

const KEY = "rajgir_journey_open";

/**
 * "Where am I in the flow?" strip shown on role dashboards. Collapsible; the choice is remembered.
 * Progress comes from the account state only (see lib/navigation/journeyProgress.ts).
 */
export function JourneyTracker({ journey, progress, audience }: { journey: Journey; progress: JourneyProgress; audience: string }) {
  const [open, setOpen] = useState(true);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (saved === "0") setOpen(false);
    } catch {
      /* storage unavailable */
    }
  }, []);

  const toggle = () => {
    setOpen((o) => {
      try {
        localStorage.setItem(KEY, o ? "0" : "1");
      } catch {
        /* ignore */
      }
      return !o;
    });
  };

  const next = journey.steps[progress.currentIndex];
  const finished = progress.done >= progress.total;

  return (
    <section aria-label="Your journey" className="mb-6 rounded-card border border-charcoal-200 bg-white">
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-brand-red-light text-brand-red">
            <LuWaypoints className="h-5 w-5" aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-charcoal-900">
              Your journey: {progress.done} of {progress.total} steps done
            </p>
            <p className="truncate text-xs text-charcoal-500">{finished ? "Everything is complete." : `Next: ${next.title}`}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden h-2 w-32 overflow-hidden rounded-full bg-charcoal-100 sm:block" role="progressbar" aria-valuenow={progress.percent} aria-valuemin={0} aria-valuemax={100} aria-label="Journey progress">
            <div className="h-full rounded-full bg-brand-red" style={{ width: `${progress.percent}%` }} />
          </div>
          <Link href={`/how-it-works/${audience}`} className="text-xs font-semibold text-brand-red hover:underline">
            Full guide
          </Link>
          <button type="button" onClick={toggle} aria-expanded={open} aria-label={open ? "Hide journey steps" : "Show journey steps"} className="flex h-9 w-9 items-center justify-center rounded-btn text-charcoal-500 hover:bg-charcoal-100">
            <LuChevronDown className={`h-5 w-5 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden />
          </button>
        </div>
      </div>
      {open ? (
        <div className="border-t border-charcoal-100 px-4 py-3">
          <JourneyStepper journey={journey} progress={progress} orientation="horizontal" />
        </div>
      ) : null}
    </section>
  );
}
