import Link from "next/link";
import { Reveal } from "./Reveal";
import { SiteIcon } from "./art/SiteIcons";
import { SectionHeading } from "./SectionHeading";

const PATHWAYS = [
  { icon: "runner" as const, title: "Individual Runners", tagline: "42.2K • 21.1K • 10K • 5K", description: "Race through 2,500 years of living history with accredited RFID timing bibs and world-class hydration support.", badge: "Early Bird Open", href: "/register/runner", cta: "Register as Runner", guide: "/how-it-works/runner", from: "#E31B23", to: "#F5A623" },
  { icon: "highfive" as const, title: "Volunteer Crew", tagline: "Heartbeat of the Event", description: "Join race day operations across hydration, route management, athlete recovery, and medal distribution.", badge: "Certificate & Kit", href: "/register/volunteer", cta: "Join Volunteer Crew", guide: "/how-it-works/volunteer", from: "#15803D", to: "#34D399" },
  { icon: "team" as const, title: "Clubs & Running Teams", tagline: "Compete as a Team", description: "Represent your running group, club, or athletics academy with dedicated team slots and group discounts.", badge: "Group Discounts", href: "/join", cta: "Register Running Club", guide: "/how-it-works/team", from: "#1D4ED8", to: "#60A5FA" },
  { icon: "building" as const, title: "Corporate Delegations", tagline: "Workplace Wellness", description: "Foster team camaraderie and wellness through corporate marathon challenges and branded executive bibs.", badge: "Corporate Cup", href: "/contact?intent=corporate", cta: "Corporate Entries", guide: "/how-it-works/corporate", from: "#111827", to: "#6B7280" },
  { icon: "cap" as const, title: "Schools & Universities", tagline: "Youth Athletics", description: "Inspire student athletes with collegiate packages, school participation cups, and feeder category medals.", badge: "Youth Program", href: "/contact?intent=schools", cta: "School Programs", guide: "/how-it-works/school", from: "#7C3AED", to: "#C4B5FD" },
  { icon: "rings" as const, title: "Sponsors & Partners", tagline: "Brand Showcase", description: "Connect your brand with thousands of athletes, tourists, and wellness leaders in Bihar's historic heartland.", badge: "Expo Stalls Open", href: "/join", cta: "Partner With Us", guide: "/how-it-works/sponsor", from: "#C78A12", to: "#FFC928" },
];

/** "Choose your marathon journey": six audience cards with gradient icon tiles, a primary action and a link to the step-by-step guide. */
export function JourneyCards() {
  return (
    <section className="w-full bg-white py-20" aria-labelledby="journeys-heading">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div id="journeys-heading">
          <SectionHeading eyebrow="Personalized gateways" title="Choose your marathon journey" subtitle="Whether you are chasing a personal best, supporting the event crew, or showcasing your organization, find your dedicated pathway." />
        </div>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {PATHWAYS.map((p, i) => {
            return (
              <Reveal key={p.title} index={i % 3}>
                <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white p-6 transition-all duration-300 hover:-translate-y-1.5 hover:border-transparent hover:shadow-[0_18px_44px_rgba(17,24,39,0.12)]">
                  <span className="absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-30" style={{ background: p.from }} aria-hidden />
                  <span className="absolute right-5 top-4 font-barlow text-6xl font-black leading-none text-[#F3F4F6]" aria-hidden>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="relative flex items-start justify-between gap-3">
                    <span className="flex h-14 w-14 items-center justify-center rounded-xl text-white shadow-md transition-transform duration-300 group-hover:scale-105" style={{ background: `linear-gradient(135deg, ${p.from}, ${p.to})` }} aria-hidden>
                      <SiteIcon name={p.icon} className="h-9 w-9" accent="#FFE08A" />
                    </span>
                  </div>
                  <span className="relative mt-4 w-fit rounded-full bg-[#F3F4F6] px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-widest text-[#4B5563]">{p.badge}</span>
                  <h3 className="relative mt-3 text-xl font-extrabold text-[#111827]">{p.title}</h3>
                  <p className="relative mt-0.5 text-xs font-bold uppercase tracking-wider text-[#C78A12]">{p.tagline}</p>
                  <p className="relative mt-3 flex-1 text-sm leading-relaxed text-[#4B5563]">{p.description}</p>
                  <div className="relative mt-5 flex items-center justify-between gap-3">
                    <Link
                      href={p.href}
                      className="inline-flex h-11 items-center gap-2 rounded-full bg-[#111827] px-5 text-xs font-extrabold uppercase tracking-wider text-white transition-colors hover:bg-[#E31B23] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E31B23]"
                    >
                      {p.cta}
                      <SiteIcon name="arrow" className="h-3 w-3" />
                    </Link>
                    <Link href={p.guide} className="text-xs font-bold text-[#6B7280] underline-offset-4 hover:text-[#E31B23] hover:underline">
                      See the steps
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
