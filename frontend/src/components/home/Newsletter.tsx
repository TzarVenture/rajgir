"use client";

import { useState } from "react";
import { Reveal } from "./Reveal";
import { SiteIcon } from "./art/SiteIcons";

/**
 * Newsletter sign-up banner. The form only records the "subscribed" state in the browser for now
 * (no backend endpoint exists yet); wire `onSubmit` to the API when it does.
 */
export function Newsletter() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  return (
    <section className="w-full border-t border-[#E5E7EB] bg-white py-16" aria-labelledby="newsletter-heading">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#111827] via-[#1F2937] to-[#3B0A0D] px-6 py-12 text-center text-white shadow-[0_24px_60px_rgba(17,24,39,0.3)] sm:px-12">
            <span className="rj-drift pointer-events-none absolute -left-10 top-6 h-40 w-40 rounded-full bg-[#E31B23]/30 blur-3xl" aria-hidden />
            <span className="rj-drift pointer-events-none absolute -right-8 bottom-0 h-44 w-44 rounded-full bg-[#FFC928]/25 blur-3xl" style={{ animationDelay: "2s" }} aria-hidden />
            <svg className="pointer-events-none absolute inset-x-0 bottom-0 h-20 w-full opacity-30" viewBox="0 0 1000 80" preserveAspectRatio="none" aria-hidden>
              <path d="M0 60 Q 120 20 240 52 T 480 44 T 720 56 T 1000 36" fill="none" stroke="#FFC928" strokeWidth="3" strokeDasharray="3 12" strokeLinecap="round" className="rj-dash-flow" />
            </svg>

            <div className="relative">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[11px] font-extrabold uppercase tracking-widest text-[#FFC928] backdrop-blur-sm">
                <SiteIcon name="plane" className="h-4 w-4" accent="#FFFFFF" /> Stay in the loop
              </span>
              <h2 id="newsletter-heading" className="mt-4 font-barlow text-4xl font-black uppercase leading-[1.02] tracking-tight sm:text-5xl">
                Never miss a marathon update
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-white/75">
                Subscribe for early bird registration alerts, official course maps, bib expo announcements, and travel guides directly to your inbox.
              </p>

              {done ? (
                <div className="rj-pop mx-auto mt-8 flex max-w-md items-center justify-center gap-2 rounded-2xl bg-emerald-500/15 px-4 py-3.5 text-sm font-bold text-emerald-200 ring-1 ring-emerald-400/40">
                  <SiteIcon name="check" className="h-5 w-5 text-emerald-400" />
                  Thank you! You are on the early bird notification list.
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (email.trim()) setDone(true);
                  }}
                  className="mx-auto mt-8 flex max-w-lg flex-col items-center gap-3 sm:flex-row"
                >
                  <label htmlFor="newsletter-email" className="sr-only">
                    Email address
                  </label>
                  <input
                    id="newsletter-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address…"
                    className="h-12 w-full rounded-full border border-white/20 bg-white/10 px-5 text-sm text-white placeholder-white/50 outline-none backdrop-blur-sm focus:border-[#FFC928] focus:ring-2 focus:ring-[#FFC928]/40 sm:flex-1"
                  />
                  <button type="submit" className="h-12 w-full rounded-full bg-gradient-to-b from-[#F0343C] to-[#CF1018] px-7 text-xs font-extrabold uppercase tracking-wider text-white transition-transform hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:w-auto">
                    Subscribe
                  </button>
                </form>
              )}
              <p className="mt-4 text-[11px] text-white/50">We respect your privacy. Zero spam. Unsubscribe at any time.</p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
