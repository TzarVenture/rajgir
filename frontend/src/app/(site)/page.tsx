"use client";

import React from "react";
import SiteHeader from "@/components/layout/SiteHeader";
import SiteFooter from "@/components/layout/SiteFooter";
import PreviewBanner from "@/components/layout/PreviewBanner";
import { usePreviewMode } from "@/components/layout/PreviewContext";
import { SearchField } from "@/components/search/SearchField";
import { Amenities } from "@/components/home/Amenities";
import { ClubsSpotlight } from "@/components/home/ClubsSpotlight";
import { CourseMap } from "@/components/home/CourseMap";
import { FactsMarquee } from "@/components/home/FactsMarquee";
import { HeroBento } from "@/components/home/HeroBento";
import { JourneyCards } from "@/components/home/JourneyCards";
import { Newsletter } from "@/components/home/Newsletter";
import { Partners } from "@/components/home/Partners";
import { RaceCategories } from "@/components/home/RaceCategories";
import { StatsStrip } from "@/components/home/StatsStrip";
import { Stories } from "@/components/home/Stories";
import { HillDivider } from "@/components/home/art/HillDivider";
import { Reveal } from "@/components/home/Reveal";

/**
 * Real-site homepage. The page only composes sections; each lives in components/home/.
 * Motion (CSS keyframes, scroll reveal, count-up, countdown, route map) is documented in
 * (site)/site-theme.css and respects prefers-reduced-motion.
 */
export default function RealMarathonHomePage() {
  const isPreview = usePreviewMode();

  return (
    <div className="flex min-h-screen flex-col bg-white font-manrope text-[#111827] selection:bg-[#E31B23] selection:text-white">
      {/* Without JavaScript the scroll-reveal start state would hide content, so show everything. */}
      <noscript>
        <style>{`.rj-reveal{opacity:1!important;transform:none!important}.rj-underline{transform:scaleX(1)!important}`}</style>
      </noscript>

      {isPreview && <PreviewBanner />}
      <SiteHeader hasPreviewBanner={isPreview} />

      <main className="flex-1">
        <HeroBento />
        <FactsMarquee />

        <section aria-label="Find anything" className="w-full bg-white px-4 pb-4 pt-12 sm:pt-14">
          <Reveal>
            <h2 className="mb-5 text-center font-barlow text-3xl font-black uppercase tracking-tight text-[#111827] sm:text-4xl">Find anything</h2>
            <SearchField />
          </Reveal>
        </section>
        <HillDivider fill="#F8F8F6" />

        <StatsStrip />
        <JourneyCards />
        <RaceCategories />
        <CourseMap />
        <ClubsSpotlight />
        <Amenities />
        <Partners />
        <Stories />
        <Newsletter />
      </main>

      <SiteFooter />
    </div>
  );
}
