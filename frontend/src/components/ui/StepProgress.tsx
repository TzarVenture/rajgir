import { LuCheck } from "react-icons/lu";
import { cn } from "./cn";

/**
 * Progress through a long form. `current` is 1-based.
 * Desktop: numbered steps with connectors. Mobile: a compact bar with "Step x of n".
 */
export function StepProgress({ steps, current, className }: { steps: string[]; current: number; className?: string }) {
  const pct = Math.round((current / steps.length) * 100);
  return (
    <nav aria-label="Progress" className={className}>
      <div className="sm:hidden">
        <p className="text-sm font-semibold text-charcoal-900">
          Step {current} of {steps.length}: <span className="text-brand-red">{steps[current - 1]}</span>
        </p>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-charcoal-200" role="progressbar" aria-valuemin={1} aria-valuemax={steps.length} aria-valuenow={current}>
          <div className="h-full rounded-full bg-brand-red transition-all duration-200" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <ol className="hidden items-start sm:flex">
        {steps.map((label, index) => {
          const step = index + 1;
          const done = step < current;
          const active = step === current;
          return (
            <li key={label} className="flex flex-1 items-start" aria-current={active ? "step" : undefined}>
              <div className="flex flex-col items-center gap-2 text-center">
                <span
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-full border text-sm font-bold",
                    done && "border-[#15803D] bg-[#15803D] text-white",
                    active && "border-brand-red bg-brand-red text-white ring-4 ring-brand-red/15",
                    !done && !active && "border-charcoal-300 bg-white text-charcoal-500"
                  )}
                >
                  {done ? <LuCheck className="h-4 w-4" aria-label="Completed" /> : step}
                </span>
                <span className={cn("text-xs font-semibold", active ? "text-charcoal-900" : "text-charcoal-500")}>{label}</span>
              </div>
              {index < steps.length - 1 ? <span className={cn("mt-[18px] h-0.5 flex-1", done ? "bg-[#15803D]" : "bg-charcoal-200")} aria-hidden /> : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
