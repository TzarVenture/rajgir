"use client";

import { useActionState } from "react";
import Link from "next/link";
import { login, type FormState } from "@/app/actions/auth";
import SubmitButton from "@/components/auth/SubmitButton";
import { Field, FormError, cardClass, AuthHeading } from "@/components/auth/ui";

const socialProviders = ["Google", "Apple", "Facebook", "LinkedIn"];

export default function LoginForm() {
  const [state, action] = useActionState<FormState, FormData>(login, undefined);

  return (
    <div className={cardClass}>
      <AuthHeading title="Log in" subtitle="Use your email or mobile number" />

      <form action={action} className="space-y-4">
        <Field label="Email or mobile" name="identifier" autoComplete="username" placeholder="you@example.com" />
        <Field label="Password" name="password" type="password" autoComplete="current-password" />
        <FormError message={state?.error} />
        <SubmitButton label="Log in" pendingLabel="Logging in..." />
      </form>

      <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-wider text-white/40">
        <span className="h-px flex-1 bg-white/15" />
        or continue with
        <span className="h-px flex-1 bg-white/15" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        {socialProviders.map((provider) => (
          <button
            key={provider}
            type="button"
            disabled
            title="Coming at launch"
            className="rounded-lg border border-white/15 px-3 py-2.5 text-xs font-semibold text-white/50"
          >
            {provider}
          </button>
        ))}
      </div>
      <p className="mt-2 text-center text-[11px] text-white/40">Social login comes at launch.</p>

      <p className="mt-6 text-center text-sm text-white/70">
        New runner?{" "}
        <Link href="/register" className="font-semibold text-[#cca043] hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}
