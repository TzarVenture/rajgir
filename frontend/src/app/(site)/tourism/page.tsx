import type { Metadata } from "next";
import { LuBed, LuCompass, LuLandmark, LuMountain, LuPhone, LuTrainFront, LuUtensils } from "react-icons/lu";
import type { IconType } from "react-icons";
import SiteHeader from "@/components/layout/SiteHeader";
import SiteFooter from "@/components/layout/SiteFooter";
import { Badge, Breadcrumb, Card, LinkButton, PageHero } from "@/components/ui";
import { ADVENTURE, EMERGENCY, GETTING_HERE, HOTELS, PACKAGES, RESTAURANTS, TEMPLES_AND_SIGHTS } from "@/lib/tourism";
import type { Listing, Place } from "@/lib/tourism";

export const metadata: Metadata = {
  title: "Tourism | Rajgir Marathon",
  description: "Plan your Rajgir Marathon trip: hotels, travel, temples, food, adventure activities and emergency numbers.",
};

function SectionTitle({ icon: Icon, title, id }: { icon: IconType; title: string; id: string }) {
  return (
    <h2 id={id} className="mb-4 mt-10 flex scroll-mt-24 items-center gap-2 font-barlow text-2xl font-bold uppercase text-charcoal-900">
      <Icon className="h-6 w-6 text-brand-red" aria-hidden /> {title}
    </h2>
  );
}

function PlaceGrid({ items }: { items: Place[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((p) => (
        <Card key={p.name}>
          <Badge tone="heritage">{p.tag}</Badge>
          <h3 className="mt-3 text-base font-bold">{p.name}</h3>
          <p className="mt-1 text-sm text-charcoal-600">{p.blurb}</p>
        </Card>
      ))}
    </div>
  );
}

function ListingGrid({ items }: { items: Listing[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {items.map((l) => (
        <Card key={l.name}>
          <p className="text-xs font-semibold text-charcoal-500">{l.category}</p>
          <h3 className="mt-1 text-base font-bold">{l.name}</h3>
          <p className="mt-1 text-sm text-charcoal-600">{l.note}</p>
          <p className="mt-3 text-xs font-semibold text-charcoal-500">{l.distance}</p>
        </Card>
      ))}
    </div>
  );
}

export default function TourismPage() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-white font-manrope text-charcoal-900">
      <SiteHeader />
      <main className="flex-1 bg-surface-soft">
        <div className="mx-auto w-full max-w-[1040px] px-4 pb-16 pt-6 sm:px-6 lg:px-8">
          <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Tourism" }]} />
          <PageHero
            eyebrow={<Badge tone="heritage">Run Through History</Badge>}
            title="Visit Rajgir"
            subtitle="Make race weekend a trip: ancient Buddhist sites, hot springs, hill views and Bihari food, all within a few kilometres of the start line."
          />

          <SectionTitle id="sights" icon={LuLandmark} title="Temples and heritage" />
          <PlaceGrid items={TEMPLES_AND_SIGHTS} />

          <SectionTitle id="adventure" icon={LuMountain} title="Adventure activities" />
          <PlaceGrid items={ADVENTURE} />

          <SectionTitle id="hotels" icon={LuBed} title="Where to stay" />
          <ListingGrid items={HOTELS} />

          <SectionTitle id="food" icon={LuUtensils} title="Restaurants and local food" />
          <ListingGrid items={RESTAURANTS} />

          <SectionTitle id="travel" icon={LuTrainFront} title="Getting here" />
          <div className="grid gap-4 sm:grid-cols-2">
            {GETTING_HERE.map((t) => (
              <Card key={t.mode}>
                <div className="flex items-center gap-2">
                  <Badge tone="info">{t.mode}</Badge>
                  <h3 className="text-base font-bold">{t.route}</h3>
                </div>
                <p className="mt-2 text-sm text-charcoal-600">{t.detail}</p>
              </Card>
            ))}
          </div>
          <p className="mt-3 text-xs text-charcoal-500">
            Flight, train and bus booking happen on partner sites for now. Official airport and station shuttles can be added when you register.
          </p>

          <SectionTitle id="packages" icon={LuCompass} title="Travel packages" />
          <div className="grid gap-4 sm:grid-cols-2">
            {PACKAGES.map((p) => (
              <Card key={p.name}>
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-base font-bold">{p.name}</h3>
                  <Badge tone="neutral">{p.nights}</Badge>
                </div>
                <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-charcoal-600">
                  {p.includes.map((i) => (
                    <li key={i}>{i}</li>
                  ))}
                </ul>
                <div className="mt-4">
                  <Badge tone="warning">{p.status}</Badge>
                </div>
              </Card>
            ))}
          </div>

          <SectionTitle id="emergency" icon={LuPhone} title="Emergency services" />
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {EMERGENCY.map((e) => (
              <Card key={e.label} className="text-center">
                <p className="text-xs font-semibold text-charcoal-500">{e.label}</p>
                <a href={`tel:${e.number}`} className="font-barlow text-3xl font-bold text-brand-red hover:underline">
                  {e.number}
                </a>
              </Card>
            ))}
          </div>

          <Card className="mt-10 flex flex-col items-start justify-between gap-4 bg-surface-warm sm:flex-row sm:items-center">
            <div>
              <h3 className="text-lg font-bold">Run a hotel, taxi fleet or tour business in Rajgir?</h3>
              <p className="mt-1 text-sm text-charcoal-600">List your services for visiting runners and offer them a discount.</p>
            </div>
            <LinkButton href="/register/tourism">Become a tourism partner</LinkButton>
          </Card>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
