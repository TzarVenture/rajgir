"use client";

import React, { useState } from "react";
import {
  FaShieldAlt,
  FaCheckCircle,
  FaTag,
  FaArrowRight,
  FaTimes,
  FaMedal,
  FaTshirt,
  FaClock,
} from "react-icons/fa";
import { availableAddons } from "@/lib/schemas/runnerRegistration";

interface OrderSummaryCardProps {
  categoryTitle: string;
  distance: string;
  baseFee: number;
  selectedAddonIds: string[];
  onRemoveAddon?: (addonId: string) => void;
  couponCode: string;
  onApplyCoupon: (code: string) => void;
  onRemoveCoupon: () => void;
  discountAmount: number;
  currentStep: number;
  totalSteps: number;
  onNextStep: () => void;
  isSubmitting: boolean;
  canProceed: boolean;
}

export default function OrderSummaryCard({
  categoryTitle,
  distance,
  baseFee,
  selectedAddonIds,
  onRemoveAddon,
  couponCode,
  onApplyCoupon,
  onRemoveCoupon,
  discountAmount,
  currentStep,
  totalSteps,
  onNextStep,
  isSubmitting,
  canProceed,
}: OrderSummaryCardProps) {
  const [couponInput, setCouponInput] = useState("");
  const [couponMsg, setCouponMsg] = useState("");

  const selectedAddonsList = availableAddons.filter((a) =>
    selectedAddonIds.includes(a.id)
  );

  const addonsTotal = selectedAddonsList.reduce((acc, curr) => acc + curr.price, 0);
  const grossTotal = baseFee + addonsTotal;
  const netTotal = Math.max(0, grossTotal - discountAmount);

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = couponInput.trim().toUpperCase();
    if (!clean) return;

    if (clean === "RAJGIR100" || clean === "EARLYBIRD") {
      onApplyCoupon(clean);
      setCouponMsg(clean === "RAJGIR100" ? "10% Discount Applied!" : "₹200 Early Bird Applied!");
    } else {
      setCouponMsg("Invalid coupon code.");
    }
  };

  return (
    <div className="w-full rounded-2xl border border-[#cca043]/35 bg-[#0e0b08] p-5 sm:p-6 text-left relative flex flex-col justify-between">
      {/* Top Banner */}
      <div>
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-[#cca043] block">
              ORDER SUMMARY
            </span>
            <h3 className="text-base font-black uppercase text-white font-graduate">
              {categoryTitle}
            </h3>
          </div>
          <span className="text-xs font-mono font-bold bg-[#cca043]/20 border border-[#cca043]/40 text-[#cca043] px-2.5 py-1 rounded-full">
            {distance}
          </span>
        </div>

        {/* Pricing Breakdown */}
        <div className="space-y-2.5 text-xs">
          <div className="flex justify-between items-center text-neutral-300">
            <span>Base Registration ({distance})</span>
            <span className="font-mono font-bold text-white">₹{baseFee.toLocaleString()}</span>
          </div>

          {/* Add-ons list */}
          {selectedAddonsList.map((addon) => (
            <div
              key={addon.id}
              className="flex justify-between items-center text-neutral-300 bg-white/5 px-2.5 py-1.5 rounded-lg"
            >
              <div className="flex items-center gap-2 truncate pr-2">
                <span className="truncate">{addon.title}</span>
                {onRemoveAddon && (
                  <button
                    type="button"
                    onClick={() => onRemoveAddon(addon.id)}
                    className="text-neutral-500 hover:text-red-400 text-xs shrink-0"
                    title="Remove add-on"
                  >
                    <FaTimes />
                  </button>
                )}
              </div>
              <span className="font-mono font-bold text-white shrink-0">
                +₹{addon.price.toLocaleString()}
              </span>
            </div>
          ))}

          {/* Discount if present */}
          {discountAmount > 0 && (
            <div className="flex justify-between items-center text-emerald-400 bg-emerald-500/10 px-2.5 py-1.5 rounded-lg font-bold">
              <span className="flex items-center gap-1.5">
                <FaTag className="text-[10px]" />
                <span>Coupon ({couponCode})</span>
              </span>
              <span className="font-mono">-₹{discountAmount.toLocaleString()}</span>
            </div>
          )}

          <div className="border-t border-white/10 pt-3 flex justify-between items-baseline">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 block">
                Total Payable
              </span>
              <span className="text-[10px] text-neutral-500">Includes all taxes & timing chip</span>
            </div>
            <div className="font-graduate text-2xl font-black text-[#cca043]">
              ₹{netTotal.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Coupon Code Input */}
        <div className="mt-5 pt-4 border-t border-white/10">
          {couponCode ? (
            <div className="flex items-center justify-between p-2 rounded-lg bg-[#cca043]/15 border border-[#cca043]/30 text-xs text-[#cca043]">
              <span className="font-bold flex items-center gap-1.5">
                <FaCheckCircle className="text-emerald-400" />
                <span>Applied: {couponCode}</span>
              </span>
              <button
                type="button"
                onClick={() => {
                  onRemoveCoupon();
                  setCouponInput("");
                  setCouponMsg("");
                }}
                className="text-neutral-400 hover:text-white text-xs underline cursor-pointer"
              >
                Remove
              </button>
            </div>
          ) : (
            <form onSubmit={handleApply} className="flex gap-2">
              <input
                type="text"
                placeholder="Coupon code (e.g. RAJGIR100)"
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value)}
                className="flex-1 bg-white/5 border border-white/15 focus:border-[#cca043] rounded-lg px-3 py-1.5 text-xs text-white uppercase placeholder:normal-case placeholder:text-neutral-500 outline-none"
              />
              <button
                type="submit"
                className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs uppercase tracking-wider transition-colors shrink-0 cursor-pointer"
              >
                Apply
              </button>
            </form>
          )}

          {couponMsg && (
            <p className="text-[10.5px] mt-1 text-neutral-400">{couponMsg}</p>
          )}
        </div>

        {/* Included Race Inclusions Checklist */}
        <div className="mt-6 pt-4 border-t border-white/10 space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-2">
            Every Registration Includes:
          </span>
          <div className="grid grid-cols-2 gap-2 text-[11px] text-neutral-300">
            <span className="flex items-center gap-1.5">
              <FaClock className="text-[#cca043] shrink-0 text-[10px]" />
              <span>RFID Bib Chip</span>
            </span>
            <span className="flex items-center gap-1.5">
              <FaTshirt className="text-[#cca043] shrink-0 text-[10px]" />
              <span>Dry-Fit Jersey</span>
            </span>
            <span className="flex items-center gap-1.5">
              <FaMedal className="text-[#cca043] shrink-0 text-[10px]" />
              <span>Finishers Medal</span>
            </span>
            <span className="flex items-center gap-1.5">
              <FaCheckCircle className="text-[#cca043] shrink-0 text-[10px]" />
              <span>E-Certificate</span>
            </span>
          </div>
        </div>
      </div>

      {/* Action CTA */}
      <div className="mt-6 pt-4 border-t border-white/10">
        <button
          type="button"
          onClick={onNextStep}
          disabled={!canProceed || isSubmitting}
          className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#d49a37] via-[#e0a845] to-[#cca043] text-black font-extrabold text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:brightness-105 active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <span>CONFIRMING REGISTRATION...</span>
          ) : currentStep < totalSteps ? (
            <>
              <span>CONTINUE TO NEXT STEP</span>
              <FaArrowRight className="text-xs" />
            </>
          ) : (
            <>
              <span>COMPLETE REGISTRATION</span>
              <FaCheckCircle className="text-sm" />
            </>
          )}
        </button>

        <div className="flex items-center justify-center gap-2 text-[10px] text-neutral-400 mt-3">
          <FaShieldAlt className="text-emerald-400 text-xs" />
          <span>256-Bit SSL Encrypted • Supabase Verified</span>
        </div>
      </div>
    </div>
  );
}

