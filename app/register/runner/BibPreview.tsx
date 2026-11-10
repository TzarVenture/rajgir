"use client";

import React from "react";
import { FaRunning, FaQrcode } from "react-icons/fa";

interface BibPreviewProps {
  bibName: string;
  distance: string;
}

export default function BibPreview({ bibName, distance }: BibPreviewProps) {
  const displayName = bibName.trim().toUpperCase() || "YOUR NAME";

  // Category specific accent colors
  const colorScheme = (() => {
    switch (distance) {
      case "42.2 KM":
        return {
          banner: "bg-gradient-to-r from-red-700 via-red-600 to-red-800",
          border: "border-red-600",
          text: "text-red-500",
          badge: "bg-red-600 text-white",
        };
      case "21.1 KM":
        return {
          banner: "bg-gradient-to-r from-amber-600 via-[#cca043] to-amber-700",
          border: "border-[#cca043]",
          text: "text-[#cca043]",
          badge: "bg-[#cca043] text-black",
        };
      case "10 KM":
        return {
          banner: "bg-gradient-to-r from-blue-700 via-blue-600 to-blue-800",
          border: "border-blue-600",
          text: "text-blue-400",
          badge: "bg-blue-600 text-white",
        };
      case "5 KM":
        return {
          banner: "bg-gradient-to-r from-emerald-700 via-emerald-600 to-emerald-800",
          border: "border-emerald-600",
          text: "text-emerald-400",
          badge: "bg-emerald-600 text-white",
        };
      default:
        return {
          banner: "bg-gradient-to-r from-purple-700 via-purple-600 to-purple-800",
          border: "border-purple-600",
          text: "text-purple-400",
          badge: "bg-purple-600 text-white",
        };
    }
  })();

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="text-[10px] uppercase font-bold tracking-widest text-[#cca043] mb-2 text-center flex items-center justify-center gap-1.5">
        <FaRunning />
        <span>LIVE RACE BIB PREVIEW</span>
      </div>

      {/* Realistic Running Bib Card */}
      <div
        className={`relative w-full rounded-2xl bg-[#faf6ee] text-neutral-900 p-4 border-2 ${colorScheme.border} overflow-hidden select-none`}
      >
        {/* Safety pin corner holes */}
        <div className="absolute top-2 left-2 w-3.5 h-3.5 rounded-full border-2 border-neutral-400 bg-neutral-200/80 flex items-center justify-center">
          <div className="w-1.5 h-1.5 rounded-full bg-neutral-700" />
        </div>
        <div className="absolute top-2 right-2 w-3.5 h-3.5 rounded-full border-2 border-neutral-400 bg-neutral-200/80 flex items-center justify-center">
          <div className="w-1.5 h-1.5 rounded-full bg-neutral-700" />
        </div>
        <div className="absolute bottom-2 left-2 w-3.5 h-3.5 rounded-full border-2 border-neutral-400 bg-neutral-200/80 flex items-center justify-center">
          <div className="w-1.5 h-1.5 rounded-full bg-neutral-700" />
        </div>
        <div className="absolute bottom-2 right-2 w-3.5 h-3.5 rounded-full border-2 border-neutral-400 bg-neutral-200/80 flex items-center justify-center">
          <div className="w-1.5 h-1.5 rounded-full bg-neutral-700" />
        </div>

        {/* Top Header Banner */}
        <div className={`${colorScheme.banner} -mx-4 -mt-4 py-2 px-6 flex items-center justify-between text-white`}>
          <div className="flex items-center gap-2">
            <img
              src="/images/mainLogo.png"
              alt="Logo"
              className="h-6 w-auto object-contain"
            />
            <span className="font-extrabold text-[11px] tracking-wider uppercase font-graduate">
              RAJGIR MARATHON 2027
            </span>
          </div>
          <span className="text-[9px] font-black tracking-widest uppercase bg-black/40 px-2 py-0.5 rounded">
            {distance}
          </span>
        </div>

        {/* Bib Number Placeholder / Sequential */}
        <div className="mt-4 mb-2 text-center">
          <div className="font-graduate text-4xl sm:text-5xl font-black tracking-tight text-neutral-900 leading-none">
            {distance.startsWith("42") ? "42108" : distance.startsWith("21") ? "21045" : "10329"}
          </div>

          {/* Runner Custom Name */}
          <div className="mt-2 py-1 px-3 bg-neutral-900 text-white rounded-md inline-block max-w-[90%] truncate">
            <span className="font-black text-sm sm:text-base tracking-[0.14em] uppercase font-graduate">
              {displayName}
            </span>
          </div>
        </div>

        {/* Bottom Bar: Barcode, RFID chip mark & Slogan */}
        <div className="mt-3 pt-2 border-t border-neutral-300 flex items-center justify-between text-[8px] font-mono font-bold text-neutral-600">
          <div className="flex items-center gap-1">
            <FaQrcode className="text-base text-neutral-800" />
            <div className="flex flex-col text-left leading-tight">
              <span>RFID VERIFIED</span>
              <span className="text-[7px] text-neutral-500">TIMING CHIP</span>
            </div>
          </div>

          <span className="font-bold tracking-widest text-neutral-700 uppercase">
            RUN THROUGH HISTORY
          </span>

          <div className="flex items-center gap-0.5 tracking-tighter">
            ||||||||||||||||
          </div>
        </div>
      </div>
    </div>
  );
}

