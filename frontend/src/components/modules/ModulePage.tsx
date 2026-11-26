import Link from "next/link";
import { LuArrowRight } from "react-icons/lu";
import { Badge, Breadcrumb, Card, LinkButton, Notice, PageHero } from "@/components/ui";
import type { BadgeTone, Crumb } from "@/components/ui";
import { NAV_ICONS } from "@/lib/navigation/icons";
import type { ModuleView, NavStatus } from "@/lib/navigation/types";

const STATUS: Record<NavStatus, { label: string; tone: BadgeTone }> = {
  live: { label: "Live", tone: "success" },
  partial: { label: "In progress", tone: "warning" },
  planned: { label: "Planned", tone: "neutral" },
};

export function StatusBadge({ status }: { status: NavStatus }) {
  const s = STATUS[status];
  return <Badge tone={s.tone}>{s.label}</Badge>;
}

/**
 * Shared placeholder for every PRD module / sub-page that does not have its own screen yet.
 * Shows what the module is, its status, links to its sub-pages and the PRD capabilities it will cover.
 */
export function ModulePage({
  view,
  trail,
  backHref,
  backLabel = "Back to home",
}: {
  view: ModuleView;
  /** Breadcrumb trail (public pages). */
  trail?: Crumb[];
  backHref: string;
  backLabel?: string;
}) {
  const Icon = view.icon ? NAV_ICONS[view.icon] : null;
  return (
    <div>
      {trail ? <Breadcrumb items={trail} /> : null}
      <PageHero
        eyebrow={
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={view.status} />
            {view.phase ? <Badge tone="heritage">{view.phase}</Badge> : null}
          </div>
        }
        title={view.title}
        subtitle={view.description}
      />

      {view.status !== "live" ? (
        <Notice tone="info" title="This section is being built" className="mb-8">
          It is part of the Rajgir Marathon platform plan. The navigation is ready; the full screen will be added soon.
          
        </Notice>
      ) : null}

      {view.links && view.links.length > 0 ? (
        <section aria-label="In this section" className="mb-10">
          <h2 className="mb-4 text-base font-bold text-charcoal-900">In this section</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {view.links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="group rounded-card focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red"
              >
                <Card className="h-full transition-shadow group-hover:shadow-[0_4px_14px_rgba(17,24,39,0.08)]">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-base font-bold text-charcoal-900">{l.title}</h3>
                    <StatusBadge status={l.status} />
                  </div>
                  {l.description ? <p className="mt-1 text-sm text-charcoal-600">{l.description}</p> : null}
                  <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-brand-red">
                    Open <LuArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden />
                  </span>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {view.features && view.features.length > 0 ? (
        <section aria-label="Planned capabilities" className="mb-10">
          <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-charcoal-900">
            {Icon ? <Icon className="h-5 w-5 text-brand-red" aria-hidden /> : null}
            Planned capabilities
          </h2>
          <Card>
            <ul className="grid gap-x-8 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
              {view.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-charcoal-700">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-red" aria-hidden />
                  {f}
                </li>
              ))}
            </ul>
          </Card>
        </section>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <LinkButton href={backHref} variant="secondary" size="md">
          {backLabel}
        </LinkButton>
        <LinkButton href="/contact" variant="tertiary" size="md">
          Questions? Contact the organizers
        </LinkButton>
      </div>
    </div>
  );
}
