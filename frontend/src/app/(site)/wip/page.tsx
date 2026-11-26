"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LuLogOut } from "react-icons/lu";
import SiteHeader from "@/components/layout/SiteHeader";
import SiteFooter from "@/components/layout/SiteFooter";
import { StatusBadge } from "@/components/modules/ModulePage";
import { JourneyStepper } from "@/components/flow/JourneyStepper";
import { Badge, Breadcrumb, Button, Card, LinkButton, Notice, PageHero } from "@/components/ui";
import { ADMIN_NAV, ALL_ROLE_KEYS, AUDIENCES, JOURNEYS, PUBLIC_NAV, flattenPublic, hrefOf, roleNavItems } from "@/lib/navigation";
import { NAV_ICONS } from "@/lib/navigation/icons";
import type { NavStatus } from "@/lib/navigation";

const ROLE_TITLES: Record<string, string> = {
  runner: "Runner",
  volunteer: "Volunteer",
  influencer: "Influencer / Creator",
  team: "Team / Running Club",
  corporate: "Corporate",
  school: "School",
  sponsor: "Sponsor",
  vendor: "Vendor",
  tourism: "Tourism Partner",
};

function Row({ title, href, status }: { title: string; href: string; status: NavStatus }) {
  return (
    <li className="flex items-center justify-between gap-3 py-1.5">
      <Link href={href} className="min-w-0 truncate text-sm font-medium text-charcoal-800 hover:text-brand-red hover:underline">
        {title}
      </Link>
      <StatusBadge status={status} />
    </li>
  );
}

function count(statuses: NavStatus[]) {
  return {
    live: statuses.filter((s) => s === "live").length,
    partial: statuses.filter((s) => s === "partial").length,
    planned: statuses.filter((s) => s === "planned").length,
  };
}

/** Platform map: every module and sub-page from the PRD, with its build status. Used by the team to navigate and track the UI skeleton. */
export default function PlatformMap() {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/preview", { method: "DELETE" });
    router.push("/");
    router.refresh();
  };

  const publicNodes = flattenPublic().filter((n) => n.path !== "/login");
  const roleSections = ALL_ROLE_KEYS.map((key) => ({ key, items: roleNavItems(key).filter((i) => i.href !== "/") }));
  const totals = count([
    ...publicNodes.map((n) => n.status),
    ...roleSections.flatMap((r) => r.items.map((i) => i.status)),
    ...ADMIN_NAV.map((i) => i.status),
  ]);

  return (
    <div className="flex min-h-screen w-full flex-col bg-white font-manrope text-charcoal-900">
      <SiteHeader />
      <main className="flex-1 bg-surface-soft">
        <div className="mx-auto w-full max-w-[1180px] px-4 pb-16 pt-6 sm:px-6 lg:px-8">
          <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Platform map" }]} />
          <PageHero
            eyebrow={<Badge>Stakeholder preview environment</Badge>}
            title="Platform flow map"
            subtitle="The whole project on one page: who uses it, the steps each person goes through, and every module behind those steps with its build status. Live = real page, In progress = prototype or static content, Planned = placeholder."
          >
            <div className="flex flex-wrap gap-3">
              <LinkButton href="/" variant="secondary" size="md">
                Real marathon home
              </LinkButton>
              <LinkButton href="/coming-soon" variant="secondary" size="md">
                Public coming soon view
              </LinkButton>
              <Button type="button" variant="secondary" size="md" icon={LuLogOut} onClick={handleLogout}>
                Lock and exit
              </Button>
            </div>
          </PageHero>

          <Notice tone="success" title="Preview session active" className="mb-6">
            The Coming Soon page remains active for public visitors while you can open every page below.{" "}
            <span className="font-mono text-xs">ENV: COMING_SOON=true</span>
          </Notice>

          <div className="mb-8 flex flex-wrap items-center gap-3 text-sm">
            <span className="font-semibold text-charcoal-700">{totals.live + totals.partial + totals.planned} pages:</span>
            <Badge tone="success">{totals.live} live</Badge>
            <Badge tone="warning">{totals.partial} in progress</Badge>
            <Badge tone="neutral">{totals.planned} planned</Badge>
          </div>

          <h2 className="mb-1 text-lg font-bold text-charcoal-900">Flow by audience</h2>
          <p className="mb-4 text-sm text-charcoal-600">Each lane is the journey of one kind of participant, in order. Click a step to open its page.</p>
          <div className="mb-10 space-y-4">
            {AUDIENCES.map((a) => {
              const Icon = NAV_ICONS[a.icon];
              const journey = JOURNEYS[a.id];
              const steps = journey.steps;
              const counts = count(steps.map((x) => x.status));
              return (
                <Card key={a.id}>
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-brand-red-light text-brand-red">
                        <Icon className="h-5 w-5" aria-hidden />
                      </span>
                      <div>
                        <Link href={`/how-it-works/${a.id}`} className="text-base font-bold text-charcoal-900 hover:text-brand-red">
                          {a.title}
                        </Link>
                        <p className="text-xs text-charcoal-500">{a.tagline}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <Badge tone="success">{counts.live} live</Badge>
                      <Badge tone="warning">{counts.partial} in progress</Badge>
                      <Badge tone="neutral">{counts.planned} planned</Badge>
                    </div>
                  </div>
                  <JourneyStepper journey={journey} orientation="horizontal" />
                </Card>
              );
            })}
          </div>

          <h2 className="mb-4 text-lg font-bold text-charcoal-900">Public website</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {PUBLIC_NAV.filter((n) => n.path !== "/login").map((mod) => (
              <Card key={mod.path}>
                <div className="mb-2 flex items-start justify-between gap-2">
                  <Link href={hrefOf(mod)} className="text-base font-bold text-charcoal-900 hover:text-brand-red">
                    {mod.title}
                  </Link>
                  <StatusBadge status={mod.status} />
                </div>
                {mod.children?.length ? (
                  <ul className="divide-y divide-charcoal-100 border-t border-charcoal-100">
                    {mod.children.map((c) => (
                      <Row key={c.path} title={c.title} href={hrefOf(c)} status={c.status} />
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-charcoal-600">{mod.description}</p>
                )}
              </Card>
            ))}
          </div>

          <h2 className="mb-1 mt-10 text-lg font-bold text-charcoal-900">Role dashboards</h2>
          <p className="mb-4 text-sm text-charcoal-600">Sign in as the role to open these (each role can only open its own dashboard).</p>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {roleSections.map(({ key, items }) => (
              <Card key={key}>
                <h3 className="mb-2 text-base font-bold text-charcoal-900">{ROLE_TITLES[key]}</h3>
                <ul className="divide-y divide-charcoal-100 border-t border-charcoal-100">
                  {items.map((i) => (
                    <Row key={i.href} title={i.label} href={i.href} status={i.status} />
                  ))}
                </ul>
              </Card>
            ))}
          </div>

          <h2 className="mb-1 mt-10 text-lg font-bold text-charcoal-900">Admin console</h2>
          <p className="mb-4 text-sm text-charcoal-600">Staff accounts only (Organizer / Super Admin).</p>
          <Card>
            <ul className="grid gap-x-8 sm:grid-cols-2 lg:grid-cols-3">
              {ADMIN_NAV.map((i) => (
                <Row key={i.href} title={i.label} href={i.href} status={i.status} />
              ))}
            </ul>
          </Card>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
