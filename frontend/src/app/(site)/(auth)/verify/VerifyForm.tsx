"use client";

import { useActionState } from "react";
import { verifyOtp, type FormState } from "@/app/actions/auth";
import SubmitButton from "@/components/auth/SubmitButton";
import { Field, FormError, cardClass, AuthHeading } from "@/components/auth/ui";

export default function VerifyForm() {
  const [state, action] = useActionState<FormState, FormData>(verifyOtp, undefined);

  return (
    <div className={cardClass}>
      <AuthHeading title="Verify your account" subtitle="Step 2 of 3: enter the 6-digit code we sent you" />

      <form action={action} className="space-y-4">
        <Field label="Verification code" name="code" inputMode="numeric" maxLength={6} placeholder="6-digit code" autoComplete="one-time-code" />
        <FormError message={state?.error} />
        <SubmitButton label="Verify" pendingLabel="Verifying..." />
      </form>

      <p className="mt-6 text-center text-xs text-white/50">
        Demo build: the code is <span className="font-semibold text-[#cca043]">123456</span>. Real SMS and email codes come with the live integration.
      </p>
    </div>
  );
}
