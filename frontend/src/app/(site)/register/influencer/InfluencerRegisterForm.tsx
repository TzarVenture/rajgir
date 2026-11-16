"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AppUser } from "@/lib/auth/session";
import {
  FaCheckCircle,
  FaArrowRight,
  FaSpinner,
  FaShieldAlt,
  FaLock,
  FaBullhorn,
} from "react-icons/fa";

const PLATFORM_OPTIONS = ["Instagram", "YouTube", "Strava", "Facebook", "Twitter / X", "Blog / Website"];

interface InfluencerRegisterFormProps {
  user: AppUser;
}

export default function InfluencerRegisterForm({ user }: InfluencerRegisterFormProps) {
  const [formData, setFormData] = useState({
    userId: user.id,
    fullName: user.name || "",
    stageName: "",
    email: user.email || "",
    phone: user.phone || "",
    city: "Patna",
    country: "India",
    primaryPlatform: "Instagram",
    profileUrl: "",
    followerCount: "25K+",
    engagementRate: "4.5%",
    targetNiche: "Running & Fitness",
    collaborationDeliverables: "Course preview reel, bib reveal post, race day finish line story coverage",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");

    if (!formData.profileUrl.trim()) {
      setSubmitError("Please provide your profile or channel URL.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/register/influencer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          userId: user.id,
          fullName: user.name,
          email: user.email,
          phone: formData.phone || user.phone,
        }),
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to submit influencer proposal.");
      }

      setSubmitted(true);
    } catch (err: any) {
      setSubmitError(err.message || "Failed to submit proposal. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="w-full rounded-2xl border border-pink-500/40 bg-[#0f0c09]/95 backdrop-blur-md p-6 sm:p-8 shadow-2xl text-center relative overflow-hidden">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-pink-500/10 border border-pink-500/30 flex items-center justify-center text-pink-400 text-3xl">
          <FaCheckCircle />
        </div>

        <span className="text-[10px] font-black uppercase tracking-widest text-pink-400 bg-pink-400/10 border border-pink-400/30 px-3 py-1 rounded-full">
          Proposal Submitted
        </span>

        <h2 className="text-2xl font-black uppercase text-white font-graduate mt-3 mb-2">
          Collaboration Proposal Received
        </h2>
        <p className="text-sm text-neutral-300 max-w-md mx-auto mb-6 leading-relaxed">
          Thank you for pitching to represent the Rajgir Marathon! Our PR &amp; Media team will evaluate your channel reach and reach out regarding official media pass accreditation.
        </p>

        <div className="p-4 rounded-xl bg-black/60 border border-white/10 mb-6 text-left space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-neutral-400">Creator:</span>
            <span className="text-white font-semibold">{user.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-400">Platform:</span>
            <span className="text-pink-400 font-semibold">{formData.primaryPlatform}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-400">Application Status:</span>
            <span className="text-amber-400 font-semibold uppercase">Under Media Review</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/pending"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-3 px-6 rounded-full bg-gradient-to-r from-[#cca043] to-[#b3852b] text-black font-extrabold text-xs uppercase tracking-wider shadow-lg hover:brightness-110 transition-all"
          >
            <span>Check Application Status</span>
            <FaArrowRight className="text-xs" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full rounded-2xl border border-[#cca043]/35 bg-[#0f0c09]/95 backdrop-blur-md p-5 sm:p-6 lg:p-7 shadow-xl relative">
      <div className="text-left mb-4">
        <span className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-[#d49a37]">
          Creator &amp; Athlete Ambassador
        </span>
        <h2 className="text-lg sm:text-xl font-bold uppercase text-white font-graduate mt-0.5">
          Influencer Collaboration Pitch
        </h2>
      </div>

      {submitError && (
        <div className="mb-4 p-3 rounded-lg bg-red-950/50 border border-red-500/50 text-red-200 text-xs">
          {submitError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Verified User Identity (Pre-filled & Locked) */}
        <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-2 text-left">
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <div className="flex items-center gap-2">
              <FaShieldAlt className="text-[#cca043] text-xs" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-white">
                Creator Account Identity
              </span>
            </div>
            <span className="text-[9px] text-neutral-400 flex items-center gap-1">
              <FaLock className="text-[8px]" /> Locked
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs">
            <div>
              <span className="text-[10px] text-neutral-500 uppercase font-bold">Name: </span>
              <span className="text-white font-medium">{user.name}</span>
            </div>
            <div>
              <span className="text-[10px] text-neutral-500 uppercase font-bold">Email: </span>
              <span className="text-neutral-300 font-medium truncate">{user.email}</span>
            </div>
          </div>
        </div>

        {/* Contact Mobile & Creator Handle */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-300 mb-1">
              Contact Mobile <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="10-digit mobile number"
              className="w-full px-3.5 py-2.5 rounded-lg bg-black/50 border border-white/15 text-white placeholder-neutral-500 text-xs focus:border-[#cca043] focus:ring-1 focus:ring-[#cca043] outline-none transition"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-300 mb-1">
              Creator / Handle / Channel Name
            </label>
            <input
              type="text"
              value={formData.stageName}
              onChange={(e) => setFormData({ ...formData, stageName: e.target.value })}
              placeholder="e.g. The Patna Runner / Fitness With Pooja"
              className="w-full px-3.5 py-2.5 rounded-lg bg-black/50 border border-white/15 text-white placeholder-neutral-500 text-xs focus:border-[#cca043] focus:ring-1 focus:ring-[#cca043] outline-none transition"
            />
          </div>
        </div>

        {/* Platform & Profile URL */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-300 mb-1">
              Primary Platform <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.primaryPlatform}
              onChange={(e) => setFormData({ ...formData, primaryPlatform: e.target.value })}
              className="w-full px-3 py-2.5 rounded-lg bg-[#0d0a07] border border-white/15 text-white text-xs focus:border-[#cca043] focus:ring-1 focus:ring-[#cca043] outline-none transition"
            >
              {PLATFORM_OPTIONS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-300 mb-1">
              Profile / Channel URL <span className="text-red-500">*</span>
            </label>
            <input
              type="url"
              required
              value={formData.profileUrl}
              onChange={(e) => setFormData({ ...formData, profileUrl: e.target.value })}
              placeholder="https://instagram.com/yourhandle"
              className="w-full px-3.5 py-2.5 rounded-lg bg-black/50 border border-white/15 text-white placeholder-neutral-500 text-xs focus:border-[#cca043] focus:ring-1 focus:ring-[#cca043] outline-none transition"
            />
          </div>
        </div>

        {/* Metrics: Followers, Engagement, City */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-300 mb-1">
              Audience / Followers <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.followerCount}
              onChange={(e) => setFormData({ ...formData, followerCount: e.target.value })}
              placeholder="e.g. 50K"
              className="w-full px-3.5 py-2.5 rounded-lg bg-black/50 border border-white/15 text-white placeholder-neutral-500 text-xs focus:border-[#cca043] focus:ring-1 focus:ring-[#cca043] outline-none transition"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-300 mb-1">
              Avg. Engagement Rate
            </label>
            <input
              type="text"
              value={formData.engagementRate}
              onChange={(e) => setFormData({ ...formData, engagementRate: e.target.value })}
              placeholder="e.g. 4.2%"
              className="w-full px-3.5 py-2.5 rounded-lg bg-black/50 border border-white/15 text-white placeholder-neutral-500 text-xs focus:border-[#cca043] focus:ring-1 focus:ring-[#cca043] outline-none transition"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-300 mb-1">
              Base City
            </label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              placeholder="e.g. Patna, Ranchi, Delhi"
              className="w-full px-3.5 py-2.5 rounded-lg bg-black/50 border border-white/15 text-white placeholder-neutral-500 text-xs focus:border-[#cca043] focus:ring-1 focus:ring-[#cca043] outline-none transition"
            />
          </div>
        </div>

        {/* Target Niche */}
        <div className="text-left">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-300 mb-1">
            Content Niche <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.targetNiche}
            onChange={(e) => setFormData({ ...formData, targetNiche: e.target.value })}
            placeholder="e.g. Running, Marathon Vlogs, Fitness Nutrition, Bihar Travel"
            className="w-full px-3.5 py-2.5 rounded-lg bg-black/50 border border-white/15 text-white placeholder-neutral-500 text-xs focus:border-[#cca043] focus:ring-1 focus:ring-[#cca043] outline-none transition"
          />
        </div>

        {/* Deliverables */}
        <div className="text-left">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-300 mb-1">
            Proposed Deliverables &amp; Campaign Ideas <span className="text-red-500">*</span>
          </label>
          <textarea
            rows={3}
            required
            value={formData.collaborationDeliverables}
            onChange={(e) => setFormData({ ...formData, collaborationDeliverables: e.target.value })}
            placeholder="Describe what content you will produce (e.g. 3 Instagram reels promoting registration, 1 race-day vlog, live stories from the finish line)."
            className="w-full px-3.5 py-2.5 rounded-lg bg-black/50 border border-white/15 text-white placeholder-neutral-500 text-xs focus:border-[#cca043] focus:ring-1 focus:ring-[#cca043] outline-none transition"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 px-6 rounded-full bg-gradient-to-r from-[#e51b24] via-[#dc2626] to-[#b91c1c] text-white font-extrabold text-xs uppercase tracking-widest shadow-xl hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
        >
          {isSubmitting ? (
            <>
              <FaSpinner className="animate-spin text-sm" />
              <span>Submitting Proposal...</span>
            </>
          ) : (
            <>
              <span>Submit Influencer Collaboration Pitch</span>
              <FaArrowRight className="text-xs" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}

