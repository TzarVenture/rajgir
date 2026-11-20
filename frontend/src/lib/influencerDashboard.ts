import React from "react";
import { redirect } from "next/navigation";
import { authContext, requireUser } from "@/lib/auth/session";
import { loadInfluencerDashboard, type ApiInfluencer } from "@/lib/dashboardData";
import { EVENT, formatDate, formatDateTime, nowMs } from "@/lib/event";
import { qrDataUrl } from "@/lib/qr";
import type { ActionItem } from "@/components/dashboard/ActionItems";

export interface CreatorDeliverable {
  id: string;
  title: string;
  platform: string;
  window: string;
  description: string;
  suggestedTags: string[];
  status: "COMPLETED" | "IN_REVIEW" | "PENDING";
  submittedUrl?: string;
}

export const DEFAULT_DELIVERABLES: CreatorDeliverable[] = [
  {
    id: "deliv-course-preview",
    title: "Course Preview Reel & Route Walkthrough",
    platform: "Reel / Shorts",
    window: "Race Week (T-7 Days)",
    description: "Highlight historical landmarks along the 42.195 km route including Nalanda University Ruins, Vishwa Shanti Stupa, and the Hot Springs.",
    suggestedTags: ["#RajgirMarathon2027", "#RunThroughHistory", "#CoursePreview"],
    status: "PENDING",
  },
  {
    id: "deliv-kit-reveal",
    title: "Official Runner Kit & Merchandise Unboxing",
    platform: "Post / Story Carousel",
    window: "Expo Days (Friday / Saturday)",
    description: "Unboxing of official event tech t-shirt, digital bib pass, goodie bag, and timing chip instructions from the Marathon Expo at RICC.",
    suggestedTags: ["#RajgirMarathon", "#MarathonKit", "#RaceReady"],
    status: "PENDING",
  },
  {
    id: "deliv-race-day-live",
    title: "Race Day Morning Live & Finish Line Celebrations",
    platform: "Live Stories & Video",
    window: "Race Day (04:30 AM – 11:30 AM)",
    description: "Capture the start corral gun time energy, cheer on runners at the 21K/42K turnaround, and capture triumphant finisher moments.",
    suggestedTags: ["#RajgirMarathonLive", "#FinishLine", "#MedalReveal"],
    status: "PENDING",
  },
  {
    id: "deliv-heritage-recap",
    title: "Rajgir Marathon Experience Recap & Heritage Travelogue",
    platform: "Longform Video / Reel",
    window: "Post-Race (+3 Days)",
    description: "Comprehensive summary of the race atmosphere, crowd support, scenic heritage vistas of Bihar, and why runners should join next edition.",
    suggestedTags: ["#ExploreBihar", "#MarathonRecap", "#RunRajgir"],
    status: "PENDING",
  },
];

