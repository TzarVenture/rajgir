import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import SiteHeader from "@/components/layout/SiteHeader";
import SiteFooter from "@/components/layout/SiteFooter";
import { JourneyStepper } from "@/components/flow/JourneyStepper";
import { Badge, Breadcrumb, Card, LinkButton, PageHero } from "@/components/ui";
import { getCurrentUser } from "@/lib/auth/session";
import { AUDIENCES, audienceForRole, findAudience, journeyFor, journeyProgress } from "@/lib/navigation";
import { NAV_ICONS } from "@/lib/navigation/icons";

type Params = { params: Promise<{ audience: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { audience } = await params;
  const a = findAudience(audience);
  return a ? { title: `How it works for ${a.title} | Rajgir Marathon`, description: a.tagline } : {};
}

/** One audience's flow from first visit to the finished event. Signed-in users of that role see their progress. */
export default async function JourneyPage({ params }: Params) {
  const { audience } = await params;
  const a = findAudience(audience);
  const journey = journeyFor(audience);
  if (!a || !journey) notFound();

  const user = await getCurrentUser();
  const mine = user && !user.isPending && audienceForRole(user.role) === a.id;
  const progress = mine ? journeyProgress(journey, user) : undefined;
  const Icon = NAV_ICONS[a.icon];
  const others = AUDIENCES.filter((x) => x.id !== a.id);

  return (
    <div className="flex min-h-screen w-full flex-col bg-white font-manrope text-charcoal-900">
      <SiteHeader />
      <main className="flex-1 bg-surface-soft">
        <div className="mx-auto w-full max-w-[1040px] px-4 pb-16 pt-6 sm:px-6 lg:px-8">
          <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "How it works", href: "/how-it-works" }, { label: a.title }]} />
          <PageHero
            eyebrow={
              <Badge tone="heritage">
                <Icon className="h-3.5 w-3.5" aria-hidden /> {a.title}
              </Badge>
            }
            title={journey.headline}
            subtitle={journey.summary}
          >
            <div className="flex flex-wrap items-center gap-3">
              <LinkButton href={a.startHref}>{a.startLabel}</LinkButton>
              {progress ? (
                <Badge tone="brand">
                  You have completed {progress.done} of {progress.total} steps
                </Badge>
              ) : null}
            </div>
          </PageHero>

          <JourneyStepper journey={journey} progress={progress} />

          <section className="mt-12" aria-label="Other journeys">
            <h2 className="mb-3 text-base font-bold text-charcoal-900">Other ways to take part</h2>
            <div className="flex flex-wrap gap-2">
              {others.map((o) => (
                <Link key={o.id} href={`/how-it-works/${o.id}`} className="rounded-full border border-charcoal-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-charcoal-700 hover:border-brand-red hover:text-brand-red">
                  {o.title}
                </Link>
              ))}
            </div>
          </section>

          <Card className="mt-10 flex flex-col items-start justify-between gap-4 bg-surface-warm sm:flex-row sm:items-center">
            <div>
              <h2 className="text-lg font-bold">Ready to start?</h2>
              <p className="mt-1 text-sm text-charcoal-600">{a.tagline}</p>
            </div>
            <LinkButton href={a.startHref}>{a.startLabel}</LinkButton>
          </Card>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
