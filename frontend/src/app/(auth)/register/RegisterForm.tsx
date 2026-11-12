"use client";

import { useActionState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { signUp, type FormState } from "@/app/actions/auth";
import SubmitButton from "@/components/auth/SubmitButton";
import { Field, FormError, cardClass, AuthHeading } from "@/components/auth/ui";

function RegisterFormInner() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "";

  const [state, action] = useActionState<FormState, FormData>(signUp, undefined);

  return (
    <div className={cardClass}>
      {redirectTo ? (
        <div className="mb-4 p-2.5 rounded-lg bg-[#cca043]/15 border border-[#cca043]/30 text-center">
          <p className="text-xs text-[#d49a37] font-semibold tracking-wide">
            Create an account to complete your registration
          </p>
        </div>
      ) : null}
      <AuthHeading
        title="Create Account"
        subtitle="One unified account for all Rajgir Marathon roles"
      />

      <form action={action} className="space-y-4">
        <input type="hidden" name="redirectTo" value={redirectTo} />

        <Field
          label="Full Name"
          name="name"
          autoComplete="name"
          placeholder="e.g. Rahul Verma"
        />

        <Field
          label="Email Address"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
        />

        <Field
          label="Mobile Number (10 Digits)"
          name="mobile"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="10-digit mobile number"
        />

        <Field
          label="Password (min. 8 characters)"
          name="password"
          type="password"
          autoComplete="new-password"
          placeholder="At least 8 characters"
        />

        <Field
          label="Confirm Password"
          name="confirm"
          type="password"
          autoComplete="new-password"
          placeholder="Repeat password"
        />

        <FormError message={state?.error} />

        <SubmitButton label="Continue to Role Selection" pendingLabel="Creating your account..." />
      </form>

      <div className="mt-6 pt-5 border-t border-white/10 text-center space-y-2">
        <p className="text-sm text-neutral-300">
          Already have an account?{" "}
          <Link
            href={redirectTo ? `/login?redirect=${encodeURIComponent(redirectTo)}` : "/login"}
            className="font-bold text-[#cca043] hover:underline"
          >
            Sign in
          </Link>
        </p>

        <p className="text-[11px] text-neutral-500">
          Strict policy: 1 User = 1 Permanent Role per email/mobile.
        </p>
      </div>
    </div>
  );
}

export default function RegisterForm() {
  return (
    <Suspense fallback={<div className="text-neutral-400 text-xs text-center py-10">Loading registration...</div>}>
      <RegisterFormInner />
    </Suspense>
  );
}
