"use client";

import { useActionState } from "react";
import Link from "next/link";
import { resetPassword, type FormState } from "@/app/actions/auth";
import PasswordField from "@/components/auth/PasswordField";
import SubmitButton from "@/components/auth/SubmitButton";
import { AuthHeading, FormError, cardClass, linkClass } from "@/components/auth/ui";

export default function ResetPasswordForm({ tokenHash }: { tokenHash: string }) {
  const [state, action] = useActionState<FormState, FormData>(resetPassword, undefined);
  const errors = state?.fieldErrors ?? {};

  return (
    <div className={cardClass}>
      <AuthHeading title="Choose a new password" subtitle="Pick a password you have not used on this account before." />

      <form action={action} className="space-y-4">
        <input type="hidden" name="tokenHash" value={tokenHash} />
        <PasswordField
          label="New password"
          name="password"
          autoComplete="new-password"
          placeholder="At least 8 characters"
          error={errors.password}
          hint="Use at least 8 characters."
        />
        <PasswordField
          label="Confirm new password"
          name="confirm"
          autoComplete="new-password"
          placeholder="Repeat your password"
          error={errors.confirm}
        />
        <FormError message={state?.error} />
        <SubmitButton label="Update password" pendingLabel="Updating..." />
      </form>

      {state?.error?.includes("link") ? (
        <p className="mt-4 text-center text-sm">
          <Link href="/forgot-password" className={linkClass}>
            Request a new reset link
          </Link>
        </p>
      ) : null}
    </div>
  );
}
