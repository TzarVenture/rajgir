"use server";

import { redirect } from "next/navigation";
import { api, type ApiRole } from "@/lib/api";
import { homePath } from "@/lib/auth/paths";
import { safeRedirect } from "@/lib/auth/redirect";
import { isSelfSignupRole, registerPathForRole } from "@/lib/auth/roles";
import {
  authContext,
  clientContext,
  endSession,
  rememberNext,
  requireUser,
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
  const name = text(formData, "name");
  const email = text(formData, "email").toLowerCase();
  const mobileInput = text(formData, "mobile");
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");
  const next = safeRedirect(text(formData, "redirect"));
  const values = { name, email, mobile: mobileInput, redirect: next ?? "" };

  const fieldErrors: Record<string, string> = {};
  if (name.length < 2) fieldErrors.name = "Enter your full name.";
  if (!EMAIL_PATTERN.test(email)) fieldErrors.email = "Enter a valid email address.";
  const mobile = tenDigitMobile(mobileInput);
  if (!mobile) fieldErrors.mobile = "Enter a valid 10-digit mobile number.";
  if (password.length < 8) fieldErrors.password = "Use at least 8 characters.";
  else if (password.length > 72) fieldErrors.password = "Use at most 72 characters.";
  if (!fieldErrors.password && password !== confirm) fieldErrors.confirm = "Passwords do not match.";

  if (Object.keys(fieldErrors).length > 0 || !mobile) {
    return { error: "Please fix the highlighted fields.", fieldErrors, values };
  }

  const res = await api.auth.signup({ name, email, mobile, password }, await clientContext());
  if (!res.success || !res.data) {
    return { error: res.error ?? "We could not create your account. Please try again.", values };
  }

  await rememberNext(next);

  if (res.data.session) {
    // Project has email confirmation switched off: signed in straight away.
    await saveSession(res.data.session);
    redirect(homePath(res.data.user));
  }

  redirect(`/verify-email?email=${encodeURIComponent(email)}`);
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

export async function selectRole(_prev: FormState, formData: FormData): Promise<FormState> {
  const role = text(formData, "role");
  await requireUser("/onboarding/intent");

  if (!isSelfSignupRole(role)) return { error: "Please choose one of the options to continue." };

  const ctx = await authContext();
  if (!ctx) redirect("/login?redirect=%2Fonboarding%2Fintent");

  const res = await api.users.setMyRole(role as ApiRole, ctx);
  if (!res.success) return { error: res.error ?? "We could not save your choice. Please try again." };

  redirect(registerPathForRole(role));
}
