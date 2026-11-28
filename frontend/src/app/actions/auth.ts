"use server";

import { redirect } from "next/navigation";
import { api } from "@/lib/api";
import { homePath } from "@/lib/auth/paths";
import { safeRedirect } from "@/lib/auth/redirect";
import {
  clearPendingRegistration,
  clearSession,
  clientContext,
  endSession,
  rememberNext,
  savePendingRegistration,
  saveSession,
} from "@/lib/auth/session";

/**
 * Thin server actions: validate lightly, call the NestJS API, store the session cookie, redirect.
 * No database or Supabase access happens in Next.js.
 */
export type FormState =
  | {
      error?: string;
      /** Per-field messages, keyed by input name. */
      fieldErrors?: Record<string, string>;
      /** Submitted values (never passwords) so the form keeps what the user typed. */
      values?: Record<string, string>;
      /** Positive confirmation, e.g. "Email sent". */
      notice?: string;
    }
  | undefined;

function text(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

/** Accepts 10 digits, optionally prefixed with +91 / 91 / 0. */
function tenDigitMobile(value: string): string | null {
  let digits = digitsOnly(value);
  if (digits.length === 12 && digits.startsWith("91")) digits = digits.slice(2);
  if (digits.length === 11 && digits.startsWith("0")) digits = digits.slice(1);
  return digits.length === 10 ? digits : null;
}

const EMAIL_PATTERN = /^\S+@\S+\.\S+$/;

export async function signUp(_prev: FormState, formData: FormData): Promise<FormState> {
  const firstName = text(formData, "firstName").replace(/\s+/g, " ");
  const lastName = text(formData, "lastName").replace(/\s+/g, " ");
  const email = text(formData, "email").toLowerCase();
  const mobileInput = text(formData, "mobile");
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");
  const next = safeRedirect(text(formData, "redirect"));
  const values = { firstName, lastName, email, mobile: mobileInput, redirect: next ?? "" };

  const fieldErrors: Record<string, string> = {};
  if (!firstName) fieldErrors.firstName = "Enter your first name.";
  else if (firstName.length > 64) fieldErrors.firstName = "Use at most 64 characters.";
  if (!lastName) fieldErrors.lastName = "Enter your last name.";
  else if (lastName.length > 64) fieldErrors.lastName = "Use at most 64 characters.";
  if (!EMAIL_PATTERN.test(email)) fieldErrors.email = "Enter a valid email address.";
  const mobile = tenDigitMobile(mobileInput);
  if (!mobile) fieldErrors.mobile = "Enter a valid 10-digit mobile number.";
  if (password.length < 8) fieldErrors.password = "Use at least 8 characters.";
  else if (password.length > 72) fieldErrors.password = "Use at most 72 characters.";
  if (!fieldErrors.password && password !== confirm) fieldErrors.confirm = "Passwords do not match.";

  if (Object.keys(fieldErrors).length > 0 || !mobile) {
    return { error: "Please fix the highlighted fields.", fieldErrors, values };
  }

  // Pre-validate that email and mobile are available before staging
  const res = await api.auth.checkAvailability({ email, mobile });
  if (!res.success) {
    if (res.statusCode === 409) {
      return { error: res.error ?? "An account with this email or mobile already exists. Try signing in instead.", values };
    }
    if (res.statusCode === 400) {
      return { error: res.error ?? "Invalid registration details. Please check your email and mobile number.", values };
    }
  }

  // Purge any old session cookies so there is no conflict
  await clearSession();

  // STAGE ONLY — DO NOT WRITE TO DATABASE OR CREATE SUPABASE USER YET.
  // The database write occurs atomically when the user completes their final registration step.
  await savePendingRegistration({
    firstName,
    lastName,
    email,
    mobile,
    password,
    redirect: next ?? undefined,
    createdAt: Date.now(),
  });

  redirect(next ?? "/register");
}

export async function login(_prev: FormState, formData: FormData): Promise<FormState> {
  const identifier = text(formData, "identifier");
  const password = String(formData.get("password") ?? "");
  const next = safeRedirect(text(formData, "redirect"));
  const values = { identifier, redirect: next ?? "" };

  if (!identifier) return { error: "Enter your email or 10-digit mobile number.", fieldErrors: { identifier: "Required." }, values };
  if (!password) return { error: "Enter your password.", fieldErrors: { password: "Required." }, values };

  const res = await api.auth.login({ identifier, password }, await clientContext());

  if (!res.success || !res.data) {
    if (res.code === "EMAIL_NOT_VERIFIED") {
      await rememberNext(next);
      const email = identifier.includes("@") ? identifier.toLowerCase() : "";
      redirect(`/verify-email?from=login${email ? `&email=${encodeURIComponent(email)}` : ""}`);
    }
    return { error: res.error ?? "We could not sign you in. Please try again.", values };
  }

  await saveSession(res.data.session);
  redirect(next ?? homePath(res.data.user));
}

export async function logout(): Promise<void> {
  await endSession();
  redirect("/login");
}

export async function cancelPendingRegistration(): Promise<void> {
  await clearPendingRegistration();
  redirect("/signup");
}

export async function resendVerification(_prev: FormState, formData: FormData): Promise<FormState> {
  const email = text(formData, "email").toLowerCase();
  if (!EMAIL_PATTERN.test(email)) {
    return { error: "Enter the email address you signed up with.", fieldErrors: { email: "Enter a valid email address." }, values: { email } };
  }

  const res = await api.auth.resendVerification(email, await clientContext());
  if (!res.success) return { error: res.error ?? "We could not send the email. Please try again.", values: { email } };
  return { notice: "If this email has an unverified account, a new verification link is on its way.", values: { email } };
}

export async function requestPasswordReset(_prev: FormState, formData: FormData): Promise<FormState> {
  const email = text(formData, "email").toLowerCase();
  if (!EMAIL_PATTERN.test(email)) {
    return { error: "Enter a valid email address.", fieldErrors: { email: "Enter a valid email address." }, values: { email } };
  }

  const res = await api.auth.forgotPassword(email, await clientContext());
  if (!res.success) return { error: res.error ?? "We could not send the email. Please try again.", values: { email } };
  return {
    notice: "If an account exists for this email, we have sent a link to reset your password. It can take a minute to arrive.",
    values: { email },
  };
}

export async function resetPassword(_prev: FormState, formData: FormData): Promise<FormState> {
  const tokenHash = text(formData, "tokenHash");
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (!tokenHash) return { error: "This reset link is incomplete. Please request a new one." };
  if (password.length < 8) return { error: "Use at least 8 characters.", fieldErrors: { password: "Use at least 8 characters." } };
  if (password.length > 72) return { error: "Use at most 72 characters.", fieldErrors: { password: "Use at most 72 characters." } };
  if (password !== confirm) return { error: "Passwords do not match.", fieldErrors: { confirm: "Passwords do not match." } };

  const res = await api.auth.resetPassword({ tokenHash, password }, await clientContext());
  if (!res.success) return { error: res.error ?? "We could not update your password. Please request a new link." };

  redirect("/login?reset=1");
}


export async function adminSetupAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const firstName = text(formData, "firstName").replace(/\s+/g, " ");
  const lastName = text(formData, "lastName").replace(/\s+/g, " ");
  const email = text(formData, "email").toLowerCase();
  const mobileInput = text(formData, "mobile");
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");
  const setupKey = text(formData, "setupKey");
  const values = { firstName, lastName, email, mobile: mobileInput };

  const fieldErrors: Record<string, string> = {};
  if (!firstName) fieldErrors.firstName = "Enter first name.";
  if (!lastName) fieldErrors.lastName = "Enter last name.";
  if (!EMAIL_PATTERN.test(email)) fieldErrors.email = "Enter a valid email address.";
  const mobile = tenDigitMobile(mobileInput);
  if (!mobile) fieldErrors.mobile = "Enter a valid 10-digit mobile number.";
  if (password.length < 8) fieldErrors.password = "Use at least 8 characters.";
  else if (password.length > 72) fieldErrors.password = "Use at most 72 characters.";
  if (!fieldErrors.password && password !== confirm) fieldErrors.confirm = "Passwords do not match.";
  if (!setupKey) fieldErrors.setupKey = "Enter the admin setup key.";

  if (Object.keys(fieldErrors).length > 0 || !mobile) {
    return { error: "Please fix the highlighted fields.", fieldErrors, values };
  }

  const res = await api.auth.adminSetup(
    { firstName, lastName, email, mobile, password, setupKey },
    await clientContext()
  );

  if (!res.success || !res.data) {
    return { error: res.error ?? "Could not create admin account.", values };
  }

  if (res.data.session) {
    await saveSession(res.data.session);
    redirect("/admin");
  }

  redirect(`/verify-email?email=${encodeURIComponent(email)}`);
}
