"use client";

import { useActionState } from "react";
import Link from "next/link";
import { requestPasswordReset, type FormState } from "@/app/actions/auth";
import SubmitButton from "@/components/auth/SubmitButton";
import { AuthHeading, Field, FormError, FormNotice, cardClass, linkClass } from "@/components/auth/ui";

export default function ForgotPasswordForm() {
  const [state, action] = useActionState<FormState, FormData>(requestPasswordReset, undefined);

  return (
    <div className={cardClass}>
      <AuthHeading
        title="Reset your password"
        subtitle="Enter your email and we will send you a link to choose a new password."
      />

      <form action={action} className="space-y-4">
        <Field
          label="Email address"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          defaultValue={state?.values?.email}
          error={state?.fieldErrors?.email}
          autoFocus
        />
        <FormNotice message={state?.notice} />
        <FormError message={state?.error} />
        <SubmitButton label={state?.notice ? "Send again" : "Send reset link"} pendingLabel="Sending..." />
      </form>

      <div className="mt-6 border-t border-[#E5E7EB] pt-5 text-center text-sm text-[#4B5563]">
        Remembered it?{" "}
        <Link href="/login" className={linkClass}>
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
