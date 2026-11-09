"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signUp, type FormState } from "@/app/actions/auth";
import SubmitButton from "@/components/auth/SubmitButton";
import { Field, FormError, cardClass, AuthHeading } from "@/components/auth/ui";

export default function RegisterForm() {
  const [state, action] = useActionState<FormState, FormData>(signUp, undefined);

  return (
    <div className={cardClass}>
      <AuthHeading title="Create account" subtitle="Step 1 of 3: your login details" />

      <form action={action} className="space-y-4">
        <Field label="Full name" name="name" autoComplete="name" />
        <Field label="Email" name="email" type="email" autoComplete="email" />
        <Field label="Mobile number" name="mobile" type="tel" inputMode="tel" autoComplete="tel" placeholder="10-digit number" />
        <Field label="Password" name="password" type="password" autoComplete="new-password" placeholder="At least 8 characters" />
        <Field label="Confirm password" name="confirm" type="password" autoComplete="new-password" />
        <FormError message={state?.error} />
        <SubmitButton label="Continue" pendingLabel="Creating account..." />
      </form>

      <p className="mt-6 text-center text-sm text-white/70">
        Already registered?{" "}
        <Link href="/login" className="font-semibold text-[#cca043] hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
