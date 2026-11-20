"use client";

import { useState } from "react";
import {
  LuCheck,
  LuCopy,
  LuDownload,
  LuExternalLink,
  LuFileText,
  LuMegaphone,
  LuShare2,
  LuSparkles,
  LuUsers,
  LuVideo,
} from "react-icons/lu";
import { Badge, Button, Card, Notice } from "@/components/ui";

export function BrandKitHub({
  promoCode,
  creatorHandle,
}: {
  promoCode: string;
  creatorHandle: string;
}) {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedHex, setCopiedHex] = useState<string | null>(null);
  const [copiedTags, setCopiedTags] = useState(false);

  const shareUrl = typeof window !== "undefined"
    ? `${window.location.origin}/register/runner?ref=${promoCode}`
    : `https://rajgirmarathon.com/register/runner?ref=${promoCode}`;

  const allHashtags = "#RajgirMarathon2027 #RunThroughHistory #ExploreBihar #BiharSports #RajgirHeritage @rajgirmarathon @bihartourism";

  function copyCode() {
    navigator.clipboard.writeText(promoCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  }

  function copyLink() {
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  }

  function copyColor(hex: string) {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 1500);
  }

  function copyTags() {
    navigator.clipboard.writeText(allHashtags);
    setCopiedTags(true);
    setTimeout(() => setCopiedTags(false), 2000);
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* ---------- Section 1: Audience Discount Promo Code ---------- */}
      <div className="rounded-card border border-brand-red/30 bg-gradient-to-br from-white via-surface-soft to-brand-red-light/20 p-5 sm:p-7 shadow-2xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-charcoal-200/60 pb-4">
          <div>
            <span className="text-xs font-semibold text-brand-red uppercase tracking-wider">
              Exclusive Creator Affiliate Code
            </span>
            <h2 className="font-barlow text-2xl sm:text-3xl font-bold text-charcoal-900 mt-0.5">
              10% Discount for Your Community
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-charcoal-600 max-w-xl">
              Give your followers an exclusive 10% discount on all race distances. Every registration using your code earns community engagement points toward VIP race day hospitality access.
            </p>
          </div>
          <Badge tone="brand">Active Campaign</Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Promo Code Box */}
          <div className="rounded-btn border border-charcoal-300 bg-white p-4 space-y-2">
            <span className="text-xs font-semibold text-charcoal-500">Your Promo Code</span>
            <div className="flex items-center justify-between gap-3 bg-surface-soft rounded-btn border border-charcoal-200 px-4 py-2.5">
              <span className="font-mono text-xl sm:text-2xl font-bold text-brand-red tracking-wider">
                {promoCode}
              </span>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                icon={copiedCode ? LuCheck : LuCopy}
                onClick={copyCode}
              >
                {copiedCode ? "Copied" : "Copy Code"}
              </Button>
            </div>
          </div>

          {/* Share Referral Link Box */}
          <div className="rounded-btn border border-charcoal-300 bg-white p-4 space-y-2">
            <span className="text-xs font-semibold text-charcoal-500">Direct Registration URL</span>
            <div className="flex items-center justify-between gap-3 bg-surface-soft rounded-btn border border-charcoal-200 px-4 py-2.5">
              <span className="font-mono text-xs text-charcoal-600 truncate max-w-[200px] sm:max-w-[240px]">
                {shareUrl}
              </span>
              <Button
                type="button"
                variant="primary"
                size="sm"
                icon={copiedLink ? LuCheck : LuShare2}
                onClick={copyLink}
              >
                {copiedLink ? "Link Copied" : "Copy Link"}
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3 pt-2">
          <div className="rounded-btn bg-white border border-charcoal-200 p-3 text-center">
            <p className="font-barlow text-xl sm:text-2xl font-bold text-charcoal-900">10%</p>
            <p className="text-[11px] text-charcoal-500">Follower Discount</p>
          </div>
          <div className="rounded-btn bg-white border border-charcoal-200 p-3 text-center">
            <p className="font-barlow text-xl sm:text-2xl font-bold text-brand-red">All Distances</p>
            <p className="text-[11px] text-charcoal-500">42K, 21K, 10K, 5K</p>
          </div>
          <div className="rounded-btn bg-white border border-charcoal-200 p-3 text-center">
            <p className="font-barlow text-xl sm:text-2xl font-bold text-charcoal-900">Unlimited</p>
            <p className="text-[11px] text-charcoal-500">Allowed Redemptions</p>
          </div>
        </div>
      </div>

      {/* ---------- Section 2: Official Logos & Vector Marks ---------- */}
      <div className="rounded-card border border-charcoal-200 bg-white p-5 sm:p-6 shadow-2xs space-y-5">
        <div className="border-b border-charcoal-100 pb-3">
          <h2 className="font-barlow text-xl sm:text-2xl font-bold text-charcoal-900">
            Official Marathon Brand Assets
          </h2>
          <p className="mt-0.5 text-xs sm:text-sm text-charcoal-600">
            High-resolution vector marks, official emblem transparent PNGs, and color swatches for video overlays.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Logo 1: Primary Full Logo */}
          <div className="rounded-btn border border-charcoal-200 bg-surface-soft p-4 flex flex-col justify-between space-y-4">
            <div className="h-24 flex items-center justify-center bg-white rounded-btn p-3 border border-charcoal-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/rajgir_new_logo.png" alt="Rajgir Marathon Full Logo" className="h-16 w-auto object-contain" />
            </div>
            <div>
              <p className="font-semibold text-xs text-charcoal-900">Primary Official Crest</p>
              <p className="text-[11px] text-charcoal-500">Transparent PNG (High Res 2048px)</p>
            </div>
            <a
              href="/images/rajgir_new_logo.png"
              download="rajgir-marathon-logo.png"
              className="inline-flex items-center justify-center gap-1.5 rounded-btn bg-white border border-charcoal-300 py-1.5 px-3 text-xs font-semibold text-charcoal-700 hover:bg-charcoal-100 transition-colors"
            >
              <LuDownload className="h-3.5 w-3.5" />
              <span>Download PNG</span>
            </a>
          </div>

          {/* Logo 2: Dark Background Variant */}
          <div className="rounded-btn border border-charcoal-200 bg-charcoal-900 p-4 flex flex-col justify-between space-y-4 text-white">
            <div className="h-24 flex items-center justify-center bg-charcoal-800 rounded-btn p-3 border border-charcoal-700">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/rajgir_new_logo.png" alt="Rajgir Marathon Dark Variant" className="h-16 w-auto object-contain brightness-110" />
            </div>
            <div>
              <p className="font-semibold text-xs text-white">Dark Mode Crest</p>
              <p className="text-[11px] text-charcoal-400">Optimized for dark video overlays</p>
            </div>
            <a
              href="/images/rajgir_new_logo.png"
              download="rajgir-marathon-dark.png"
              className="inline-flex items-center justify-center gap-1.5 rounded-btn bg-charcoal-800 border border-charcoal-700 py-1.5 px-3 text-xs font-semibold text-white hover:bg-charcoal-700 transition-colors"
            >
              <LuDownload className="h-3.5 w-3.5" />
              <span>Download PNG</span>
            </a>
          </div>

          {/* Logo 3: Official Course Map & Elevation Graphic */}
          <div className="rounded-btn border border-charcoal-200 bg-surface-soft p-4 flex flex-col justify-between space-y-4">
            <div className="h-24 flex items-center justify-center bg-brand-red-light/40 rounded-btn p-3 border border-brand-red/20 text-brand-red">
              <span className="font-barlow font-bold text-lg text-center uppercase leading-tight">
                42.2K Heritage Route Elevation
              </span>
            </div>
            <div>
              <p className="font-semibold text-xs text-charcoal-900">Route Map & Elevation Graphic</p>
              <p className="text-[11px] text-charcoal-500">Vector PDF with GPS turn points</p>
            </div>
            <a
              href="/images/rajgir_new_logo.png"
              download="rajgir-course-elevation.png"
              className="inline-flex items-center justify-center gap-1.5 rounded-btn bg-white border border-charcoal-300 py-1.5 px-3 text-xs font-semibold text-charcoal-700 hover:bg-charcoal-100 transition-colors"
            >
              <LuDownload className="h-3.5 w-3.5" />
              <span>Download Graphic</span>
            </a>
          </div>
        </div>

        {/* Brand Color Palette Swatches */}
        <div className="pt-3 border-t border-charcoal-100">
          <p className="text-xs font-semibold text-charcoal-500 uppercase tracking-wider mb-3">
            Official Brand Color Palette (Click to Copy HEX)
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { name: "Brand Red", hex: "#E31B23", textLight: true },
              { name: "Charcoal Deep", hex: "#111827", textLight: true },
              { name: "Historic Gold", hex: "#D97706", textLight: true },
              { name: "Soft Surface", hex: "#F9FAFB", textLight: false },
            ].map((col) => (
              <button
                key={col.hex}
                type="button"
                onClick={() => copyColor(col.hex)}
                className="rounded-btn border border-charcoal-200 p-3 text-left transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{ backgroundColor: col.hex }}
              >
                <p className={`text-xs font-bold ${col.textLight ? "text-white" : "text-charcoal-900"}`}>
                  {col.name}
                </p>
                <p className={`font-mono text-xs mt-1 ${col.textLight ? "text-white/80" : "text-charcoal-600"}`}>
                  {copiedHex === col.hex ? "COPIED!" : col.hex}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ---------- Section 3: Official B-Roll Footage Archive ---------- */}
      <div className="rounded-card border border-charcoal-200 bg-white p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-charcoal-100 pb-3">
          <div>
            <h2 className="font-barlow text-xl sm:text-2xl font-bold text-charcoal-900 flex items-center gap-2">
              <LuVideo className="h-5 w-5 text-brand-red" />
              <span>Official 4K B-Roll & Drone Library</span>
            </h2>
            <p className="mt-0.5 text-xs sm:text-sm text-charcoal-600">
              Broadcast-cleared 4K footage clips free to use for your course preview reels and travelogues.
            </p>
          </div>
          <Badge tone="neutral">Royalty-Free for Media</Badge>
        </div>

        <div className="divide-y divide-charcoal-100">
          {[
            {
              title: "Vishwa Shanti Stupa & Ratnagiri Hill Aerials",
              spec: "4K 60fps • ProRes / MP4 • 120MB",
              desc: "Panoramic sunrise drone shots overlooking the Peace Pagoda and aerial course curves.",
            },
            {
              title: "Ancient Nalanda University Ruins Course Cutaways",
              spec: "4K 24fps • Color Graded • 95MB",
              desc: "Historical red brick stupas and ancient learning halls featured along the 42K turnaround.",
            },
            {
              title: "Rajgir Hot Springs (Brahmakund) & Venu Vana",
              spec: "1080p 60fps • High Dynamic Range • 70MB",
              desc: "Atmospheric steam rising from natural healing hot springs and bamboo groves.",
            },
            {
              title: "Start / Finish Line Arena & Stadium Grandstands",
              spec: "4K 60fps • Stadium Lighting • 140MB",
              desc: "Rajgir International Convention Centre arena, timing arches, and finish chute visuals.",
            },
          ].map((clip, idx) => (
            <div key={idx} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-xs sm:text-sm text-charcoal-900">{clip.title}</p>
                <p className="text-xs text-charcoal-500 mt-0.5">{clip.desc}</p>
                <span className="font-mono text-[11px] text-charcoal-400 mt-1 block">{clip.spec}</span>
              </div>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                icon={LuDownload}
                onClick={() => alert(`Downloading ${clip.title} (Production archive link)`)}
              >
                Download Clip
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* ---------- Section 4: Mandatory Hashtags & Disclosure Cheat Sheet ---------- */}
      <div className="rounded-card border border-charcoal-200 bg-white p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-charcoal-100 pb-3">
          <div>
            <h2 className="font-barlow text-xl sm:text-2xl font-bold text-charcoal-900">
              Mandatory Hashtags & Tags
            </h2>
            <p className="mt-0.5 text-xs sm:text-sm text-charcoal-600">
              Include these tags in all sponsored reels and social coverage to guarantee PR campaign verification.
            </p>
          </div>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            icon={copiedTags ? LuCheck : LuCopy}
            onClick={copyTags}
          >
            {copiedTags ? "All Tags Copied!" : "Copy All Tags"}
          </Button>
        </div>

        <div className="rounded-btn bg-surface-soft border border-charcoal-200 p-4 font-mono text-xs text-charcoal-800 leading-relaxed break-words">
          {allHashtags}
        </div>
      </div>
    </div>
  );
}
