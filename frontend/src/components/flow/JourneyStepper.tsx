import Link from "next/link";
import { LuArrowRight, LuCheck } from "react-icons/lu";
import { Badge } from "@/components/ui";
import { NAV_ICONS } from "@/lib/navigation/icons";
import type { Journey, JourneyProgress } from "@/lib/navigation";
import type { NavStatus } from "@/lib/navigation";

const STATUS_BADGE: Record<NavStatus, { label: string; tone: "success" | "warning" | "neutral" } | null> = {
  live: null,
  partial: { label: "In progress", tone: "warning" },
  planned: { label: "Planned", tone: "neutral" },
};

type StepState = "done" | "current" | "todo";

function stateOf(index: number, progress?: JourneyProgress): StepState {
  if (!progress) return "todo";
  if (index < progress.done) return "done";
  if (index === progress.currentIndex && progress.done < progress.total) return "current";
  return "todo";
}

/**
 * The flow of one audience as numbered steps. Vertical = full explanation (how-it-works pages),
 * horizontal = compact strip (dashboard tracker, flow map). Pass `progress` to mark done / current steps.
 */
export function JourneyStepper({
  journey,
  progress,
  orientation = "vertical",
}: {
  journey: Journey;
  progress?: JourneyProgress;
  orientation?: "vertical" | "horizontal";
}) {
  if (orientation === "horizontal") {
    return (
      <ol className="flex gap-2 overflow-x-auto pb-1" aria-label={`${journey.headline}: steps`}>
        {journey.steps.map((step, i) => {
          const st = stateOf(i, progress);
          const Icon = NAV_ICONS[step.icon];
          return (
            <li key={`${step.title}-${i}`} className="min-w-[148px] flex-1">
              <Link
                href={step.href}
                aria-current={st === "current" ? "step" : undefined}
                className={`flex h-full flex-col gap-1.5 rounded-btn border p-2.5 text-xs transition-colors hover:border-brand-red ${
                  st === "done" ? "border-[#86EFAC] bg-[#F0FDF4]" : st === "current" ? "border-brand-red bg-brand-red-light" : "border-charcoal-200 bg-white"
                }`}
              >
                <span className="flex items-center gap-2">
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                      st === "done" ? "bg-[#16A34A] text-white" : st === "current" ? "bg-brand-red text-white" : "bg-charcoal-100 text-charcoal-600"
                    }`}
                  >
                    {st === "done" ? <LuCheck className="h-3.5 w-3.5" aria-hidden /> : i + 1}
                  </span>
                  <Icon className="h-4 w-4 text-charcoal-500" aria-hidden />
                </span>
                <span className="font-bold leading-snug text-charcoal-900">{step.title}</span>
                {STATUS_BADGE[step.status] ? <Badge tone={STATUS_BADGE[step.status]!.tone}>{STATUS_BADGE[step.status]!.label}</Badge> : null}
              </Link>
            </li>
          );
        })}
      </ol>
    );
  }

  return (
    <ol className="relative">
      {journey.steps.map((step, i) => {
        const st = stateOf(i, progress);
        const Icon = NAV_ICONS[step.icon];
        const last = i === journey.steps.length - 1;
        const badge = STATUS_BADGE[step.status];
        return (
          <li key={`${step.title}-${i}`} className="relative flex gap-4 pb-6 last:pb-0">
            {!last ? <span className="absolute left-[19px] top-10 h-[calc(100%-2.5rem)] w-0.5 bg-charcoal-200" aria-hidden /> : null}
            <span
              className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ring-4 ring-surface-soft ${
                st === "done" ? "bg-[#16A34A] text-white" : st === "current" ? "bg-brand-red text-white" : "bg-white text-charcoal-700 border border-charcoal-300"
              }`}
            >
              {st === "done" ? <LuCheck className="h-5 w-5" aria-hidden /> : i + 1}
            </span>
            <Link
              href={step.href}
              aria-current={st === "current" ? "step" : undefined}
              className={`group flex-1 rounded-card border bg-white p-4 transition-shadow hover:shadow-[0_4px_14px_rgba(17,24,39,0.08)] ${st === "current" ? "border-brand-red" : "border-charcoal-200"}`}
            >
              <span className="flex flex-wrap items-center gap-2">
                <Icon className="h-5 w-5 text-brand-red" aria-hidden />
                <span className="text-base font-bold text-charcoal-900">{step.title}</span>
                {st === "current" ? <Badge tone="brand">You are here</Badge> : null}
                {st === "done" ? <Badge tone="success">Done</Badge> : null}
                {badge ? <Badge tone={badge.tone}>{badge.label}</Badge> : null}
              </span>
              <span className="mt-1 block text-sm text-charcoal-600">{step.description}</span>
              <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-brand-red">
                Open <LuArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden />
              </span>
            </Link>
          </li>
        );
      })}
    </ol>
  );
}
