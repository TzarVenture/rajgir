import React from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import SiteHeader from "@/components/layout/SiteHeader";
import SiteFooter from "@/components/layout/SiteFooter";
import RoleConflictCard from "@/components/auth/RoleConflictCard";
import SponsorRegisterForm from "./SponsorRegisterForm";
import { FaAward, FaMapMarkerAlt } from "react-icons/fa";

export const metadata = {
  title: "Official Sponsor Registration | Rajgir Marathon 2027",
  description: "Partner with Rajgir Marathon 2027. Connect your brand with 10,000+ national athletes.",
};

export default async function SponsorRegisterPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?redirectTo=/register/sponsor");
  }

  // 1 User = 1 Permanent Role Check
  if (user.role && user.role !== "SPONSOR") {
    return (
      <div className="relative min-h-screen w-full bg-[#080604] text-white flex flex-col">
        <SiteHeader />
        <main className="flex-1 max-w-4xl mx-auto px-4 py-12 w-full flex items-center justify-center">
          <RoleConflictCard user={user} targetRoleLabel="Official Sponsor" />
        </main>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div
      style={{ fontFamily: "'Inter','Segoe UI',sans-serif" }}
      className="relative min-h-screen w-full bg-[#080604] text-white flex flex-col overflow-x-hidden selection:bg-[#991b1b] selection:text-white"
    >
      <SiteHeader />

      {/* AMBIENT GLOWS */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-[#cca043]/5 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute top-80 right-0 w-[450px] h-[450px] bg-[#991b1b]/8 rounded-full blur-[150px] pointer-events-none" />

      {/* HERO SECTION */}
      <section className="relative z-10 w-full pt-8 pb-6 px-4 text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full border border-[#cca043]/40 bg-[#cca043]/10 text-[#d49a37] text-[10.5px] font-black tracking-[0.18em] uppercase mb-2 shadow-sm">
          <FaMapMarkerAlt className="text-[10px]" />
          <span>RAJGIR, BIHAR, INDIA | 2027</span>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase text-white font-graduate tracking-tight">
          OFFICIAL BRAND <span className="text-[#cca043]">SPONSORSHIP</span>
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-neutral-400 max-w-xl mx-auto leading-relaxed">
          Amplify your brand visibility across Bihar&apos;s premier international running festival. Connect with thousands of passionate runners and visitors.
        </p>
      </section>

      {/* FORM SECTION */}
      <main className="relative z-10 flex-1 w-full max-w-3xl mx-auto px-4 pb-16">
        <SponsorRegisterForm user={user} />
      </main>

      <SiteFooter />
    </div>
  );
}

