"use client";

import React, { useState } from "react";
import { LuArrowRight, LuAward, LuCircleCheck, LuClock, LuFileCheck, LuShieldCheck, LuShirt, LuTag, LuX } from "react-icons/lu";
import { Button, Card, TextInput } from "@/components/ui";
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

  const selectedAddonsList = availableAddons.filter((a) => selectedAddonIds.includes(a.id));

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

  const couponIsError = couponMsg === "Invalid coupon code.";

  return (
    <Card className="text-left">
      <div className="mb-4 flex items-start justify-between gap-3 border-b border-charcoal-200 pb-4">
        <div>
          <p className="text-xs font-semibold text-charcoal-500">Order summary</p>
          <h3 className="mt-0.5 text-base font-bold text-charcoal-900">{categoryTitle}</h3>
        </div>
        <span className="font-barlow text-3xl font-bold leading-none text-charcoal-900">{distance}</span>
      </div>

      {/* Pricing breakdown */}
      <div className="space-y-2.5 text-sm">
        <div className="flex items-center justify-between text-charcoal-700">
          <span>Base registration ({distance})</span>
          <span className="font-semibold text-charcoal-900">₹{baseFee.toLocaleString()}</span>
        </div>

        {selectedAddonsList.map((addon) => (
          <div key={addon.id} className="flex items-center justify-between gap-3 rounded-btn bg-surface-soft px-3 py-2 text-charcoal-700">
            <div className="flex min-w-0 items-center gap-2">
              <span className="truncate">{addon.title}</span>
              {onRemoveAddon && (
                <button
                  type="button"
                  onClick={() => onRemoveAddon(addon.id)}
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-btn text-charcoal-500 hover:bg-charcoal-100 hover:text-charcoal-900"
                  title="Remove add-on"
                  aria-label={`Remove add-on ${addon.title}`}
                >
                  <LuX className="h-4 w-4" aria-hidden />
                </button>
              )}
            </div>
            <span className="shrink-0 font-semibold text-charcoal-900">+₹{addon.price.toLocaleString()}</span>
          </div>
        ))}

        {discountAmount > 0 && (
          <div className="flex items-center justify-between rounded-btn bg-[#DCFCE7] px-3 py-2 font-semibold text-[#15803D]">
            <span className="flex items-center gap-1.5">
              <LuTag className="h-4 w-4" aria-hidden />
              <span>Coupon ({couponCode})</span>
            </span>
            <span>-₹{discountAmount.toLocaleString()}</span>
          </div>
        )}

        <div className="flex items-baseline justify-between border-t border-charcoal-200 pt-3">
          <div>
            <span className="block text-sm font-bold text-charcoal-900">Total payable</span>
            <span className="text-xs text-charcoal-500">Includes all taxes and timing chip</span>
          </div>
          <div className="font-barlow text-[32px] font-bold leading-none text-charcoal-900">₹{netTotal.toLocaleString()}</div>
        </div>
      </div>

      {/* Coupon */}
      <div className="mt-5 border-t border-charcoal-200 pt-4">
        {couponCode ? (
          <div className="flex items-center justify-between gap-3 rounded-btn border border-[#86EFAC] bg-[#DCFCE7] px-3 py-2 text-sm text-[#14532D]">
            <span className="flex items-center gap-1.5 font-semibold">
              <LuCircleCheck className="h-4 w-4" aria-hidden />
              <span>Applied: {couponCode}</span>
            </span>
            <button
              type="button"
              onClick={() => {
                onRemoveCoupon();
                setCouponInput("");
                setCouponMsg("");
              }}
              className="min-h-[36px] cursor-pointer text-sm font-semibold underline"
            >
              Remove
            </button>
          </div>
        ) : (
          <form onSubmit={handleApply}>
            <label htmlFor="coupon-code" className="mb-1.5 block text-sm font-semibold text-charcoal-800">
              Coupon code
            </label>
            <div className="flex gap-2">
              <TextInput
                id="coupon-code"
                type="text"
                placeholder="e.g. RAJGIR100"
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value)}
                className="h-11 flex-1 uppercase placeholder:normal-case"
              />
              <Button type="submit" variant="secondary" size="md" className="shrink-0">
                Apply
              </Button>
            </div>
          </form>
        )}

        {couponMsg && (
          <p role="status" className={`mt-1.5 text-xs font-medium ${couponIsError ? "text-[#DC2626]" : "text-charcoal-600"}`}>
            {couponMsg}
          </p>
        )}
      </div>

      {/* Inclusions */}
      <div className="mt-5 border-t border-charcoal-200 pt-4">
        <p className="mb-2.5 text-sm font-bold text-charcoal-900">Every registration includes</p>
        <ul className="grid grid-cols-2 gap-2 text-sm text-charcoal-700">
          <li className="flex items-center gap-2">
            <LuClock className="h-4 w-4 shrink-0 text-brand-red" aria-hidden />
            <span>RFID bib chip</span>
          </li>
          <li className="flex items-center gap-2">
            <LuShirt className="h-4 w-4 shrink-0 text-brand-red" aria-hidden />
            <span>Dry-fit jersey</span>
          </li>
          <li className="flex items-center gap-2">
            <LuAward className="h-4 w-4 shrink-0 text-brand-red" aria-hidden />
            <span>Finisher medal</span>
          </li>
          <li className="flex items-center gap-2">
            <LuFileCheck className="h-4 w-4 shrink-0 text-brand-red" aria-hidden />
            <span>E-certificate</span>
          </li>
        </ul>
      </div>

      {/* CTA */}
      <div className="mt-5 border-t border-charcoal-200 pt-4">
        <Button
          type="button"
          size="lg"
          fullWidth
          onClick={onNextStep}
          disabled={!canProceed || isSubmitting}
          iconRight={currentStep < totalSteps ? LuArrowRight : LuCircleCheck}
        >
          {isSubmitting ? "Confirming registration" : currentStep < totalSteps ? "Continue to next step" : "Complete registration"}
        </Button>

        <p className="mt-3 flex items-center justify-center gap-2 text-xs text-charcoal-500">
          <LuShieldCheck className="h-4 w-4 text-[#15803D]" aria-hidden />
          <span>Secure, encrypted registration</span>
        </p>
      </div>
    </Card>
  );
}
