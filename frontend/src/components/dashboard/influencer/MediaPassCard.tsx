"use client";

import React from "react";
import { LuCheck, LuDownload, LuPrinter, LuQrCode, LuShieldCheck } from "react-icons/lu";
import { Button } from "@/components/ui";

export function MediaPassCard({
  creatorName,
  stageName,
  platform,
  creatorId,
  mediaPassNumber,
  badgeQr,
  approved,
}: {
  creatorName: string;
  stageName: string | null;
  platform: string;
  creatorId: string;
  mediaPassNumber: string;
  badgeQr: string;
  approved: boolean;
}) {
  return (
    <div className="space-y-4">
      {/* Physical Pass Style Card */}
      <div
        id="printable-media-pass"
        className="relative overflow-hidden rounded-feature border border-charcoal-200 bg-white shadow-[0_8px_30px_rgba(17,24,39,0.08)] max-w-md mx-auto"
      >
        {/* Lanyard Top Punch Hole Header */}
        <div className="bg-charcoal-900 text-white p-4 text-center relative border-b-4 border-brand-red">
          <div className="mx-auto w-10 h-3 rounded-full bg-charcoal-800 border border-charcoal-700 mb-2 shadow-inner" />
          <p className="font-barlow text-sm font-bold tracking-widest uppercase text-white/90">
            Rajgir Marathon 2027
          </p>
          <p className="font-barlow text-xl sm:text-2xl font-black tracking-wider uppercase text-brand-red mt-0.5">
            PRESS &amp; CREATOR PASS
          </p>
        </div>

        {/* Pass Body */}
        <div className="p-6 text-center space-y-4 bg-gradient-to-b from-white to-surface-soft">
          {/* Avatar and Info */}
          <div className="space-y-1">
            <div className="mx-auto h-20 w-20 rounded-2xl bg-charcoal-900 text-white text-2xl font-bold flex items-center justify-center shadow-md border-2 border-brand-red">
              {creatorName
                .split(/\s+/)
                .slice(0, 2)
                .map((s) => s[0] ?? "")
                .join("")
                .toUpperCase()}
            </div>
            <h2 className="font-barlow text-2xl font-bold text-charcoal-900 pt-2">
              {creatorName}
            </h2>
            {stageName ? (
              <p className="font-mono text-sm font-bold text-brand-red">{stageName}</p>
            ) : null}
            <span className="inline-block rounded-full bg-charcoal-100 px-3 py-1 text-xs font-semibold text-charcoal-700">
              {platform} Creator
            </span>
          </div>

          {/* QR Code */}
          <div className="py-2 flex flex-col items-center justify-center">
            <div className="p-3 bg-white rounded-card border-2 border-charcoal-200 shadow-2xs inline-block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={badgeQr} alt="Media Accreditation QR Code" className="h-36 w-36 object-contain" />
            </div>
            <span className="font-mono text-xs font-bold text-charcoal-600 mt-2 block tracking-wider">
              {mediaPassNumber}
            </span>
          </div>

          {/* Clearance Level */}
          <div className="rounded-btn bg-brand-red-light/60 border border-brand-red/30 p-2.5">
            <span className="font-barlow text-xs font-bold text-brand-red-dark uppercase tracking-wider block">
              {approved ? "VIP ALL-ACCESS MEDIA CLEARANCE" : "PENDING COMMITTEE CLEARANCE"}
            </span>
          </div>

          {/* Micro Footer */}
          <div className="pt-2 border-t border-charcoal-200/60 flex items-center justify-between text-[11px] text-charcoal-500 font-mono">
            <span>Ref: {creatorId}</span>
            <span>Valid: Race Weekend 2027</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center gap-3 pt-2">
        <Button
          type="button"
          variant="secondary"
          size="md"
          icon={LuPrinter}
          onClick={() => window.print()}
        >
          Print Credential
        </Button>
        <a
          href={badgeQr}
          download={`${mediaPassNumber}-pass.png`}
          className="inline-flex items-center gap-1.5 rounded-btn bg-charcoal-900 hover:bg-black text-white px-4 py-2 text-xs font-semibold shadow-2xs transition-colors"
        >
          <LuDownload className="h-3.5 w-3.5" />
          <span>Save Pass QR</span>
        </a>
      </div>
    </div>
  );
}
