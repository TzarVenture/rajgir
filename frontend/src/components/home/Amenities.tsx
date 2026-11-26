import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";
import { SiteIcon } from "./art/SiteIcons";

const ITEMS = [
  { icon: "heartpulse" as const, tone: "#E31B23", bg: "#FEF2F2", title: "Advanced Medical Response", description: "Equipped ambulances, mobile paramedical bike units, and medical aid tents every 1.5 km with on-site cardiac care." },
  { icon: "drop" as const, tone: "#2563EB", bg: "#EFF6FF", title: "Electrolytes & Hydration", description: "Abundant hydration points serving chilled mineral water, Enerzal isotonic drinks, bananas, and fast-energy glucose." },
  { icon: "stopwatch" as const, tone: "#C78A12", bg: "#FFFBEB", title: "Accredited RFID Bib Timing", description: "Electronic split timing mats at key race checkpoints with instant SMS finish notifications and verified e-certificates." },
  { icon: "medal" as const, tone: "#059669", bg: "#ECFDF5", title: "Bespoke Finisher Medals", description: "High-relief cast alloy medals featuring the Vishwa Shanti Stupa icon and five hills crest, presented at the finish line." },
  { icon: "shield" as const, tone: "#7C3AED", bg: "#F5F3FF", title: "Baggage & Security Lounges", description: "Secure RFID-monitored baggage holding areas, separate changing cabanas, and sanitized mobile rest facilities." },
  { icon: "bowl" as const, tone: "#EA580C", bg: "#FFF7ED", title: "Heritage Recovery Breakfast", description: "Hot nutritious post-race breakfast featuring fresh fruits, Bihar's nutritious sattu energy shakes, and herbal tea." },
];

/** Runner safety and amenities: six cards with soft coloured icon rings that pulse on hover. */
export function Amenities() {
  return (
    <section id="perks" className="w-full border-t border-[#E5E7EB] bg-[#F8F8F6] py-20" aria-labelledby="perks-heading">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div id="perks-heading">
          <SectionHeading eyebrow="World-class standards" title="Runner safety & world-class amenities" subtitle="Comprehensive athlete care from the moment you pick up your bib to the post-race celebration village." />
        </div>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {ITEMS.map((a, i) => {
            return (
              <Reveal key={a.title} index={i % 3}>
                <article className="group relative h-full overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_38px_rgba(17,24,39,0.1)]">
                  <span className="absolute inset-x-0 bottom-0 h-1 origin-left scale-x-0 transition-transform duration-500 group-hover:scale-x-100" style={{ background: a.tone }} aria-hidden />
                  <span className="relative flex h-[72px] w-[72px] items-center justify-center rounded-2xl" style={{ background: a.bg, color: a.tone }} aria-hidden>
                    <span className="absolute inset-0 rounded-2xl opacity-0 ring-2 transition-all duration-500 group-hover:scale-125 group-hover:opacity-100 group-hover:ring-offset-0" style={{ ["--tw-ring-color" as string]: `${a.tone}33` }} />
                    <SiteIcon name={a.icon} className="h-11 w-11" accent={a.tone} />
                  </span>
                  <h3 className="mt-4 text-lg font-extrabold text-[#111827]">{a.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#4B5563]">{a.description}</p>
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
