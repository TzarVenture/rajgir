import type { ReactNode } from "react";
import type { IconType } from "react-icons";

/** Friendly placeholder for sections that have nothing to show yet. */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: IconType;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center rounded-card border border-dashed border-charcoal-300 bg-surface-soft px-6 py-10 text-center">
      <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white text-charcoal-500 shadow-[0_1px_2px_rgba(17,24,39,0.04)]">
        <Icon className="h-6 w-6" aria-hidden />
      </span>
      <h3 className="text-base font-bold text-charcoal-900">{title}</h3>
      {description ? <p className="mt-1 max-w-sm text-sm text-charcoal-500">{description}</p> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
