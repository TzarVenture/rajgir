"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { AppUser } from "@/lib/auth/session";
import { submitTourismRegistration } from "@/app/actions/registerGroup";
import {
  FaHotel,
  FaArrowRight,
  FaShieldAlt,
  FaLock,
  FaSpinner,
  FaTag,
} from "react-icons/fa";

interface TourismRegisterFormProps {
  user: AppUser;
}

export default function TourismRegisterForm({ user }: TourismRegisterFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    businessName: "",
    serviceType: "Hotel / Resort",
    location: "",
    distanceFromStartLine: "Under 2 KM",
    inventoryCapacity: "30 Deluxe Rooms",
    discountOffering: "15% Discount on accommodation + 5:00 AM runner breakfast",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.businessName.trim()) {
      setError("Please provide your hotel, resort, or tourism business name.");
      return;
    }
    if (!formData.location.trim()) {
      setError("Please provide the address or landmark in Rajgir.");
      return;
    }
    if (!formData.inventoryCapacity.trim()) {
      setError("Please specify your inventory or passenger capacity.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await submitTourismRegistration({
        userId: user.id,
        businessName: formData.businessName.trim(),
        serviceType: formData.serviceType.trim(),
        location: formData.location.trim(),
        distanceFromStartLine: formData.distanceFromStartLine.trim() || undefined,
        inventoryCapacity: formData.inventoryCapacity.trim(),
        discountOffering: formData.discountOffering.trim() || undefined,
      });

      if (!res.success) {
        throw new Error(res.error || "Failed to submit tourism partnership application.");
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

      {/* Tourism Partner Identity (Pre-filled & Locked) */}
      <div className="p-5 rounded-xl bg-[#0f0c09] border border-white/10 space-y-3">
        <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
          <div className="flex items-center gap-2">
            <FaShieldAlt className="text-[#cca043] text-sm" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Hospitality Partner Identity (Verified)
            </h3>
          </div>
          <span className="text-[10px] text-neutral-400 flex items-center gap-1">
            <FaLock className="text-[9px]" /> Account Bound
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div>
            <p className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">Manager / Host</p>
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

      {/* Hospitality & Tourism Details */}
      <div className="p-6 rounded-xl bg-[#0f0c09] border border-white/10 space-y-4">
        <div className="flex items-center gap-2 border-b border-white/5 pb-2.5">
          <FaHotel className="text-[#cca043] text-sm" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-white">
            Hospitality &amp; Service Listing
          </h3>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-1.5">
                Hotel / Business Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                placeholder="e.g. Rajgir Residency / Nalanda Heritage Resort"
                className="w-full px-4 py-3 rounded-lg bg-black/50 border border-white/15 text-white placeholder-neutral-500 text-sm focus:border-[#cca043] focus:ring-1 focus:ring-[#cca043] outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-1.5">
                Hospitality / Service Type <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.serviceType}
                onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-[#0d0a07] border border-white/15 text-white text-sm focus:border-[#cca043] focus:ring-1 focus:ring-[#cca043] outline-none transition"
              >
                <option value="Hotel / Resort">Hotel / Star Resort</option>
                <option value="Homestay / Guest House">Heritage Homestay / Guest House</option>
                <option value="Transport & Shuttle Fleet">Travel Fleet & Marathon Shuttles</option>
                <option value="Heritage Guided Tours">Vishwa Shanti Stupa & Nalanda Tour Guide</option>
                <option value="Kund Wellness & Thermal Spa">Hot Springs / Kund Wellness Spa</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-1.5">
                Location in Rajgir <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g. Near Brahmakund / Kund Market Road, Rajgir"
                className="w-full px-4 py-3 rounded-lg bg-black/50 border border-white/15 text-white placeholder-neutral-500 text-sm focus:border-[#cca043] focus:ring-1 focus:ring-[#cca043] outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-1.5">
                Distance to Start Line (Approx)
              </label>
              <input
                type="text"
                value={formData.distanceFromStartLine}
                onChange={(e) => setFormData({ ...formData, distanceFromStartLine: e.target.value })}
                placeholder="e.g. 1.2 KM / 5 mins walk"
                className="w-full px-4 py-3 rounded-lg bg-black/50 border border-white/15 text-white placeholder-neutral-500 text-sm focus:border-[#cca043] focus:ring-1 focus:ring-[#cca043] outline-none transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-1.5">
              Available Room / Vehicle Capacity <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.inventoryCapacity}
              onChange={(e) => setFormData({ ...formData, inventoryCapacity: e.target.value })}
              placeholder="e.g. 40 AC Deluxe Rooms, 8 Family Suites"
              className="w-full px-4 py-3 rounded-lg bg-black/50 border border-white/15 text-white placeholder-neutral-500 text-sm focus:border-[#cca043] focus:ring-1 focus:ring-[#cca043] outline-none transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-1.5">
              Special Discount / Offer for Registered Runners
            </label>
            <div className="relative">
              <input
                type="text"
                value={formData.discountOffering}
                onChange={(e) => setFormData({ ...formData, discountOffering: e.target.value })}
                placeholder="e.g. 15% discount for verified Bib holders + early 5 AM breakfast"
                className="w-full pl-10 pr-4 py-3 rounded-lg bg-black/50 border border-white/15 text-white placeholder-neutral-500 text-sm focus:border-[#cca043] focus:ring-1 focus:ring-[#cca043] outline-none transition"
              />
              <FaTag className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#cca043] text-xs pointer-events-none" />
            </div>
            <p className="text-[10px] text-neutral-400 mt-1">
              Offers will be featured on the official Rajgir Marathon runner guide and tourism portal.
            </p>
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
              <span>Submitting Listing...</span>
            </>
          ) : (
            <>
              <span>Apply for Official Tourism Partnership</span>
              <FaArrowRight className="text-xs" />
            </>
          )}
        </button>
      </div>
    </form>
  );
}