export function platformBrandColor(platform: string): { bg: string; text: string; border: string; accent: string } {
  const p = platform.toLowerCase();
  if (p.includes("instagram")) {
    return { bg: "bg-pink-50", text: "text-pink-700", border: "border-pink-200", accent: "#E1306C" };
  }
  if (p.includes("youtube")) {
    return { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", accent: "#FF0000" };
  }
  if (p.includes("strava")) {
    return { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200", accent: "#FC4C02" };
  }
  if (p.includes("twitter") || p.includes("x")) {
    return { bg: "bg-charcoal-100", text: "text-charcoal-900", border: "border-charcoal-300", accent: "#111827" };
  }
  if (p.includes("facebook")) {
    return { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", accent: "#1877F2" };
  }
  return { bg: "bg-surface-soft", text: "text-charcoal-800", border: "border-charcoal-200", accent: "#E31B23" };
}

export async function getInfluencerDashboardContext(path: string) {
  const user = await requireUser(path);
  if (user.role !== "INFLUENCER") redirect("/dashboard");

  const ctx = await authContext();
  let load = ctx
    ? await loadInfluencerDashboard(ctx)
    : ({ kind: "error", message: "Your session has expired. Please sign in again." } as const);

  // If in development or active user with no separate profile row yet, fallback with user data
  if (load.kind === "not-registered" && user.role === "INFLUENCER") {
    const fallbackCreator: ApiInfluencer = {
      id: user.id,
      fullName: user.name,
      stageName: user.name.split(" ")[0] ? `@${user.name.split(" ")[0].toLowerCase()}_runs` : "@creator",
      email: user.email,
      phone: user.phone || "+91 98765 43210",
      city: "Patna",
      country: "India",
      primaryPlatform: "Instagram",
      profileUrl: `https://instagram.com/${user.name.split(" ")[0].toLowerCase() || "creator"}`,
      followerCount: "25K+",
      engagementRate: "4.8%",
      targetNiche: "Running & Fitness",
      collaborationDeliverables: "Course preview reel, bib reveal post, race day finish line story coverage",
      status: user.status === "ACTIVE" ? "approved" : "pending",
      submittedAt: new Date().toISOString(),
      promoCode: `RAJGIR${(user.name.replace(/[^a-zA-Z]/g, "").slice(0, 5) || "CREATOR").toUpperCase()}10`,
      mediaPassNumber: `PRESS-2027-${user.id.slice(0, 6).toUpperCase()}`,
    };
    load = { kind: "ok", data: fallbackCreator, limited: false };
  }

  if (load.kind !== "ok") {
    return { user, load, data: null };
  }

  const inf: ApiInfluencer = load.data;
  const approved = (inf.status ?? "").toLowerCase() === "approved" || user.status === "ACTIVE";
  const rejected = (inf.status ?? "").toLowerCase() === "rejected";
  const creatorId = `INF-${inf.id.slice(0, 8).toUpperCase()}`;
  const promoCode = inf.promoCode || `RAJGIR${(inf.stageName || inf.fullName).replace(/[^a-zA-Z0-9]/g, "").slice(0, 6).toUpperCase()}10`;
  const mediaPassNumber = inf.mediaPassNumber || `PRESS-2027-${inf.id.slice(0, 6).toUpperCase()}`;
  const badgeQr = await qrDataUrl(`RAJGIR-PRESS-PASS:${inf.id}:${mediaPassNumber}`);

  const initials = inf.fullName
    .split(/\s+/)
    .slice(0, 2)
    .map((s) => s[0] ?? "")
    .join("")
    .toUpperCase();

  const brand = platformBrandColor(inf.primaryPlatform);

  const todo: ActionItem[] = [
    {
      id: "proposal-submitted",
      title: "Creator collaboration proposal submitted",
      detail: `Submitted for ${inf.primaryPlatform} (${inf.followerCount} audience) on ${formatDate(inf.submittedAt)}.`,
      state: "done",
    },
    {
      id: "pr-review",
      title: "PR & Media accreditation evaluation",
      detail: approved
        ? "Official Media Accreditation granted by Rajgir Marathon Committee."
        : rejected
          ? "Proposal not accepted for this edition. You may reach out to press@rajgirmarathon.com."
          : "The PR & Media committee evaluates channel engagement within 48 to 72 hours.",
      state: approved ? "done" : rejected ? "todo" : "waiting",
      action: rejected ? { label: "Contact PR Desk", href: "/dashboard/influencer/support" } : undefined,
    },
    {
      id: "media-pass",
      title: "Collect VIP Press Pass & Lanyard at Expo",
      detail: approved
        ? `Accreditation Pass #${mediaPassNumber} issued. Ready for digital download or Expo pickup.`
        : "Accreditation pass will be unlocked upon media committee approval.",
      state: approved ? "todo" : "waiting",
      action: approved ? { label: "View Digital Pass", href: "/dashboard/influencer/pass" } : undefined,
    },
    {
      id: "brand-kit",
      title: "Download official Brand Kit & Course B-Roll",
      detail: "Access vector logos, official race hashtags (#RajgirMarathon2027), and high-res heritage clips.",
      state: "todo",
      action: { label: "Open Brand Kit", href: "/dashboard/influencer/brand-kit" },
    },
    {
      id: "promo-code",
      title: "Share your 10% Community Discount Code",
      detail: `Your exclusive audience code: ${promoCode}. Track registrations in your brand kit hub.`,
      state: approved ? "todo" : "later",
      action: approved ? { label: "Share Code", href: "/dashboard/influencer/brand-kit" } : undefined,
    },
    {
      id: "deliverables-preview",
      title: "Publish Course Preview & Route Reel",
      detail: "Deliver milestone 1 of your campaign deliverables before race week kickoff.",
      state: approved ? "todo" : "later",
      action: approved ? { label: "Deliverables Desk", href: "/dashboard/influencer/deliverables" } : undefined,
    },
  ];

  return {
    user,
    load,
    data: {
      inf,
      approved,
      rejected,
      creatorId,
      promoCode,
      mediaPassNumber,
      badgeQr,
      initials,
      brand,
      todo,
      deliverablesList: DEFAULT_DELIVERABLES,
    },
  };
}
