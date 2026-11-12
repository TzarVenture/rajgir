"use client";

import { useActionState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { login, type FormState } from "@/app/actions/auth";
import SubmitButton from "@/components/auth/SubmitButton";
import { Field, FormError, cardClass, AuthHeading } from "@/components/auth/ui";
import { FaLock, FaEnvelope, FaUserPlus } from "react-icons/fa";

function LoginFormInner() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "";

  const [state, action] = useActionState<FormState, FormData>(login, undefined);

  return (
    <div className={cardClass}>
      {redirectTo ? (
        <div className="mb-4 p-2.5 rounded-lg bg-[#cca043]/15 border border-[#cca043]/30 text-center">
          <p className="text-xs text-[#d49a37] font-semibold tracking-wide">
            Sign in to continue to your registration
          </p>
        </div>
      ) : null}
      <AuthHeading
        title="Welcome Back"
        subtitle="Sign in with your registered email or 10-digit mobile"
      />

      <form action={action} className="space-y-4">
        <input type="hidden" name="redirectTo" value={redirectTo} />

        <Field
          label="Email or 10-Digit Mobile"
          name="identifier"
          autoComplete="username"
          placeholder="runner@example.com or 9876543210"
        />

        <Field
          label="Password"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="Enter your password"
        />

        <FormError message={state?.error} />

        <SubmitButton label="Sign In" pendingLabel="Authenticating..." />
      </form>

      <div className="mt-6 pt-5 border-t border-white/10 text-center space-y-2">
        <p className="text-sm text-neutral-300">
          New to Rajgir Marathon?{" "}
          <Link
            href={redirectTo ? `/register?redirect=${encodeURIComponent(redirectTo)}` : "/register"}
            className="font-bold text-[#cca043] hover:underline"
          >
            Create an account
          </Link>
        </p>

        <p className="text-[11px] text-neutral-500">
          One account per person or organization. Single permanent role enforced.
        </p>
      </div>
    </div>
  );
}

export default function LoginForm() {
  return (
    <Suspense fallback={<div className="text-neutral-400 text-xs text-center py-10">Loading sign in...</div>}>
      <LoginFormInner />
    </Suspense>
  );
}
