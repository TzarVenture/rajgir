"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { AppUser } from "@/lib/auth/session";
import { submitVendorRegistration } from "@/app/actions/registerGroup";
import {
  FaStore,
  FaArrowRight,
  FaShieldAlt,
  FaLock,
  FaSpinner,
  FaBolt,
} from "react-icons/fa";

interface VendorRegisterFormProps {
  user: AppUser;
}

export default function VendorRegisterForm({ user }: VendorRegisterFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    businessName: "",
    stallCategory: "Running Apparel & Shoes",
    stallSize: "Standard Expo Stall (3x3m)",
    fssaiNumber: "",
    electricPowerRequired: true,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.businessName.trim()) {
      setError("Please provide your business or trade name.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await submitVendorRegistration({
        userId: user.id,
        businessName: formData.businessName.trim(),
        stallCategory: formData.stallCategory.trim(),
        stallSize: formData.stallSize.trim(),
        fssaiNumber: formData.fssaiNumber.trim() || undefined,
        electricPowerRequired: formData.electricPowerRequired,
      });

      if (!res.success) {
        throw new Error(res.error || "Failed to submit vendor application.");
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

      {/* Vendor Proprietor Identity (Pre-filled & Locked) */}
      <div className="p-5 rounded-xl bg-[#0f0c09] border border-white/10 space-y-3">
        <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
          <div className="flex items-center gap-2">
            <FaShieldAlt className="text-[#cca043] text-sm" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Vendor Proprietor Identity (Verified)
            </h3>
          </div>
          <span className="text-[10px] text-neutral-400 flex items-center gap-1">
            <FaLock className="text-[9px]" /> Account Bound
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div>
            <p className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">Proprietor</p>
            <p className="text-sm font-semibold text-white">{user.name}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">Email</p>
            <p className="text-sm font-semibold text-neutral-300 truncate">{user.email}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">Contact Phone</p>
            <p className="text-sm font-semibold text-neutral-300">{user.phone || "—"}</p>
          </div>
        </div>
      </div>

      {/* Expo Stall Details */}
      <div className="p-6 rounded-xl bg-[#0f0c09] border border-white/10 space-y-4">
        <div className="flex items-center gap-2 border-b border-white/5 pb-2.5">
          <FaStore className="text-[#cca043] text-sm" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-white">
            Expo Stall Allotment Preferences
          </h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-1.5">
              Business / Store / Brand Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.businessName}
              onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
              placeholder="e.g. Magadh Sports Wear & Nutrition"
              className="w-full px-4 py-3 rounded-lg bg-black/50 border border-white/15 text-white placeholder-neutral-500 text-sm focus:border-[#cca043] focus:ring-1 focus:ring-[#cca043] outline-none transition"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-1.5">
                Stall / Merchandise Category <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.stallCategory}
                onChange={(e) => setFormData({ ...formData, stallCategory: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-[#0d0a07] border border-white/15 text-white text-sm focus:border-[#cca043] focus:ring-1 focus:ring-[#cca043] outline-none transition"
              >
                <option value="Running Apparel & Shoes">Running Apparel & Footwear</option>
                <option value="Sports Nutrition & Energy">Sports Nutrition, Hydration & Bars</option>
                <option value="Healthy Food & Refreshments">Healthy Food, Salads & Drinks</option>
                <option value="Sports Tech & Wearables">Sports Tech, GPS Watches & Audio</option>
                <option value="Bihar Handicrafts & Souvenirs">Local Heritage, Silk & Handicrafts</option>
                <option value="Physiotherapy & Recovery">Physiotherapy, Massage & Taping</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-1.5">
                Stall Footprint Size <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.stallSize}
                onChange={(e) => setFormData({ ...formData, stallSize: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-[#0d0a07] border border-white/15 text-white text-sm focus:border-[#cca043] focus:ring-1 focus:ring-[#cca043] outline-none transition"
              >
                <option value="Standard Expo Stall (3x3m)">Standard Expo Stall (3m x 3m)</option>
                <option value="Double Premium Stall (6x3m)">Double Premium Stall (6m x 3m)</option>
                <option value="Outdoor Food Kiosk Space">Outdoor Food Kiosk / Truck Bay</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-1.5">
              FSSAI Registration / Food License No. (If serving food or supplements)
            </label>
            <input
              type="text"
              value={formData.fssaiNumber}
              onChange={(e) => setFormData({ ...formData, fssaiNumber: e.target.value })}
              placeholder="e.g. 10014022002727"
              className="w-full px-4 py-3 rounded-lg bg-black/50 border border-white/15 text-white placeholder-neutral-500 text-sm focus:border-[#cca043] focus:ring-1 focus:ring-[#cca043] outline-none transition"
            />
          </div>

          <div className="p-4 rounded-xl bg-orange-950/20 border border-orange-800/40">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.electricPowerRequired}
                onChange={(e) => setFormData({ ...formData, electricPowerRequired: e.target.checked })}
                className="h-4 w-4 rounded border-gray-600 text-[#cca043] focus:ring-[#cca043]"
              />
              <span className="text-xs text-neutral-200 flex items-center gap-2">
                <FaBolt className="text-[#cca043]" /> Dedicated 15A Electrical Power Connection Required at Stall
              </span>
            </label>
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
              <span>Submitting Application...</span>
            </>
          ) : (
            <>
              <span>Apply for Marathon Expo Stall</span>
              <FaArrowRight className="text-xs" />
            </>
          )}
        </button>
      </div>
    </form>
  );
}

