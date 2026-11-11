"use client";

import React from "react";
import Link from "next/link";
import {
  FaCheckCircle,
  FaPrint,
  FaQrcode,
  FaArrowRight,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaRunning,
  FaShieldAlt,
} from "react-icons/fa";

interface SuccessContentProps {
  registration: {
    registration_number: string;
    distance: string;
    race_title: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    bib_name: string;
    blood_group: string;
    tshirt_size: string;
    net_amount: number;
    city: string;
    state: string;
    qr_code_token: string;
    created_at: string;
  };
}

export default function SuccessContent({ registration }: SuccessContentProps) {
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
    `RAJGIR-MARATHON:${registration.registration_number}:${registration.qr_code_token}`
  )}`;

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-8">
      {/* 1. CELEBRATION HEADER */}
      <div className="text-center mb-8 animate-fadeIn">
        <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500 text-emerald-400 flex items-center justify-center text-3xl mx-auto mb-4">
          <FaCheckCircle />
        </div>
        <span className="text-xs font-black uppercase tracking-widest text-[#cca043]">
          OFFICIAL CONFIRMATION
        </span>
        <h1 className="text-2xl sm:text-4xl font-black uppercase text-white font-graduate mt-1">
          REGISTRATION CONFIRMED!
        </h1>
        <p className="text-xs sm:text-sm text-neutral-300 mt-2 max-w-lg mx-auto leading-relaxed">
          Congratulations, <strong>{registration.first_name}</strong>! Your registration for the{" "}
          <strong>{registration.distance} {registration.race_title}</strong> has been secured in the official race system.
        </p>
      </div>

      {/* 2. DIGITAL FINISHER / ATHLETE PASS CARD */}
      <div
        id="printable-pass"
        className="rounded-2xl border-2 border-[#cca043]/50 bg-[#0e0b08] p-6 sm:p-8 relative overflow-hidden text-left"
      >
        {/* Pass Top Banner */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5 mb-5">
          <div className="flex items-center gap-3">
            <img
              src="/images/mainLogo.png"
              alt="Rajgir Marathon"
              className="h-10 sm:h-12 w-auto object-contain"
            />
            <div>
              <span className="font-graduate text-base sm:text-lg font-black text-white tracking-wider block">
                RAJGIR MARATHON 2027
              </span>
              <span className="text-[10px] text-[#cca043] font-bold uppercase tracking-widest">
                Official Digital Runner Pass
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-neutral-400 block">
              REGISTRATION NO.
            </span>
            <span className="font-mono text-sm sm:text-base font-black text-[#cca043]">
              {registration.registration_number}
            </span>
          </div>
        </div>

        {/* Pass Middle: 2-Column Info + QR Code */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
          <div className="sm:col-span-8 space-y-3.5 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-neutral-500 block">
                  RUNNER NAME
                </span>
                <span className="font-bold text-sm text-white">
                  {registration.first_name} {registration.last_name}
                </span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-neutral-500 block">
                  RACE CATEGORY
                </span>
                <span className="font-bold text-sm text-[#cca043]">
                  {registration.distance}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-neutral-500 block">
                  NAME ON BIB
                </span>
                <span className="font-mono font-black text-sm uppercase text-white bg-white/10 px-2 py-0.5 rounded inline-block">
                  {registration.bib_name}
                </span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-neutral-500 block">
                  BLOOD GROUP / JERSEY
                </span>
                <span className="font-bold text-neutral-200">
                  {registration.blood_group} • Size {registration.tshirt_size}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-neutral-500 block">
                  VENUE & DATE
                </span>
                <span className="text-neutral-300">
                  Rajgir, Bihar • Nov 2027
                </span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-neutral-500 block">
                  FEE PAID / STATUS
                </span>
                <span className="font-mono font-bold text-emerald-400">
                  ₹{registration.net_amount.toLocaleString()} • CONFIRMED
                </span>
              </div>
            </div>
          </div>

          {/* QR Code Container */}
          <div className="sm:col-span-4 flex flex-col items-center justify-center p-3 rounded-xl bg-white text-black text-center">
            <img
              src={qrUrl}
              alt="Registration QR Code"
              className="w-32 h-32 object-contain"
            />
            <span className="text-[9px] font-mono font-bold uppercase mt-1 tracking-wider text-neutral-800">
              SCAN AT EXPO BIB DESK
            </span>
          </div>
        </div>

        {/* Pass Bottom Strip */}
        <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between text-[10px] text-neutral-400 gap-2">
          <div className="flex items-center gap-1.5">
            <FaShieldAlt className="text-emerald-400" />
            <span>Official Pass verified by Rajgir Marathon Operations Board.</span>
          </div>
          <span>Ref: {registration.qr_code_token.slice(0, 8)}</span>
        </div>
      </div>

      {/* 3. NEXT STEPS & ACTION BUTTONS */}
      <div className="mt-8 space-y-4 text-center">
        <div className="flex flex-wrap items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => window.print()}
            className="py-3 px-6 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer"
          >
            <FaPrint />
            <span>Print / Save Digital Pass</span>
          </button>

          <Link
            href="/register/runner"
            className="py-3 px-6 rounded-xl bg-gradient-to-r from-[#d49a37] via-[#e0a845] to-[#cca043] text-black font-extrabold text-xs uppercase tracking-wider flex items-center gap-2 hover:brightness-105 transition-all"
          >
            <span>Register Another Participant</span>
            <FaArrowRight className="text-xs" />
          </Link>
        </div>

        <div className="pt-4 text-xs text-neutral-400">
          <Link href="/" className="hover:text-white underline">
            ← Return to Marathon Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}

