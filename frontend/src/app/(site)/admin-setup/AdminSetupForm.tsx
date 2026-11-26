"use client";

import { useActionState } from "react";
import Link from "next/link";
import { adminSetupAction } from "@/app/actions/auth";
import PasswordField from "@/components/auth/PasswordField";
import SubmitButton from "@/components/auth/SubmitButton";
import { Field, Notice, TextInput } from "@/components/ui";

export function AdminSetupForm() {
  const [state, formAction] = useActionState(adminSetupAction, undefined);
  const v = state?.values ?? {};
  const fe = state?.fieldErrors ?? {};

  return (
    <form action={formAction} className="space-y-4">
      {state?.error && <Notice tone="error">{state.error}</Notice>}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field htmlFor="adm-fn" label="First Name" error={fe.firstName} required>
          <TextInput id="adm-fn" name="firstName" defaultValue={v.firstName} placeholder="e.g. Admin" required />
        </Field>
        <Field htmlFor="adm-ln" label="Last Name" error={fe.lastName} required>
          <TextInput id="adm-ln" name="lastName" defaultValue={v.lastName} placeholder="e.g. Kumar" required />
        </Field>
      </div>

      <Field htmlFor="adm-email" label="Admin Email" error={fe.email} required>
        <TextInput
          id="adm-email"
          name="email"
          type="email"
          defaultValue={v.email}
          placeholder="admin@rajgirmarathon.com"
          required
        />
      </Field>

      <Field htmlFor="adm-mob" label="10-Digit Mobile Number" error={fe.mobile} required>
        <TextInput
          id="adm-mob"
          name="mobile"
          type="tel"
          defaultValue={v.mobile}
          placeholder="9876543210"
          required
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <PasswordField
          name="password"
          label="Password"
          error={fe.password}
          autoComplete="new-password"
        />
        <PasswordField
          name="confirm"
          label="Confirm Password"
          error={fe.confirm}
          autoComplete="new-password"
        />
      </div>

      <PasswordField
        name="setupKey"
        label="Admin Setup Key (from backend .env)"
        error={fe.setupKey}
        autoComplete="current-password"
        placeholder="Enter ADMIN_SETUP_KEY"
      />

      <SubmitButton label="Create Admin & Open Console" pendingLabel="Creating Admin..." />

      <p className="pt-2 text-center text-xs text-charcoal-500">
        Already have an Admin account?{" "}
        <Link href="/login" className="font-bold text-brand-red hover:underline">
          Sign in at /login
        </Link>
      </p>
    </form>
  );
}
