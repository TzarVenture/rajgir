"use client";

import { Suspense, useActionState, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { login, type FormState } from "@/app/actions/auth";
import PasswordField from "@/components/auth/PasswordField";
import SubmitButton from "@/components/auth/SubmitButton";
import { AuthHeading, Field, FormError, FormNotice, cardClass, linkClass } from "@/components/auth/ui";

function describeIdentifier(value: string): string {
  const v = value.trim();
  if (!v) return "Use the email or 10-digit mobile number you signed up with.";
  if (v.includes("@")) return "Signing in with your email address.";
  if (/^[\d\s+()-]+$/.test(v)) return "Signing in with your mobile number.";
  return "Use the email or 10-digit mobile number you signed up with.";
}

function LoginFormInner() {
  const params = useSearchParams();
  // Protected pages send ?redirectTo=…, newer links use ?redirect=…
  const redirectTo = params.get("redirect") || params.get("redirectTo") || "";
  const justReset = params.get("reset") === "1";

  const [state, action] = useActionState<FormState, FormData>(login, undefined);
  const [typed, setTyped] = useState(state?.values?.identifier ?? "");

  const query = redirectTo ? `?redirect=${encodeURIComponent(redirectTo)}` : "";

  return (
    <div className={cardClass}>
      <AuthHeading title="Welcome back" subtitle="Sign in to manage your Rajgir Marathon registration." />

      <form action={action} className="space-y-4" noValidate={false}>
        <input type="hidden" name="redirect" value={redirectTo} />

        {justReset && !state?.error ? (
          <FormNotice message="Password updated. Sign in with your new password." />
        ) : null}
        {redirectTo && !state?.error && !justReset ? (
          <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-xs font-semibold text-blue-700">
            Sign in to continue where you left off.
          </div>
        ) : null}

        <Field
          label="Email or mobile"
          name="identifier"
          autoComplete="username"
          placeholder="you@example.com or 9876543210"
          defaultValue={state?.values?.identifier}
          error={state?.fieldErrors?.identifier}
          hint={describeIdentifier(typed)}
          onChange={(e) => setTyped(e.target.value)}
          autoFocus
        />

        <div>
          <PasswordField
            label="Password"
            name="password"
            autoComplete="current-password"
            placeholder="Enter your password"
            error={state?.fieldErrors?.password}
          />
          <div className="mt-2 text-right">
            <Link href="/forgot-password" className="text-xs font-semibold text-[#4B5563] hover:text-[#E31B23] hover:underline">
              Forgot password?
            </Link>
          </div>
        </div>

        <FormError message={state?.error} />

        <SubmitButton label="Sign in" pendingLabel="Signing in..." />
      </form>

      <div className="mt-6 border-t border-[#E5E7EB] pt-5 text-center">
        <p className="text-sm text-[#4B5563]">
          New to Rajgir Marathon?{" "}
          <Link href={`/register${query}`} className={linkClass}>
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginForm() {
  return (
    <Suspense fallback={<div className="py-10 text-center text-xs text-neutral-400">Loading sign in...</div>}>
      <LoginFormInner />
    </Suspense>
  );
}
