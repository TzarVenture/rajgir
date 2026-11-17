"use client";

import { Suspense, useActionState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { signUp, type FormState } from "@/app/actions/auth";
import PasswordField from "@/components/auth/PasswordField";
import SubmitButton from "@/components/auth/SubmitButton";
import { AuthHeading, Field, FormError, StepIndicator, cardClass, linkClass } from "@/components/auth/ui";

function RegisterFormInner({ withVerification }: { withVerification: boolean }) {
  const params = useSearchParams();
  const redirectTo = params.get("redirect") || params.get("redirectTo") || "";
  const [state, action] = useActionState<FormState, FormData>(signUp, undefined);
  const errors = state?.fieldErrors ?? {};
  const query = redirectTo ? `?redirect=${encodeURIComponent(redirectTo)}` : "";

  return (
    <div className={cardClass}>
      <StepIndicator current="account" withVerification={withVerification} />
      <AuthHeading title="Create your account" subtitle="One account for everything you do at the Rajgir Marathon." />

      <form action={action} className="space-y-4">
        <input type="hidden" name="redirect" value={redirectTo} />

        <Field label="Full name" name="name" autoComplete="name" placeholder="e.g. Rahul Verma" defaultValue={state?.values?.name} error={errors.name} autoFocus />
        <Field
          label="Email address"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          defaultValue={state?.values?.email}
          error={errors.email}
          hint={withVerification ? "We will send a verification link here." : undefined}
        />
        <Field label="Mobile number" name="mobile" type="tel" inputMode="tel" autoComplete="tel" placeholder="10-digit mobile number" defaultValue={state?.values?.mobile} error={errors.mobile} />
        <PasswordField label="Password" name="password" autoComplete="new-password" placeholder="At least 8 characters" error={errors.password} hint="Use at least 8 characters." />
        <PasswordField label="Confirm password" name="confirm" autoComplete="new-password" placeholder="Repeat your password" error={errors.confirm} />

        <FormError message={state?.error} />

        <SubmitButton label="Create account" pendingLabel="Creating your account..." />

        <p className="text-center text-[11px] leading-relaxed text-[#6B7280]">
          By creating an account you agree to receive race updates by email and SMS.
        </p>
      </form>

      <div className="mt-6 border-t border-[#E5E7EB] pt-5 text-center">
        <p className="text-sm text-[#4B5563]">
          Already have an account?{" "}
          <Link href={`/login${query}`} className={linkClass}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function RegisterForm({ withVerification }: { withVerification: boolean }) {
  return (
    <Suspense fallback={<div className="py-10 text-center text-xs text-neutral-400">Loading...</div>}>
      <RegisterFormInner withVerification={withVerification} />
    </Suspense>
  );
}
