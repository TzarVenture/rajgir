import type { ReactNode } from "react";
import type { IconType } from "react-icons";
import { Card } from "./Card";

/** Dashboard statistic: large Barlow Condensed value, supporting label, small icon. */
export function StatCard({
  label,
  value,
  icon: Icon,
  hint,
}: {
  label: string;
  value: ReactNode;
  icon?: IconType;
  hint?: string;
}) {
  return (
    <Card className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-charcoal-500">{label}</p>
        <p className="mt-1 font-barlow text-4xl font-bold leading-none text-charcoal-900">{value}</p>
        {hint ? <p className="mt-2 text-xs text-charcoal-500">{hint}</p> : null}
      </div>
      {Icon ? (
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-charcoal-100 text-charcoal-700">
          <Icon className="h-5 w-5" aria-hidden />
        </span>
      ) : null}
    </Card>
  );
}
