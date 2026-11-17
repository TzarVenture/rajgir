import React, { Suspense } from "react";
import type { Metadata } from "next";
import { LuMapPin } from "react-icons/lu";
import RegistrationPageShell from "@/components/registration/RegistrationPageShell";
import { Badge } from "@/components/ui";
import { guardRegistration } from "@/lib/auth/registrationGate";
import RunnerRegistrationWizard from "./RunnerRegistrationWizard";

export const metadata: Metadata = {
  title: "Runner Registration | Rajgir Marathon 2027",
  description:
    "Official runner registration portal for the Rajgir Marathon 2027. Choose your distance: Full Marathon (42.2K), Half Marathon (21.1K), 10K Hill Challenge, or 5K Dream Run.",
};

export default async function RunnerRegisterPage() {
  const { user, notice } = await guardRegistration("RUNNER");
  if (notice) return notice;

  return (
    <RegistrationPageShell
      width="wide"
      crumb="Runner"
      title="Runner registration"
      subtitle="Secure your spot in India's premier heritage marathon. Complete the official registration below to receive your personalized RFID race bib."
      eyebrow={
        <Badge tone="heritage">
          <LuMapPin className="h-3 w-3" aria-hidden /> Rajgir, Bihar | November 2027
        </Badge>
      }
    >
      <Suspense fallback={<div className="mx-auto max-w-md py-20 text-center text-sm text-charcoal-500">Loading registration form...</div>}>
        <RunnerRegistrationWizard user={user} />
      </Suspense>
    </RegistrationPageShell>
  );
}
