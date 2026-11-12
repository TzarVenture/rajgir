"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { AppUser } from "@/lib/auth/session";
import { submitCorporateRegistration } from "@/app/actions/registerGroup";
import {
  FaBuilding,
  FaArrowRight,
  FaShieldAlt,
  FaLock,
  FaSpinner,
  FaFileInvoiceDollar,
} from "react-icons/fa";

interface CorporateRegisterFormProps {
  user: AppUser;
}

export default function CorporateRegisterForm({ user }: CorporateRegisterFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    companyName: "",
    gstin: "",
    officialEmailDomain: user.email.includes("@") ? user.email.split("@")[1] : "",
    designation: "",
    estimatedPasses: 25,
    csrFocus: "Employee Health & Wellness",
    billingAddress: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.companyName.trim()) {
      setError("Please provide your company or corporate entity name.");
      return;
    }
    if (!formData.designation.trim()) {
      setError("Please specify your professional designation (e.g. HR Director, CSR Lead).");
      return;
    }
    if (!formData.officialEmailDomain.trim()) {
      setError("Please enter your official corporate email domain.");
      return;
    }
    if (formData.estimatedPasses < 5) {
      setError("Corporate packages require a minimum delegation of 5 passes.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await submitCorporateRegistration({
        userId: user.id,
        companyName: formData.companyName.trim(),
        gstin: formData.gstin.trim() || undefined,
        officialEmailDomain: formData.officialEmailDomain.trim(),
        designation: formData.designation.trim(),
        estimatedPasses: Number(formData.estimatedPasses),
        csrFocus: formData.csrFocus.trim() || undefined,
        billingAddress: formData.billingAddress.trim() || undefined,
      });

      if (!res.success) {
        throw new Error(res.error || "Failed to submit corporate registration.");
      }

      // Vetted B2B track -> route to pending review confirmation
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

      {/* Authorized Representative Identity (Pre-filled & Locked) */}
      <div className="p-5 rounded-xl bg-[#0f0c09] border border-white/10 space-y-3">
        <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
          <div className="flex items-center gap-2">
            <FaShieldAlt className="text-[#cca043] text-sm" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Corporate Representative Identity (Verified)
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

      {/* Corporate Entity Details */}
      <div className="p-6 rounded-xl bg-[#0f0c09] border border-white/10 space-y-4">
        <div className="flex items-center gap-2 border-b border-white/5 pb-2.5">
          <FaBuilding className="text-[#cca043] text-sm" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-white">
            Company & Package Details
          </h3>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-1.5">
                Company / Organization Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                placeholder="e.g. Tata Steel / Infosys / NTPC"
                className="w-full px-4 py-3 rounded-lg bg-black/50 border border-white/15 text-white placeholder-neutral-500 text-sm focus:border-[#cca043] focus:ring-1 focus:ring-[#cca043] outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-1.5">
                Official Designation <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                placeholder="e.g. HR Director, CSR Lead"
                className="w-full px-4 py-3 rounded-lg bg-black/50 border border-white/15 text-white placeholder-neutral-500 text-sm focus:border-[#cca043] focus:ring-1 focus:ring-[#cca043] outline-none transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-1.5">
                Corporate Email Domain <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.officialEmailDomain}
                onChange={(e) => setFormData({ ...formData, officialEmailDomain: e.target.value })}
                placeholder="e.g. tatasteel.com"
                className="w-full px-4 py-3 rounded-lg bg-black/50 border border-white/15 text-white placeholder-neutral-500 text-sm focus:border-[#cca043] focus:ring-1 focus:ring-[#cca043] outline-none transition"
              />
              <p className="text-[10px] text-neutral-500 mt-1">
                Domain used to verify employee corporate passes.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-1.5">
                Estimated Delegation Passes (min 5) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min={5}
                max={2000}
                required
                value={formData.estimatedPasses}
                onChange={(e) => setFormData({ ...formData, estimatedPasses: parseInt(e.target.value) || 5 })}
                className="w-full px-4 py-3 rounded-lg bg-black/50 border border-white/15 text-white placeholder-neutral-500 text-sm focus:border-[#cca043] focus:ring-1 focus:ring-[#cca043] outline-none transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-1.5">
                GSTIN / Tax ID (Optional for GST Invoice)
              </label>
              <input
                type="text"
                value={formData.gstin}
                onChange={(e) => setFormData({ ...formData, gstin: e.target.value.toUpperCase() })}
                placeholder="e.g. 10AAACT2727Q1ZB"
                className="w-full px-4 py-3 rounded-lg bg-black/50 border border-white/15 text-white placeholder-neutral-500 text-sm focus:border-[#cca043] focus:ring-1 focus:ring-[#cca043] outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-1.5">
                CSR / Initiative Focus
              </label>
              <select
                value={formData.csrFocus}
                onChange={(e) => setFormData({ ...formData, csrFocus: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-[#0d0a07] border border-white/15 text-white text-sm focus:border-[#cca043] focus:ring-1 focus:ring-[#cca043] outline-none transition"
              >
                <option value="Employee Health & Wellness">Employee Health & Wellness</option>
                <option value="CSR Youth Fitness Support">CSR Youth Fitness Support</option>
                <option value="Brand Marathon Sponsorship">Brand Marathon Sponsorship</option>
                <option value="Environmental Awareness">Environmental Awareness</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-1.5">
              Official Billing Address (Optional)
            </label>
            <textarea
              rows={2}
              value={formData.billingAddress}
              onChange={(e) => setFormData({ ...formData, billingAddress: e.target.value })}
              placeholder="Full registered company address for B2B invoice generation"
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
              <span>Submitting B2B Application...</span>
            </>
          ) : (
            <>
              <span>Submit Corporate Delegation Proposal</span>
              <FaArrowRight className="text-xs" />
            </>
          )}
        </button>
      </div>
    </form>
  );
}

