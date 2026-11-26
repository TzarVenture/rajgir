import { CountUp } from "./CountUp";
import { Reveal } from "./Reveal";
import { SiteIcon } from "./art/SiteIcons";

const STATS = [
  { icon: "route" as const, value: 42.2, decimals: 1, prefix: "", suffix: " KM", label: "Full marathon course", note: "Flagship historic circuit", tone: "#E31B23" },
  { icon: "team" as const, value: 5000, decimals: 0, prefix: "", suffix: "+", label: "Expected runners", note: "From Pan-India & global", tone: "#111827" },
  { icon: "coin" as const, value: 15, decimals: 0, prefix: "₹", suffix: " Lakh+", label: "Total cash prize purse", note: "Across all categories", tone: "#C78A12" },
  { icon: "stupa" as const, value: 2500, decimals: 0, prefix: "", suffix: " Yrs", label: "Living heritage", note: "Ancient Magadha capital", tone: "#15803D" },
] as const;

/** Four headline numbers that count up when scrolled into view. Figures are the event's planned targets. */
export function StatsStrip() {
  return (
    <section className="w-full bg-[#F8F8F6] py-14 sm:py-16" aria-label="Event at a glance">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {STATS.map((s, i) => {
            return (
              <Reveal key={s.label} index={i}>
                <div className="group relative h-full overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white p-5 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_14px_34px_rgba(17,24,39,0.1)] sm:p-7">
                  <span className="absolute inset-x-0 top-0 h-1" style={{ background: `linear-gradient(90deg, ${s.tone}, #F5A623)` }} aria-hidden />
                  <span className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-[#FFF9EF] transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6" style={{ color: s.tone }} aria-hidden>
                    <SiteIcon name={s.icon} className="h-9 w-9" />
                  </span>
                  <CountUp value={s.value} decimals={s.decimals} prefix={s.prefix} suffix={s.suffix} className="block font-barlow text-4xl font-black leading-none sm:text-5xl" />
                  <p className="mt-2 text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#111827] sm:text-xs">{s.label}</p>
                  <p className="mt-0.5 text-[11px] text-[#6B7280]">{s.note}</p>
                </div>
              </Reveal>
            );
          })}
        </div>
        <p className="mt-5 text-center text-[11px] text-[#9CA3AF]">Figures are the organisers&apos; planned targets for 2027 and will be updated with verified numbers.</p>
      </div>
    </section>
  );
}
