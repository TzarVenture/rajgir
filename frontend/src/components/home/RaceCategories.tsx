import Link from "next/link";
import type { CSSProperties } from "react";
import { CATEGORY_OPS, formatClock, formatCutoff, formatINR } from "@/lib/event";
import { raceCategories as registrationCategories } from "@/lib/schemas/runnerRegistration";
import { Reveal } from "./Reveal";
import { SiteIcon } from "./art/SiteIcons";
import { SectionHeading } from "./SectionHeading";

interface Card {
  distance: string;
  name: string;
  badge: string;
  badgeClass: string;
  description: string;
  terrain: string;
  perks: string[];
  featured?: boolean;
}

const CARDS: Card[] = [
  {
    distance: "42.2 KM",
    name: "Full Heritage Marathon",
    badge: "Flagship Race",
    badgeClass: "bg-[#E31B23] text-white",
    description: "The complete historic circuit through Rajgir's five sacred hills and ancient Magadha fortifications.",
    terrain: "Rolling valley & hill roads",
    perks: ["RFID bib timing chip & live SMS splits", "Technical dry-fit running jersey", "Commemorative alloy finisher medal"],
  },
  {
    distance: "21.1 KM",
    name: "Half Marathon",
    badge: "Most Popular",
    badgeClass: "bg-[#F5A623] text-neutral-900",
    description: "A fast, scenic route connecting Vishwa Shanti Stupa and the ancient 2,500-year Cyclopean Wall.",
    terrain: "Gentle incline circuit",
    perks: ["RFID bib timing chip with split mats", "Technical dry-fit running jersey", "Bespoke Stupa finisher medal"],
    featured: true,
  },
  {
    distance: "10 KM",
    name: "Rajgir Hill Challenge",
    badge: "Timed Challenge",
    badgeClass: "bg-[#111827] text-white",
    description: "A high-energy competitive run through pristine forested trails and revered valley heritage sites.",
    terrain: "Scenic forest foothills",
    perks: ["RFID bib timing chip & finish timing", "Exclusive finisher souvenir medal", "Dry-fit technical running tee"],
  },
  {
    distance: "5 KM",
    name: "Heritage Dream Run",
    badge: "Community & Family",
    badgeClass: "bg-emerald-600 text-white",
    description: "A celebration of health, culture, and community for runners, youth, and families of all levels.",
    terrain: "Flat & fast scenic circuit",
    perks: ["Commemorative heritage finisher souvenir", "Official Rajgir Marathon event T-shirt", "Hydration & energy refreshments"],
  },
  {
    distance: "3 KM",
    name: "Family & Kids Fun Run",
    badge: "Kids & Family",
    badgeClass: "bg-[#7C3AED] text-white",
    description: "A joyful, untimed run for young runners and their families. Come as a team and finish together.",
    terrain: "Short, flat family route",
    perks: ["Open to young runners from age 5", "Untimed, relaxed pace", "Run together as a family"],
  },
];

/** Race categories: five cards with distance, fee, minimum age, start time and cut-off pulled from the event data. */
export function RaceCategories() {
  return (
    <section id="categories" className="w-full border-t border-[#E5E7EB] bg-[#F8F8F6] py-20" aria-labelledby="categories-heading">
      <div className="mx-auto max-w-[1360px] px-4 sm:px-6 lg:px-8">
        <div id="categories-heading">
          <SectionHeading eyebrow="Find your distance" title="Official race categories" subtitle="Course routes certified to international standards. Choose your challenge across professional and community distances." />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {CARDS.map((c, i) => {
            const ops = CATEGORY_OPS.find((o) => o.distance === c.distance);
            const reg = registrationCategories.find((r) => r.distance === c.distance);
            const accent = ops?.bibColor ?? "#E31B23";
            return (
              <Reveal key={c.distance} index={i}>
                <article
                  className={`group relative flex h-full flex-col overflow-hidden rounded-2xl border bg-white transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_44px_rgba(17,24,39,0.14)] ${c.featured ? "border-[#F5A623] shadow-[0_12px_32px_rgba(245,166,35,0.22)]" : "border-[#E5E7EB]"}`}
                >
                  <span className="h-1.5 w-full" style={{ background: accent }} aria-hidden />
                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider ${c.badgeClass}`}>{c.badge}</span>
                      {reg ? <span className="text-xs font-extrabold text-[#111827]">{formatINR(reg.fee)}</span> : null}
                    </div>

                    <p className="mt-4 font-barlow text-6xl font-black leading-none tracking-tight text-[#111827] transition-colors duration-300 group-hover:text-[var(--accent)]" style={{ "--accent": accent } as CSSProperties}>
                      {c.distance.replace(" KM", "")}
                      <span className="ml-1 text-2xl text-[#9CA3AF]">KM</span>
                    </p>
                    <h3 className="mt-1 text-lg font-extrabold text-[#111827]">{c.name}</h3>
                    <p className="mt-2 text-[13px] leading-relaxed text-[#4B5563]">{c.description}</p>

                    <dl className="mt-4 grid grid-cols-2 gap-2 text-[11px]">
                      <div className="rounded-lg bg-[#F8F8F6] p-2.5">
                        <dt className="flex items-center gap-1 font-bold uppercase tracking-wider text-[#9CA3AF]">
                          <SiteIcon name="flag" className="h-3.5 w-3.5" /> Start
                        </dt>
                        <dd className="mt-0.5 text-sm font-extrabold text-[#111827]">{ops ? formatClock(ops.startTime) : "-"}</dd>
                      </div>
                      <div className="rounded-lg bg-[#F8F8F6] p-2.5">
                        <dt className="flex items-center gap-1 font-bold uppercase tracking-wider text-[#9CA3AF]">
                          <SiteIcon name="stopwatch" className="h-3.5 w-3.5" /> Cut-off
                        </dt>
                        <dd className="mt-0.5 text-sm font-extrabold text-[#111827]">{ops ? formatCutoff(ops.cutoffMinutes) : "-"}</dd>
                      </div>
                    </dl>
                    <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-semibold text-[#6B7280]">
                      <span>{c.terrain}</span>
                      {reg ? (
                        <span className="inline-flex items-center gap-1">
                          <SiteIcon name="person" className="h-3.5 w-3.5" /> Age {reg.minAge}+
                        </span>
                      ) : null}
                    </p>

                    <ul className="mt-4 flex-1 space-y-2 border-t border-[#F3F4F6] pt-4">
                      {c.perks.map((p) => (
                        <li key={p} className="flex items-start gap-2 text-xs text-[#374151]">
                          <SiteIcon name="check" className="mt-0.5 h-3 w-3 shrink-0" accent={accent} />
                          {p}
                        </li>
                      ))}
                    </ul>

                    <Link
                      href={`/register/runner?distance=${encodeURIComponent(c.distance)}`}
                      className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#111827] text-xs font-extrabold uppercase tracking-wider text-white transition-colors hover:bg-[#E31B23] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E31B23]"
                    >
                      Register {c.distance.replace(" KM", "K")}
                      <SiteIcon name="arrow" className="h-3 w-3" />
                    </Link>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
