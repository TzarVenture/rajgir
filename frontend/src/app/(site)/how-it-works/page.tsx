import type { Metadata } from "next";
import Link from "next/link";
import { LuArrowRight } from "react-icons/lu";
import SiteHeader from "@/components/layout/SiteHeader";
import SiteFooter from "@/components/layout/SiteFooter";
import { Badge, Breadcrumb, Card, LinkButton, PageHero } from "@/components/ui";
import { SearchField } from "@/components/search/SearchField";
import { AUDIENCES, AUDIENCE_GROUPS, JOURNEYS } from "@/lib/navigation";
import { NAV_ICONS } from "@/lib/navigation/icons";

export const metadata: Metadata = {
  title: "How it works | Rajgir Marathon",
  description: "See the step-by-step flow for runners, volunteers, teams, companies, schools, sponsors, vendors, tourism partners, creators, media and visitors.",
};

/** Hub: "Who are you?" Each card previews the flow and opens the full step-by-step guide. */
export default function HowItWorksPage() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-white font-manrope text-charcoal-900">
      <SiteHeader />
      <main className="flex-1 bg-surface-soft">
        <div className="mx-auto w-full max-w-[1180px] px-4 pb-16 pt-6 sm:px-6 lg:px-8">
          <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "How it works" }]} />
          <PageHero
            eyebrow={<Badge tone="heritage">Run Through History</Badge>}
            title="How the Rajgir Marathon works"
            subtitle="Pick who you are. Each guide shows every step from the first visit to the finish, with a link to the page where you do it."
          />

          <SearchField className="mb-10" showChips={false} />

          {AUDIENCE_GROUPS.map((group) => (
            <section key={group} className="mb-10" aria-label={group}>
              <h2 className="mb-4 text-xs font-extrabold uppercase tracking-wider text-charcoal-500">{group}</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {AUDIENCES.filter((a) => a.group === group).map((a) => {
                  const Icon = NAV_ICONS[a.icon];
                  const journey = JOURNEYS[a.id];
                  return (
                    <Link key={a.id} href={`/how-it-works/${a.id}`} className="group rounded-card focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red">
                      <Card className="h-full transition-shadow group-hover:shadow-[0_4px_14px_rgba(17,24,39,0.08)]">
                        <div className="flex items-center gap-3">
                          <span className="flex h-11 w-11 items-center justify-center rounded-[10px] bg-brand-red-light text-brand-red">
                            <Icon className="h-6 w-6" aria-hidden />
                          </span>
                          <div>
                            <h3 className="text-base font-bold text-charcoal-900">{a.title}</h3>
                            <p className="text-xs text-charcoal-500">{journey.steps.length} steps</p>
                          </div>
                        </div>
                        <p className="mt-3 text-sm text-charcoal-600">{a.tagline}</p>
                        <ol className="mt-3 flex flex-wrap items-center gap-1.5 text-[11px] font-semibold text-charcoal-600">
                          {journey.steps.slice(0, 4).map((s, i) => (
                            <li key={s.title} className="flex items-center gap-1.5">
                              {i > 0 ? <span aria-hidden className="text-charcoal-300">›</span> : null}
                              <span className="rounded-full bg-charcoal-100 px-2 py-0.5">{s.title}</span>
                            </li>
                          ))}
                          {journey.steps.length > 4 ? <li className="text-charcoal-400">+{journey.steps.length - 4} more</li> : null}
                        </ol>
                        <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-brand-red">
                          See the full flow <LuArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden />
                        </span>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            </section>
          ))}

          <Card className="flex flex-col items-start justify-between gap-4 bg-surface-warm sm:flex-row sm:items-center">
            <div>
              <h2 className="text-lg font-bold">Not sure where you fit?</h2>
              <p className="mt-1 text-sm text-charcoal-600">Most people start as a runner or a visitor. You can always contact the organizers.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <LinkButton href="/register/runner">Register as a runner</LinkButton>
              <LinkButton href="/contact" variant="secondary">
                Contact us
              </LinkButton>
            </div>
          </Card>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
