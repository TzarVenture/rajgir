import Link from "next/link";
import type { CSSProperties } from "react";
import { CATEGORY_OPS, EVENT, formatDate } from "@/lib/event";
import { Countdown } from "./Countdown";
import { SiteIcon } from "./art/SiteIcons";

const delay = (i: number) => ({ "--i": i }) as CSSProperties;

/** Gateway tiles. Every tile carries a real photo; no dark overlay, the label sits on a frosted card instead. */
const TILES = [
  { key: "volunteer", href: "/how-it-works/volunteer", image: "/images/volunteerCard.jpg", alt: "Volunteers in black crew T-shirts raising their hands in a high five", position: "50% 30%", label: "Community & Crew", title: "Volunteer", action: "Join the crew", icon: "highfive" },
  { key: "sponsor", href: "/how-it-works/sponsor", image: "/images/home/tile-runners.jpg", alt: "A group of runners on a winding hill road at sunrise", position: "50% 50%", label: "Brand Partners", title: "Sponsor", action: "Partner with us", icon: "trophy" },
  { key: "tourism", href: "/tourism", image: "/images/home/tile-heritage.jpg", alt: "The Vishwa Shanti Stupa above the Cyclopean Wall, an ancient gateway and a hot spring in Rajgir", position: "50% 40%", label: "Hospitality & Stay", title: "Tourism", action: "Plan your trip", icon: "pin" },
  { key: "vendor", href: "/how-it-works/vendor", image: "/images/home/tile-valley.jpg", alt: "Misty green valleys of Rajgir in golden morning light with runners on the road", position: "50% 50%", label: "Expo & Stalls", title: "Vendor", action: "Book a stall", icon: "tee" },
] as const;

/**
 * Hero bento grid: one big feature tile (7 columns) and four gateway tiles (5 columns, 2x2). Real photography on every
 * tile with no dark overlay: text sits on frosted panels. Motion: slow zoom, staggered entrance, live countdown.
 */
