import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/layout/SiteHeader";
import SiteFooter from "@/components/layout/SiteFooter";
import SuccessContent from "./SuccessContent";
import { getRegistrationDetails } from "@/app/actions/registerRunner";

export const metadata: Metadata = {
  title: "Registration Confirmed | Rajgir Marathon 2027",
  description: "Official digital runner confirmation pass for Rajgir Marathon 2027.",
};

export default async function RegisterSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ reg_no?: string }>;
}) {
  const { reg_no } = await searchParams;
  const registration = reg_no ? await getRegistrationDetails(reg_no) : null;

  return (
    <div
      style={{ fontFamily: "'Inter','Segoe UI',sans-serif" }}
      className="min-h-screen bg-[#080604] text-white flex flex-col selection:bg-[#cca043] selection:text-black overflow-x-hidden"
    >
      <SiteHeader />

      <main className="flex-1 w-full flex items-center justify-center py-10">
        {registration ? (
          <SuccessContent registration={registration} />
        ) : (
          <div className="max-w-md mx-auto p-8 rounded-2xl border border-white/10 bg-[#0f0c09] text-center space-y-4">
            <h2 className="text-xl font-black uppercase text-white font-graduate">
              Registration Not Found
            </h2>
            <p className="text-xs text-neutral-400">
              We couldn&apos;t locate a registration with the provided reference number. If you just registered, please verify your email.
            </p>
            <Link
              href="/register/runner"
              className="inline-block py-2.5 px-6 rounded-xl bg-[#cca043] text-black font-extrabold text-xs uppercase tracking-wider"
            >
              Start New Registration
            </Link>
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}

