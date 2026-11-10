"use client";

import React, { Suspense } from "react";
import ComingSoonHeader from "@/components/ComingSoonHeader";
import ComingSoonFooter from "@/components/ComingSoonFooter";
import UnifiedRegistrationForm from "@/components/UnifiedRegistrationForm";

export default function JoinPage() {
  return (
    <div className="min-h-screen bg-[#080604] text-white flex flex-col font-inter">
      {/* Header */}
      <Suspense fallback={<div className="h-20 bg-black/50" />}>
        <ComingSoonHeader isAbsolute={false} />
      </Suspense>

      {/* Main Content */}
      <main className="flex-1 py-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto mb-10 text-center">
          <div className="inline-block px-4 py-1.5 rounded-full bg-red-950/40 border border-[#e51b24]/40 text-[#e51b24] text-xs font-bold uppercase tracking-widest mb-4">
            Official Community Hub
          </div>
          <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white mb-4">
            Join The <span className="text-[#e51b24]">Rajgir Marathon</span>
          </h1>
          <p className="text-neutral-400 max-w-2xl mx-auto text-sm sm:text-base">
            Select your participation path below. Join our on-ground volunteer crew or partner with us as an influencer & media creator to inspire thousands.
          </p>
        </div>

        {/* Unified Form */}
        <UnifiedRegistrationForm />
      </main>

      {/* Footer */}
      <ComingSoonFooter />
    </div>
  );
}