export function HeroBento() {
  const flagship = CATEGORY_OPS[0];
  return (
    <section className="relative w-full bg-white pb-4 pt-3 sm:pt-4" aria-label="Rajgir Marathon 2027">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-stretch gap-3 lg:grid-cols-12">
          {/* Feature tile */}
          <div className="relative isolate flex min-h-[660px] flex-col justify-between overflow-hidden rounded-[24px] bg-[#F5E9D3] shadow-[0_20px_50px_rgba(17,24,39,0.16)] lg:col-span-7 lg:min-h-[690px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/home/hero-scene.jpg"
              alt="Runners on a winding hill road at sunrise below the Vishwa Shanti Stupa and the ancient walls of Rajgir"
              className="rj-kenburns absolute inset-0 -z-10 h-full w-full object-cover object-[62%_50%]"
              fetchPriority="high"
            />
            {/* A light wash only behind the headline so dark text stays readable; the photo itself is not darkened. */}
            <div className="absolute inset-x-0 top-0 -z-10 h-[62%] bg-gradient-to-b from-white/85 via-white/45 to-transparent" aria-hidden />

            <div className="flex flex-col gap-4 p-6 sm:p-10">
              <div className="rj-rise flex flex-wrap items-center gap-2.5" style={delay(0)}>
                <span className="inline-flex items-center gap-2 rounded-full border border-black/5 bg-white/85 px-3.5 py-1.5 text-[11px] font-extrabold uppercase tracking-widest text-[#111827] shadow-sm backdrop-blur-md">
                  Registrations open
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-[#FFC928] px-3.5 py-1.5 text-[11px] font-extrabold uppercase tracking-widest text-[#111827] shadow-sm">
                  <SiteIcon name="calendar" className="h-3.5 w-3.5" /> {formatDate(EVENT.raceDate, { day: "numeric", month: "short", year: "numeric" })}
                </span>
              </div>

              <h1 className="font-barlow text-[50px] font-black uppercase leading-[0.92] tracking-tight text-[#111827] sm:text-7xl lg:text-[78px]">
                <span className="rj-rise block" style={delay(1)}>
                  Where every
                </span>
                <span className="rj-rise block" style={delay(2)}>
                  step tells a
                </span>
                <span className="rj-rise block" style={delay(3)}>
                  <span className="bg-gradient-to-r from-[#E31B23] via-[#F0652A] to-[#F5A623] bg-clip-text text-transparent">story.</span>
                </span>
              </h1>

              <p className="rj-rise w-fit max-w-md rounded-2xl bg-white/75 px-4 py-2.5 text-[15px] font-semibold leading-relaxed text-[#1F2937] shadow-sm backdrop-blur-md sm:text-base" style={delay(4)}>
                Experience the spirit of running through the heritage, hills and history of Rajgir, Bihar.
              </p>
            </div>

            {/* Action panel (frosted, so the photo shows through) */}
            <div className="rj-rise m-3 rounded-[20px] border border-white/60 bg-white/85 p-4 shadow-[0_12px_32px_rgba(17,24,39,0.18)] backdrop-blur-xl sm:m-5 sm:p-5" style={delay(5)}>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <Countdown tone="light" />
                <div className="flex flex-wrap items-center gap-2.5">
                  <Link
                    href="/register/runner"
                    className="rj-shine group inline-flex h-12 items-center gap-3 rounded-full bg-gradient-to-b from-[#F0343C] to-[#CF1018] pl-6 pr-1.5 font-manrope text-[13px] font-extrabold uppercase tracking-wider text-white transition-transform hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E31B23]"
                  >
                    Register now
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 transition-transform group-hover:translate-x-0.5">
                      <SiteIcon name="arrow" className="h-3.5 w-3.5" />
                    </span>
                  </Link>
                  <Link
                    href="/tourism"
                    className="inline-flex h-12 items-center rounded-full border border-[#111827]/20 bg-white/70 px-5 font-manrope text-[13px] font-extrabold uppercase tracking-wider text-[#111827] transition-colors hover:bg-[#111827] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E31B23]"
                  >
                    Explore Rajgir
                  </Link>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-black/5 pt-3" aria-label="Race distances">
                <span className="mr-1 text-[11px] font-extrabold uppercase tracking-widest text-[#6B7280]">Pick your distance</span>
                {CATEGORY_OPS.map((c) => (
                  <Link
                    key={c.distance}
                    href={`/register/runner?distance=${encodeURIComponent(c.distance)}`}
                    className="rounded-full border border-[#111827]/15 bg-white px-3 py-1 text-xs font-extrabold text-[#111827] transition-colors hover:border-[#E31B23] hover:bg-[#E31B23] hover:text-white"
                  >
                    {c.distance.replace(" KM", "K")}
                  </Link>
                ))}
              </div>
              <p className="sr-only">Flagship start {flagship.startTime}</p>
            </div>
          </div>

          {/* Gateway tiles */}
          <div className="grid grid-cols-2 gap-3 lg:col-span-5 lg:grid-rows-2">
            {TILES.map((t, i) => {
              return (
                <Link
                  key={t.key}
                  href={t.href}
                  className="rj-rise group relative isolate flex min-h-[250px] flex-col justify-between overflow-hidden rounded-[20px] bg-[#F5E9D3] p-3 shadow-[0_10px_30px_rgba(17,24,39,0.14)] ring-1 ring-black/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(17,24,39,0.24)] hover:ring-2 hover:ring-[#FFC928] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E31B23] sm:min-h-[310px] sm:p-4"
                  style={delay(i + 2)}
                  aria-label={`${t.title}: ${t.action}`}
                >
                  <div className="absolute inset-0 -z-10 overflow-hidden transition-transform duration-700 group-hover:scale-110">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={t.image} alt={t.alt} className="h-full w-full object-cover" style={{ objectPosition: t.position }} loading="lazy" />
                  </div>

                  <div className="flex items-start justify-between gap-2">
                    <span className="rounded-full bg-white/85 px-2.5 py-1 text-[9.5px] font-extrabold uppercase tracking-widest text-[#111827] shadow-sm backdrop-blur-md sm:text-[10px]">{t.label}</span>
                    <span className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/90 text-[#E31B23] shadow-sm backdrop-blur-md" aria-hidden>
                      <SiteIcon name={t.icon} className="h-7 w-7" accent="#F5A623" />
                    </span>
                  </div>

                  <div className="rounded-2xl border border-white/60 bg-white/85 p-3 shadow-[0_8px_20px_rgba(17,24,39,0.14)] backdrop-blur-lg">
                    <h2 className="font-barlow text-[30px] font-black uppercase leading-none text-[#111827] sm:text-[34px]">{t.title}</h2>
                    <span className="mt-2.5 inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-[#E31B23]">
                      {t.action}
                      <SiteIcon name="arrow" className="h-3 w-3" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
