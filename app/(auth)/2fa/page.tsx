"use client";

import { useActionState } from "react";
import { verifyTwoFactor, type FormState } from "@/app/actions/auth";
import SubmitButton from "@/components/auth/SubmitButton";
import { Field, FormError, cardClass, AuthHeading } from "@/components/auth/ui";

export default function TwoFactorPage() {
  const [state, action] = useActionState<FormState, FormData>(verifyTwoFactor, undefined);

  return (
    <div className={cardClass}>
      <AuthHeading title="Two-step check" subtitle="Staff accounts need a second code to log in" />

      <form action={action} className="space-y-4">
        <Field label="Authentication code" name="code" inputMode="numeric" maxLength={6} placeholder="6-digit code" autoComplete="one-time-code" />
        <FormError message={state?.error} />
        <SubmitButton label="Confirm" pendingLabel="Checking..." />
      </form>

      <p className="mt-6 text-center text-xs text-white/50">
        Demo build: the code is <span className="font-semibold text-[#cca043]">123456</span>.
      </p>
    </div>
  );
}
