import Link from "next/link";
import { Reveal } from "./Reveal";
import { SiteIcon } from "./art/SiteIcons";

const CLUBS = [
  { name: "Patna Pacesetters", runners: 50 },
  { name: "Kolkata Striders", runners: 35 },
  { name: "Delhi NCR Roadrunners", runners: 40 },
  { name: "Ranchi Harriers Club", runners: 25 },
];

/** Running-club call to action: left pitch with two CTAs, right a "crews" panel with animated bars (sample data, labelled as such). */
export function ClubsSpotlight() {
  return (
    <section className="w-full border-t border-[#E5E7EB] bg-white py-20" aria-labelledby="clubs-heading">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="relative overflow-hidden rounded-[28px] border border-[#F3DFA8] bg-gradient-to-br from-[#FFF9EF] via-white to-[#FFF3D6] p-8 shadow-[0_18px_50px_rgba(199,138,18,0.12)] sm:p-12">
            <span className="rj-spin-slow pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full border-[28px] border-dashed border-[#FFC928]/25" aria-hidden />
            <span className="pointer-events-none absolute -bottom-20 left-1/3 h-52 w-52 rounded-full bg-[#E31B23]/10 blur-3xl" aria-hidden />
            <div className="relative grid grid-cols-1 items-center gap-10 lg:grid-cols-12">
              <div className="space-y-4 lg:col-span-7">
                <span className="text-xs font-black uppercase tracking-[0.2em] text-[#E31B23]">Pan-India athletics community</span>
                <h2 id="clubs-heading" className="font-barlow text-4xl font-black uppercase leading-[1.02] tracking-tight text-[#111827] sm:text-5xl">
                  Bring your running club or crew to Rajgir
                </h2>
                <p className="max-w-xl text-[15px] leading-relaxed text-[#4B5563]">
                  Running groups, corporate fitness chapters, and athletic academies get exclusive perks: reserved team canopies at the Race Village, customized club bib printing, bulk registration discounts, and team leaderboard trophies.
                </p>
                <div className="flex flex-wrap gap-3 pt-2">
                  <Link href="/join" className="inline-flex h-12 items-center gap-2 rounded-full bg-[#E31B23] px-6 text-xs font-extrabold uppercase tracking-wider text-white transition-colors hover:bg-[#B5121B] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E31B23]">
                    <SiteIcon name="team" className="h-5 w-5" accent="#FFE08A" />
                    Register your running club
                  </Link>
                  <Link href="/contact" className="inline-flex h-12 items-center rounded-full border border-[#D1D5DB] bg-white px-6 text-xs font-extrabold uppercase tracking-wider text-[#111827] transition-colors hover:border-[#111827]">
                    Request group bib pricing
                  </Link>
                </div>
              </div>

              <div className="rounded-2xl border border-[#E5E7EB] bg-white/90 p-6 shadow-sm backdrop-blur-sm lg:col-span-5">
                <div className="flex items-center justify-between border-b border-[#F3F4F6] pb-3">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-[#6B7280]">Crews joining the movement</span>
                  <span className="rounded-full bg-[#FFF3D6] px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-[#92400E]">Sample</span>
                </div>
                <ul className="mt-4 space-y-4">
                  {CLUBS.map((c, i) => (
                    <li key={c.name}>
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-[#111827]">{c.name}</span>
                        <span className="font-semibold text-[#6B7280]">{c.runners}+ runners</span>
                      </div>
                      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-[#F3F4F6]">
                        <div className="h-full origin-left rounded-full bg-gradient-to-r from-[#E31B23] to-[#F5A623]" style={{ width: `${(c.runners / 50) * 100}%`, animation: `rj-bar-grow 1.2s cubic-bezier(0.2,0.7,0.2,1) ${0.3 + i * 0.15}s both` }} />
                      </div>
                    </li>
                  ))}
                </ul>
                <p className="pt-4 text-center text-[11px] italic text-[#6B7280]">“Running between Rajgir’s ancient fortress walls is an unforgettable spiritual &amp; athletic high.”</p>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
