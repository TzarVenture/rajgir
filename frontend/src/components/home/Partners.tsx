import Link from "next/link";
import { Marquee } from "./Marquee";
import { Reveal } from "./Reveal";
import { SiteIcon } from "./art/SiteIcons";

const PARTNERS = [
  { icon: "stupa" as const, tone: "#E31B23", name: "Bihar Tourism" },
  { icon: "medal" as const, tone: "#C78A12", name: "Athletics Fed. Stds" },
  { icon: "building" as const, tone: "#111827", name: "Nalanda Admin" },
  { icon: "route" as const, tone: "#059669", name: "Magadha Heritage" },
  { icon: "heartpulse" as const, tone: "#DC2626", name: "Apollo Health Partner" },
  { icon: "drop" as const, tone: "#2563EB", name: "Enerzal Hydration" },
];

/** Partners as a gently scrolling strip (text tiles until real logos are supplied). */
export function Partners() {
  return (
    <section className="w-full overflow-hidden border-t border-[#E5E7EB] bg-white py-16" aria-labelledby="partners-heading">
      <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
        <Reveal>
          <span className="text-xs font-black uppercase tracking-[0.2em] text-[#6B7280]">Institutional alliances</span>
          <h2 id="partners-heading" className="mt-2 font-barlow text-3xl font-black uppercase tracking-tight text-[#111827] sm:text-4xl">
            Our valued partners &amp; institutional supporters
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-[#4B5563]">Organized in cooperation with local sports councils, district administration, and cultural tourism bodies.</p>
        </Reveal>
      </div>
      <div className="relative mt-10">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-white to-transparent" aria-hidden />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-white to-transparent" aria-hidden />
        <Marquee speed={34}>
          {PARTNERS.map((p) => {
            return (
              <div key={p.name} className="mx-2.5 flex h-20 w-56 shrink-0 items-center gap-3 rounded-2xl border border-[#E5E7EB] bg-[#F8F8F6] px-5 text-sm font-bold text-[#374151] transition-colors hover:border-[#F5A623] hover:bg-white">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white shadow-sm" style={{ color: p.tone }} aria-hidden>
                  <SiteIcon name={p.icon} className="h-7 w-7" />
                </span>
                {p.name}
              </div>
            );
          })}
        </Marquee>
      </div>
      <div className="mt-8 text-center">
        <Link href="/join" className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#E31B23] transition-colors hover:text-[#B5121B]">
          Explore sponsorship tiers &amp; brand activation stalls
          <SiteIcon name="arrow" className="h-3 w-3" />
        </Link>
      </div>
    </section>
  );
}
