import type { ReactNode } from "react";
import { Card } from "@/components/ui";

/** Compact page heading used at the top of every dashboard. */
export function DashboardHeading({
  eyebrow,
  title,
  subtitle,
  actions,
}: {
  eyebrow?: ReactNode;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div className="min-w-0">
        {eyebrow ? <div className="mb-2 flex flex-wrap items-center gap-2">{eyebrow}</div> : null}
        <h1 className="font-barlow text-[28px] font-bold leading-tight text-charcoal-900 sm:text-[36px]">{title}</h1>
        {subtitle ? <p className="mt-1 break-words text-sm text-charcoal-600">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </header>
  );
}

/** White card with a heading row and an optional right-aligned tag. */
export function SectionCard({
  title,
  tag,
  description,
  children,
}: {
  title: string;
  tag?: ReactNode;
  description?: string;
  children: ReactNode;
}) {
  return (
    <Card className="flex flex-col">
      <div className="mb-4 flex items-start justify-between gap-3 border-b border-charcoal-200 pb-3">
        <div>
          <h2 className="text-base font-bold text-charcoal-900">{title}</h2>
          {description ? <p className="mt-0.5 text-sm text-charcoal-500">{description}</p> : null}
        </div>
        {tag}
      </div>
      {children}
    </Card>
  );
}

/** Label / value rows inside a soft panel. */
export function DetailList({ rows }: { rows: { label: string; value: ReactNode }[] }) {
  return (
    <dl className="divide-y divide-charcoal-200 rounded-card border border-charcoal-200 bg-surface-soft px-4">
      {rows.map((row) => (
        <div key={row.label} className="flex flex-col gap-0.5 py-3 text-sm sm:flex-row sm:justify-between sm:gap-4">
          <dt className="text-charcoal-500">{row.label}</dt>
          <dd className="font-semibold text-charcoal-900 sm:text-right">{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}
