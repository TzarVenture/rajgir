"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { AppUser } from "@/lib/auth/session";
import { submitSponsorRegistration } from "@/app/actions/registerGroup";
import {
  FaAward,
  FaArrowRight,
  FaShieldAlt,
  FaLock,
  FaSpinner,
  FaHandshake,
} from "react-icons/fa";

interface SponsorRegisterFormProps {
  user: AppUser;
}

export default function SponsorRegisterForm({ user }: SponsorRegisterFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    brandName: "",
    industry: "Sports & Nutrition",
    tierInterest: "Hydration & Energy Partner",
    budgetBand: "₹5 Lakhs - ₹15 Lakhs",
    brandWebsite: "",
    proposalDeliverables: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.brandName.trim()) {
      setError("Please provide the Brand or Organization Name.");
      return;
    }
    if (!formData.industry.trim()) {
      setError("Please specify your industry domain.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await submitSponsorRegistration({
        userId: user.id,
        brandName: formData.brandName.trim(),
        industry: formData.industry.trim(),
        tierInterest: formData.tierInterest.trim(),
        budgetBand: formData.budgetBand.trim(),
        brandWebsite: formData.brandWebsite.trim() || undefined,
        proposalDeliverables: formData.proposalDeliverables.trim() || undefined,
      });

      if (!res.success) {
        throw new Error(res.error || "Failed to submit sponsorship proposal.");
      }

      router.push("/pending");
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during submission.");
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto space-y-6">
      {error && (
        <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/40 text-red-200 text-sm">
          {error}
        </div>
      )}

      {/* Brand Liaison Identity (Pre-filled & Locked) */}
      <div className="p-5 rounded-xl bg-[#0f0c09] border border-white/10 space-y-3">
        <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
          <div className="flex items-center gap-2">
            <FaShieldAlt className="text-[#cca043] text-sm" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Brand Partnership Liaison (Verified)
            </h3>
          </div>
          <span className="text-[10px] text-neutral-400 flex items-center gap-1">
            <FaLock className="text-[9px]" /> Account Bound
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div>
            <p className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">Representative</p>
            <p className="text-sm font-semibold text-white">{user.name}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">Corporate Email</p>
            <p className="text-sm font-semibold text-neutral-300 truncate">{user.email}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">Contact Phone</p>
            <p className="text-sm font-semibold text-neutral-300">{user.phone || "—"}</p>
          </div>
        </div>
      </div>

      {/* Brand Partnership Details */}
      <div className="p-6 rounded-xl bg-[#0f0c09] border border-white/10 space-y-4">
        <div className="flex items-center gap-2 border-b border-white/5 pb-2.5">
          <FaAward className="text-[#cca043] text-sm" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-white">
            Brand Proposal & Tier Interest
          </h3>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-1.5">
                Brand / Corporation Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.brandName}
                onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
                placeholder="e.g. Amrit Mineral Waters / Fast&Up"
                className="w-full px-4 py-3 rounded-lg bg-black/50 border border-white/15 text-white placeholder-neutral-500 text-sm focus:border-[#cca043] focus:ring-1 focus:ring-[#cca043] outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-1.5">
                Industry Domain <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-[#0d0a07] border border-white/15 text-white text-sm focus:border-[#cca043] focus:ring-1 focus:ring-[#cca043] outline-none transition"
              >
                <option value="Sports & Nutrition">Sports, Energy & Nutrition</option>
                <option value="Beverages & Water">Beverages & Water</option>
                <option value="Footwear & Apparel">Footwear & Apparel</option>
                <option value="Banking & Financial Services">Banking & Financial Services</option>
                <option value="Automobile & Mobility">Automobile & Mobility</option>
                <option value="Healthcare & Diagnostics">Healthcare & Diagnostics</option>
                <option value="Technology & Telecommunications">Technology & Telecommunications</option>
                <option value="Hospitality & Tourism">Hospitality & Tourism</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-1.5">
                Preferred Sponsorship Category <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.tierInterest}
                onChange={(e) => setFormData({ ...formData, tierInterest: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-[#0d0a07] border border-white/15 text-white text-sm focus:border-[#cca043] focus:ring-1 focus:ring-[#cca043] outline-none transition"
              >
                <option value="Title / Presenting Sponsor">Title / Presenting Sponsor</option>
                <option value="Powered By Partner">Powered By Partner</option>
                <option value="Hydration & Energy Partner">Official Hydration & Energy Partner</option>
                <option value="Recovery Zone Partner">Recovery Zone Partner</option>
                <option value="Official Timing Partner">Official Timing & Technology Partner</option>
                <option value="Running Kit / Apparel Partner">Official Kit / Apparel Partner</option>
                <option value="Medical & Safety Partner">Medical & Safety Partner</option>
                <option value="Associate / Supporting Sponsor">Associate / Supporting Sponsor</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-1.5">
                Indicative Budget Band <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.budgetBand}
                onChange={(e) => setFormData({ ...formData, budgetBand: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-[#0d0a07] border border-white/15 text-white text-sm focus:border-[#cca043] focus:ring-1 focus:ring-[#cca043] outline-none transition"
              >
                <option value="₹2 Lakhs - ₹5 Lakhs">₹2 Lakhs - ₹5 Lakhs</option>
                <option value="₹5 Lakhs - ₹15 Lakhs">₹5 Lakhs - ₹15 Lakhs</option>
                <option value="₹15 Lakhs - ₹35 Lakhs">₹15 Lakhs - ₹35 Lakhs</option>
                <option value="₹35 Lakhs - ₹75 Lakhs">₹35 Lakhs - ₹75 Lakhs</option>
                <option value="₹75 Lakhs+ (Title Tier)">₹75 Lakhs+ (Title Tier)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-1.5">
              Brand Website / Portfolio URL (Optional)
            </label>
            <input
              type="url"
              value={formData.brandWebsite}
              onChange={(e) => setFormData({ ...formData, brandWebsite: e.target.value })}
              placeholder="https://yourbrand.com"
              className="w-full px-4 py-3 rounded-lg bg-black/50 border border-white/15 text-white placeholder-neutral-500 text-sm focus:border-[#cca043] focus:ring-1 focus:ring-[#cca043] outline-none transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-1.5">
              Specific Deliverables or Activation Ideas (Optional)
            </label>
            <textarea
              rows={3}
              value={formData.proposalDeliverables}
              onChange={(e) => setFormData({ ...formData, proposalDeliverables: e.target.value })}
              placeholder="Describe your brand activation goals (e.g. Sampling at finish line, branding on bibs, experiential recovery booth)."
              className="w-full px-4 py-3 rounded-lg bg-black/50 border border-white/15 text-white placeholder-neutral-500 text-sm focus:border-[#cca043] focus:ring-1 focus:ring-[#cca043] outline-none transition"
            />
          </div>
        </div>
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3.5 px-6 rounded-full bg-gradient-to-r from-[#e51b24] via-[#dc2626] to-[#b91c1c] text-white font-extrabold text-xs uppercase tracking-widest shadow-xl shadow-red-950/40 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
        >
          {isSubmitting ? (
            <>
              <FaSpinner className="animate-spin text-sm" />
              <span>Transmitting Sponsorship Proposal...</span>
            </>
          ) : (
            <>
              <span>Submit Commercial Sponsorship Proposal</span>
              <FaArrowRight className="text-xs" />
            </>
          )}
        </button>
      </div>
    </form>
  );
}

