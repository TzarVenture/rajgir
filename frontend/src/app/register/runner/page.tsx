import React, { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import RunnerRegistrationWizard from "./RunnerRegistrationWizard";
import SiteHeader from "@/components/layout/SiteHeader";
import SiteFooter from "@/components/layout/SiteFooter";
import { FaCalendarAlt, FaMapMarkerAlt, FaShieldAlt } from "react-icons/fa";

export const metadata: Metadata = {
  title: "Runner Registration | Rajgir Marathon 2027",
  description:
    "Official runner registration portal for the Rajgir Marathon 2027. Choose your distance: Full Marathon (42.2K), Half Marathon (21.1K), 10K Hill Challenge, or 5K Dream Run.",
};

export default function RunnerRegisterPage() {
  return (
    <div
      style={{ fontFamily: "'Inter','Segoe UI',sans-serif" }}
      className="min-h-screen bg-[#080604] text-white flex flex-col selection:bg-[#cca043] selection:text-black overflow-x-clip"
    >
      {/* 1. HEADER */}
      <SiteHeader />

      {/* 2. HERO BANNER */}
      <section className="relative z-10 w-full pt-8 pb-4 text-center px-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-[#cca043]/40 bg-[#cca043]/10 text-[#d49a37] text-[10.5px] sm:text-xs font-black tracking-widest uppercase mb-3">
          <FaMapMarkerAlt className="text-red-500" />
          <span>RAJGIR, BIHAR • NOVEMBER 2027</span>
        </div>

        <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black uppercase text-white tracking-tight font-graduate leading-tight">
          RUNNER <span className="text-[#cca043]">REGISTRATION</span>
        </h1>

        <p className="mt-2 text-xs sm:text-sm text-neutral-300 max-w-xl mx-auto leading-relaxed">
          Secure your spot in India’s premier heritage marathon. Complete the official registration form below to receive your personalized RFID race bib.
        </p>
      </section>

      {/* 4. MAIN WIZARD CONTAINER */}
      <main className="relative z-10 flex-1 w-full pb-16">
        <Suspense
          fallback={
            <div className="max-w-md mx-auto py-20 text-center text-xs text-neutral-400">
              Loading official registration portal...
            </div>
          }
        >
          <RunnerRegistrationWizard />
        </Suspense>
      </main>

      {/* 5. FOOTER */}
      <SiteFooter />
    </div>
  );
}

