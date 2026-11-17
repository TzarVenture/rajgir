"use client";

import React from "react";
import SiteHeader from "@/components/layout/SiteHeader";
import SiteFooter from "@/components/layout/SiteFooter";
import UnifiedRegistrationForm from "@/components/UnifiedRegistrationForm";
import { Breadcrumb, PageHero } from "@/components/ui";

export default function JoinPage() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-white font-manrope text-charcoal-900">
      <SiteHeader />
      <main className="flex-1 bg-surface-soft">
        <div className="mx-auto w-full max-w-[824px] px-4 pb-16 pt-6 sm:px-6 lg:px-8">
          <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Community" }]} />
          <PageHero
            eyebrow={<span className="text-sm font-semibold text-charcoal-500">Official community hub</span>}
            title="Join the Rajgir Marathon"
            subtitle="Select your participation path below. Join our on-ground volunteer crew or partner with us as an influencer or media creator."
          />
          <UnifiedRegistrationForm />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
