import Link from "next/link";
import { Reveal } from "./Reveal";
import { SiteIcon } from "./art/SiteIcons";
import { SectionHeading } from "./SectionHeading";

const STORIES = [
  { icon: "book" as const, from: "#C78A12", to: "#FFC928", title: "Running Through 2,500 Years: The Magadha Marathon Circuit", category: "Heritage & Culture", readTime: "4 Min Read", date: "November 2026", summary: "How the ancient capital of Magadha transformed from an imperial fortification into India's premier cultural running destination." },
  { icon: "shoe" as const, from: "#E31B23", to: "#F5A623", title: "Pacing the Hills of Rajgir: Master Training Guide", category: "Training & Advice", readTime: "6 Min Read", date: "October 2026", summary: "Expert coaching techniques on tackling rolling elevations, breathing in morning fog, and maintaining steady race split rhythms." },
  { icon: "highfive" as const, from: "#15803D", to: "#34D399", title: "Voices from the Trail: Meet the Rajgir Volunteer Crew", category: "Community", readTime: "3 Min Read", date: "September 2026", summary: "Over 400 local youth and college students undergo emergency logistics and sports event management training to power race day." },
];

/** Editorial stories: three cards with a coloured header and a "coming soon" tag (the articles are not published yet). */
export function Stories() {
  return (
    <section className="w-full border-t border-[#E5E7EB] bg-[#F8F8F6] py-20" aria-labelledby="stories-heading">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div id="stories-heading">
          <SectionHeading eyebrow="Stories from Rajgir" title="Heritage, training & community" subtitle="Stories, training guides and updates from the road to race day." />
        </div>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {STORIES.map((s, i) => {
            return (
              <Reveal key={s.title} index={i}>
                <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_18px_42px_rgba(17,24,39,0.12)]">
                  <div className="relative flex h-32 items-end justify-between overflow-hidden p-5" style={{ background: `linear-gradient(135deg, ${s.from}, ${s.to})` }}>
                    <SiteIcon name={s.icon} className="absolute -right-4 -top-4 h-36 w-36 text-white/25 transition-transform duration-500 group-hover:rotate-6 group-hover:scale-110" accent="#FFFFFF" />
                    <span className="relative rounded-full bg-white/90 px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest text-[#111827]">{s.category}</span>
                    <span className="relative rounded-full bg-black/30 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-widest text-white backdrop-blur-sm">Coming soon</span>
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-[#9CA3AF]">
                      {s.date} · {s.readTime}
                    </p>
                    <h3 className="mt-2 text-lg font-extrabold leading-snug text-[#111827]">{s.title}</h3>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-[#4B5563]">{s.summary}</p>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>
        <div className="mt-8 text-center">
          <Link href="/contact" className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#E31B23] hover:text-[#B5121B]">
            View all stories
            <SiteIcon name="arrow" className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </section>
  );
}
