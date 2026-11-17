"use client";

import React from "react";
import { LuQrCode, LuRoute } from "react-icons/lu";

interface BibPreviewProps {
  bibName: string;
  distance: string;
}

export default function BibPreview({ bibName, distance }: BibPreviewProps) {
  const displayName = bibName.trim().toUpperCase() || "YOUR NAME";

  return (
    <div className="mx-auto w-full max-w-sm">
      <p className="mb-2 flex items-center justify-center gap-1.5 text-xs font-semibold text-charcoal-500">
        <LuRoute className="h-4 w-4" aria-hidden />
        <span>Live race bib preview</span>
      </p>

      {/* White bib card, thin charcoal border, red accent strip */}
      <div className="relative w-full select-none overflow-hidden rounded-card border border-charcoal-800 bg-white p-4">
        {/* Safety pin holes */}
        {["left-2 top-2", "right-2 top-2", "bottom-2 left-2", "bottom-2 right-2"].map((pos) => (
          <span
            key={pos}
            aria-hidden
            className={`absolute ${pos} flex h-3.5 w-3.5 items-center justify-center rounded-full border border-charcoal-400 bg-charcoal-100`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-charcoal-700" />
          </span>
        ))}

        {/* Header with brand red accent */}
        <div className="-mx-4 -mt-4 flex items-center justify-between border-b-4 border-brand-red bg-white px-6 py-2">
          <div className="flex items-center gap-2">
            <img src="/images/mainLogo.png" alt="Rajgir Marathon logo" className="h-6 w-auto object-contain" />
            <span className="font-barlow text-sm font-bold uppercase tracking-wide text-charcoal-900">Rajgir Marathon 2027</span>
          </div>
          <span className="rounded-[6px] bg-brand-red px-2 py-0.5 text-[11px] font-bold text-white">{distance}</span>
        </div>

        {/* Bib number and name */}
        <div className="mb-2 mt-4 text-center">
          <div className="font-barlow text-5xl font-bold leading-none text-charcoal-900 sm:text-6xl">
            {distance.startsWith("42") ? "42108" : distance.startsWith("21") ? "21045" : "10329"}
          </div>

          <div className="mt-2 inline-block max-w-[90%] truncate rounded-btn bg-charcoal-900 px-3 py-1">
            <span className="font-barlow text-base font-bold uppercase tracking-[0.14em] text-white sm:text-lg">{displayName}</span>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-3 flex items-center justify-between border-t border-charcoal-200 pt-2 text-[11px] font-semibold text-charcoal-600">
          <div className="flex items-center gap-1.5">
            <LuQrCode className="h-5 w-5 text-charcoal-800" aria-hidden />
            <div className="flex flex-col text-left leading-tight">
              <span>RFID verified</span>
              <span className="text-[10px] font-medium text-charcoal-500">Timing chip</span>
            </div>
          </div>
          <span className="font-barlow text-sm font-semibold uppercase tracking-wider text-brand-red">Run through history</span>
        </div>
      </div>
    </div>
  );
}
