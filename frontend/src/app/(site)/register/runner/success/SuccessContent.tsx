"use client";

import React from "react";
import Link from "next/link";
import { LuArrowRight, LuCircleCheck, LuPrinter, LuShieldCheck } from "react-icons/lu";
import { Badge, Button, Card, LinkButton } from "@/components/ui";

interface SuccessContentProps {
  registration: {
    registration_number: string;
    distance: string;
    race_title: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    bib_name: string;
    blood_group: string;
    tshirt_size: string;
    net_amount: number;
    city: string;
    state: string;
    qr_code_token: string;
    created_at: string;
  };
}

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-semibold text-charcoal-500">{label}</dt>
      <dd className="mt-0.5 text-sm font-bold text-charcoal-900">{children}</dd>
    </div>
  );
}

export default function SuccessContent({ registration }: SuccessContentProps) {
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
    `RAJGIR-MARATHON:${registration.registration_number}:${registration.qr_code_token}`
  )}`;

  return (
    <div className="mx-auto w-full max-w-3xl">
      {/* Confirmation header */}
      <div className="mb-8 text-center">
        <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#DCFCE7] text-[#15803D]">
          <LuCircleCheck className="h-8 w-8" aria-hidden />
        </span>
        <p className="text-sm font-semibold text-[#15803D]">Official confirmation</p>
        <h1 className="mt-1 font-barlow text-[36px] font-bold uppercase leading-none text-charcoal-900 sm:text-[44px]">
          Registration confirmed
        </h1>
        <p className="mx-auto mt-3 max-w-lg text-[15px] leading-relaxed text-charcoal-600">
          Congratulations, <strong className="text-charcoal-900">{registration.first_name}</strong>! Your registration for the{" "}
          <strong className="text-charcoal-900">
            {registration.distance} {registration.race_title}
          </strong>{" "}
          has been secured in the official race system.
        </p>
      </div>

      {/* Digital runner pass */}
      <Card padded={false} className="overflow-hidden">
        <div id="printable-pass" className="bg-white">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b-4 border-brand-red px-5 py-4 sm:px-8">
            <div className="flex items-center gap-3">
              <img src="/images/mainLogo.png" alt="Rajgir Marathon" className="h-10 w-auto object-contain sm:h-12" />
              <div>
                <span className="block font-barlow text-lg font-bold uppercase tracking-wide text-charcoal-900">Rajgir Marathon 2027</span>
                <span className="text-xs font-semibold text-charcoal-500">Official digital runner pass</span>
              </div>
            </div>

            <div className="text-right">
              <span className="block text-xs font-semibold text-charcoal-500">Registration no.</span>
              <span className="font-barlow text-xl font-bold text-brand-red">{registration.registration_number}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 items-center gap-6 px-5 py-6 sm:grid-cols-12 sm:px-8">
            <dl className="space-y-4 sm:col-span-8">
              <div className="grid grid-cols-2 gap-4">
                <Detail label="Runner name">
                  {registration.first_name} {registration.last_name}
                </Detail>
                <Detail label="Race category">
                  <span className="font-barlow text-2xl leading-none">{registration.distance}</span>
                </Detail>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-charcoal-200 pt-4">
                <Detail label="Name on bib">
                  <span className="inline-block rounded-[6px] bg-surface-soft px-2 py-0.5 font-mono uppercase">{registration.bib_name}</span>
                </Detail>
                <Detail label="Blood group and jersey">
                  {registration.blood_group} | Size {registration.tshirt_size}
                </Detail>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-charcoal-200 pt-4">
                <Detail label="Venue and date">Rajgir, Bihar | Nov 2027</Detail>
                <Detail label="Fee paid and status">
                  <span className="flex flex-wrap items-center gap-2">
                    <span>₹{registration.net_amount.toLocaleString()}</span>
                    <Badge tone="success">Confirmed</Badge>
                  </span>
                </Detail>
              </div>
            </dl>

            <div className="flex flex-col items-center justify-center rounded-card border border-charcoal-200 bg-white p-3 text-center sm:col-span-4">
              <img src={qrUrl} alt="Registration QR code" className="h-32 w-32 object-contain" />
              <span className="mt-1 text-xs font-semibold text-charcoal-600">Scan at expo bib desk</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-charcoal-200 bg-surface-soft px-5 py-3 text-xs text-charcoal-500 sm:px-8">
            <span className="flex items-center gap-1.5">
              <LuShieldCheck className="h-4 w-4 text-[#15803D]" aria-hidden />
              Official pass verified by Rajgir Marathon Operations Board.
            </span>
            <span>Ref: {registration.qr_code_token.slice(0, 8)}</span>
          </div>
        </div>
      </Card>

      {/* Actions */}
      <div className="mt-8 space-y-4 text-center">
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button type="button" variant="secondary" size="lg" icon={LuPrinter} onClick={() => window.print()}>
            Print / save digital pass
          </Button>

          <LinkButton href="/register/runner" size="lg" iconRight={LuArrowRight}>
            Register another participant
          </LinkButton>
        </div>

        <div className="pt-2">
          <Link href="/" className="text-sm font-semibold text-brand-red hover:underline">
            Return to marathon homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
