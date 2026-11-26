"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { CATEGORY_OPS, formatClock, formatCutoff } from "@/lib/event";
import { LANDMARKS, MAP_HEIGHT, MAP_WIDTH, ROUTE, elevationAt, pointAt, routeFraction } from "@/lib/home/course";
import { prefersReducedMotion, useInView } from "@/lib/useInView";
import { SectionHeading } from "./SectionHeading";
import { SiteIcon } from "./art/SiteIcons";

const FULL_KM = CATEGORY_OPS[0].distanceKm;
const label = (d: string) => d.replace(" KM", "K");

/** Elevation profile as an SVG area path (illustrative shape). */
function profilePath(width: number, height: number): string {
  const steps = 80;
  let d = `M 0 ${height}`;
  for (let i = 0; i <= steps; i++) {
    const f = i / steps;
    d += ` L ${(f * width).toFixed(1)} ${(height - 8 - elevationAt(f) * (height - 26)).toFixed(1)}`;
  }
  return `${d} L ${width} ${height} Z`;
}

/**
 * Animated course map. The route draws itself when scrolled into view; pick a distance to see how far it runs,
 * its checkpoints, start time and cut-off. The route is illustrative (the official map will replace it).
 */
export function CourseMap() {
  const [selected, setSelected] = useState(0);
  const ops = CATEGORY_OPS[selected];
  const fraction = routeFraction(ops.distanceKm, FULL_KM);
  const { ref: wrapRef, visible } = useInView<HTMLDivElement>({ threshold: 0.3, once: false });
  const [everVisible, setEverVisible] = useState(false);
  const dotRef = useRef<SVGGElement>(null);
  // Read after mount so server and browser HTML match (the preference is browser-only).
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReduced(prefersReducedMotion());
  }, []);

  useEffect(() => {
    // Draw once the first time the map is seen, then keep it drawn.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (visible) setEverVisible(true);
  }, [visible]);

  // Runner dot travels along the highlighted part of the route, only while the map is on screen.
  useEffect(() => {
    const dot = dotRef.current;
    if (!dot) return;
    const place = (f: number) => {
      const p = pointAt(ROUTE, f);
      dot.setAttribute("transform", `translate(${p.x.toFixed(1)} ${p.y.toFixed(1)})`);
    };
    if (!visible || reduced) {
      place(reduced ? fraction : 0);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const loop = 9000;
    const tick = (now: number) => {
      const t = ((now - start) % loop) / loop;
      const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      place(fraction * eased);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [visible, fraction, reduced]);

  const pins = useMemo(
    () =>
      ops.checkpoints
        .filter((c) => c.km < ops.distanceKm - 0.5)
        .map((c) => ({ ...c, ...pointAt(ROUTE, routeFraction(c.km, FULL_KM)) })),
    [ops]
  );
  const finish = pointAt(ROUTE, fraction);
  const start = pointAt(ROUTE, 0);
  const profile = useMemo(() => profilePath(MAP_WIDTH, 96), []);
  const drawn = everVisible || reduced;

  return (
    <section id="course" className="relative w-full overflow-hidden border-t border-[#E5E7EB] bg-white py-20" aria-labelledby="course-heading">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-[#FFF9EF] to-transparent" aria-hidden />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div id="course-heading">
          <SectionHeading eyebrow="Run through history" title="The heritage course" subtitle="From the Vishwa Shanti Stupa through the valley and past the ancient Cyclopean Wall, every distance starts and finishes on the same hallowed ground." />
        </div>

        <div className="mb-5 flex flex-wrap justify-center gap-2" role="group" aria-label="Choose a distance">
          {CATEGORY_OPS.map((c, i) => (
            <button
              key={c.distance}
              type="button"
              onClick={() => setSelected(i)}
              aria-pressed={selected === i}
              className={`h-11 rounded-full border px-5 font-barlow text-xl font-extrabold transition-all ${
                selected === i ? "border-transparent text-white shadow-md" : "border-[#E5E7EB] bg-white text-[#374151] hover:border-[#9CA3AF]"
              }`}
              style={selected === i ? { background: `linear-gradient(135deg, ${c.bibColor}, #F5A623)` } : undefined}
            >
              {label(c.distance)}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
          <div ref={wrapRef} className="overflow-hidden rounded-[24px] border border-[#E5E7EB] bg-gradient-to-b from-[#FFFBF3] to-white p-3 shadow-[0_16px_44px_rgba(17,24,39,0.08)] sm:p-5 lg:col-span-8">
            <svg viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`} className="h-auto w-full" role="img" aria-label={`Illustrative map of the ${ops.distance} course from the Vishwa Shanti Stupa`}>
              <defs>
                <linearGradient id="rj-route-grad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0" stopColor="#E31B23" />
                  <stop offset="1" stopColor="#F5A623" />
                </linearGradient>
                <linearGradient id="rj-hill-a" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#FFC928" stopOpacity="0.35" />
                  <stop offset="1" stopColor="#FFC928" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="rj-profile-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#E31B23" stopOpacity="0.55" />
                  <stop offset="1" stopColor="#F5A623" stopOpacity="0.08" />
                </linearGradient>
                <clipPath id="rj-profile-clip">
                  <rect x="0" y="0" width={MAP_WIDTH} height="96" />
                </clipPath>
              </defs>

              {/* backdrop hills */}
              <path d="M0 300 C 120 220 220 300 340 250 C 470 196 560 120 700 178 C 820 228 900 150 1000 190 L1000 420 L0 420 Z" fill="url(#rj-hill-a)" />
              <path d="M0 350 C 160 300 280 360 420 322 C 560 284 660 250 800 300 C 900 336 960 300 1000 312 L1000 420 L0 420 Z" fill="#F5A623" opacity="0.1" />
              <g stroke="#E5E7EB" strokeWidth="1" opacity="0.7" aria-hidden>
                {[1, 2, 3, 4].map((i) => (
                  <line key={i} x1="0" x2={MAP_WIDTH} y1={(MAP_HEIGHT / 5) * i} y2={(MAP_HEIGHT / 5) * i} strokeDasharray="4 8" />
                ))}
              </g>

              {/* full route (faint) */}
              <path d={ROUTE.d} fill="none" stroke="#D1D5DB" strokeWidth="3" strokeLinecap="round" strokeDasharray="2 10" className="rj-dash-flow" />
              {/* highlighted route for the chosen distance */}
              <path
                d={ROUTE.d}
                pathLength={1}
                fill="none"
                stroke="url(#rj-route-grad)"
                strokeWidth="7"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="1 1"
                strokeDashoffset={drawn ? 1 - fraction : 1}
                style={{ transition: "stroke-dashoffset 1.6s cubic-bezier(0.4, 0, 0.2, 1)" }}
              />

              {/* landmarks */}
              {LANDMARKS.map((l, i) => {
                const p = pointAt(ROUTE, l.f);
                const above = i % 2 === 0;
                return (
                  <g key={l.label} transform={`translate(${p.x} ${p.y})`}>
                    <circle r="5" fill="#fff" stroke="#C78A12" strokeWidth="2.5" />
                    <text y={above ? -22 : 34} textAnchor={i === 0 ? "start" : "middle"} x={i === 0 ? -6 : 0} className="font-manrope" fontSize="15" fontWeight="800" fill="#111827" stroke="#fff" strokeWidth="5" paintOrder="stroke" strokeLinejoin="round">
                      {l.label}
                    </text>
                    <text y={above ? -8 : 48} textAnchor={i === 0 ? "start" : "middle"} x={i === 0 ? -6 : 0} className="font-manrope" fontSize="11.5" fontWeight="600" fill="#6B7280" stroke="#fff" strokeWidth="4" paintOrder="stroke" strokeLinejoin="round">
                      {l.sub}
                    </text>
                  </g>
                );
              })}

              {/* checkpoint pins (re-pop whenever the distance changes) */}
              {pins.map((p, i) => (
                <g key={`${ops.distance}-${p.label}`} transform={`translate(${p.x} ${p.y})`}>
                  <g className="rj-pop" style={{ animationDelay: `${0.5 + i * 0.12}s`, transformOrigin: "center", transformBox: "fill-box" }}>
                    <circle r="9" fill="#fff" stroke="#E31B23" strokeWidth="3" />
                    <text y="-15" textAnchor="middle" fontSize="12" fontWeight="800" fill="#B5121B" stroke="#fff" strokeWidth="4" paintOrder="stroke" strokeLinejoin="round" className="font-manrope">
                      {p.label}
                    </text>
                  </g>
                </g>
              ))}

              {/* start and finish flags */}
              <g transform={`translate(${start.x} ${start.y})`}>
                <circle r="13" fill="#111827" />
                <path d="M-4 -6 V7 M-4 -6 H6 L3 -2 L6 2 H-4" fill="#FFC928" stroke="#FFC928" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" />
              </g>
              {fraction < 0.98 ? (
                <g key={`finish-${ops.distance}`} transform={`translate(${finish.x} ${finish.y})`}>
                  <g className="rj-pop" style={{ animationDelay: "1.2s", transformBox: "fill-box", transformOrigin: "center" }}>
                    <circle r="11" fill="#E31B23" stroke="#fff" strokeWidth="3" />
                    <circle r="3.5" fill="#fff" />
                  </g>
                </g>
              ) : null}

              {/* runner */}
              <g ref={dotRef} transform={`translate(${start.x.toFixed(1)} ${start.y.toFixed(1)})`}>
                <circle r="16" fill="#FFC928" opacity="0.28" />
                <circle r="9" fill="#FFC928" stroke="#fff" strokeWidth="3" />
              </g>
            </svg>

            {/* elevation profile (illustrative) */}
            <div className="mt-3 rounded-2xl bg-white/70 p-3 ring-1 ring-[#F3F4F6]">
              <div className="mb-1 flex items-center justify-between text-[10px] font-extrabold uppercase tracking-widest text-[#9CA3AF]">
                <span>Elevation profile</span>
                <span>Illustrative</span>
              </div>
              <svg viewBox={`0 0 ${MAP_WIDTH} 96`} className="h-16 w-full sm:h-20" preserveAspectRatio="none" aria-hidden>
                <path d={profile} fill="#E5E7EB" opacity="0.6" />
                <g clipPath="url(#rj-profile-clip)">
                  <rect x="0" y="0" width={drawn ? fraction * MAP_WIDTH : 0} height="96" fill="url(#rj-profile-grad)" style={{ transition: "width 1.6s cubic-bezier(0.4, 0, 0.2, 1)" }} />
                </g>
                <path d={profile} fill="none" stroke="#C78A12" strokeWidth="2" strokeLinejoin="round" opacity="0.8" />
              </svg>
            </div>
            <p className="mt-2 text-center text-[11px] text-[#9CA3AF]">Illustrative route. The official certified course map will be published before race day.</p>
          </div>

          {/* info card */}
          <aside className="flex flex-col overflow-hidden rounded-[24px] border border-[#E5E7EB] bg-white shadow-[0_16px_44px_rgba(17,24,39,0.08)] lg:col-span-4" aria-live="polite">
            <div className="p-6 text-white" style={{ background: `linear-gradient(135deg, ${ops.bibColor}, #111827 130%)` }}>
              <p className="text-[11px] font-extrabold uppercase tracking-widest text-white/75">Selected distance</p>
              <p className="font-barlow text-7xl font-black leading-none">
                {ops.distance.replace(" KM", "")}
                <span className="ml-1 text-3xl text-white/70">KM</span>
              </p>
              <p className="mt-1 text-sm font-semibold text-white/85">{ops.timed ? "Timed category with RFID chip" : "Non-timed community run"}</p>
            </div>
            <dl className="grid flex-1 grid-cols-2 gap-3 p-6 text-sm">
              <div className="rounded-xl bg-[#F8F8F6] p-3">
                <dt className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-[#9CA3AF]">
                  <SiteIcon name="flag" className="h-3.5 w-3.5" /> Gun time
                </dt>
                <dd className="mt-1 font-barlow text-3xl font-black text-[#111827]">{formatClock(ops.startTime)}</dd>
              </div>
              <div className="rounded-xl bg-[#F8F8F6] p-3">
                <dt className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-[#9CA3AF]">
                  <SiteIcon name="stopwatch" className="h-3.5 w-3.5" /> Cut-off
                </dt>
                <dd className="mt-1 font-barlow text-3xl font-black text-[#111827]">{formatCutoff(ops.cutoffMinutes)}</dd>
              </div>
              <div className="col-span-2 rounded-xl bg-[#F8F8F6] p-3">
                <dt className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-[#9CA3AF]">
                  <SiteIcon name="route" className="h-3.5 w-3.5" /> Timing checkpoints
                </dt>
                <dd className="mt-1.5 flex flex-wrap gap-1.5">
                  {ops.checkpoints.length ? (
                    ops.checkpoints.map((c) => (
                      <span key={c.label} className="rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-[#374151] ring-1 ring-[#E5E7EB]">
                        {c.label}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-[#6B7280]">Finish line only. This run is untimed.</span>
                  )}
                </dd>
              </div>
            </dl>
            <div className="p-6 pt-0">
              <Link
                href={`/register/runner?distance=${encodeURIComponent(ops.distance)}`}
                className="group inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#E31B23] text-xs font-extrabold uppercase tracking-wider text-white transition-colors hover:bg-[#B5121B] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E31B23]"
              >
                Register for {label(ops.distance)}
                <SiteIcon name="arrow" className="h-3 w-3" />
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
