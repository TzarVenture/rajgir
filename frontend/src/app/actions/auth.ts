"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { api } from "@/lib/api";
import { getCurrentUser, endSession } from "@/lib/auth/session";

export type FormState = { error?: string } | undefined;

function text(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

export async function signUp(_prev: FormState, formData: FormData): Promise<FormState> {
  const name = text(formData, "name");
  const email = text(formData, "email").toLowerCase();
  const mobile = digitsOnly(text(formData, "mobile"));
  const password = text(formData, "password");
  const confirm = text(formData, "confirm");
  const redirectTo = text(formData, "redirectTo");

  if (name.length < 2) return { error: "Enter your full name." };
  if (!/^\S+@\S+\.\S+$/.test(email)) return { error: "Enter a valid email address." };
  if (mobile.length !== 10) return { error: "Enter a valid 10-digit mobile number." };
  if (password.length < 8) return { error: "Password must be at least 8 characters long." };
  if (password !== confirm) return { error: "Passwords do not match." };

  try {
    // 1. Strict 1 User = 1 Role pre-check
    const checkRes = await api.checkUser(email, mobile);
    if (checkRes.success && checkRes.data?.exists) {
      const existingRole = checkRes.data.role;
      if (existingRole) {
        return {
          error: `An account with this email/mobile is already registered as ${existingRole}. An account can only hold one role.`,
        };
      }
    }

    // 2. Create account in Supabase Auth
    const supabase = await createClient();
    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
          phone: mobile,
        },
      },
    });

    if (authError) {
      return { error: authError.message || "Failed to create account. Please try again." };
    }

    // 3. Sync into PostgreSQL Database (Try NestJS + Direct Supabase upsert)
    try {
      await api.syncUser({
        email,
        phone: mobile,
        fullName: name,
        supabaseAuthId: data.user?.id,
      });
    } catch (apiSyncErr) {
      console.warn("NestJS api.syncUser skipped/unreachable:", apiSyncErr);
    }

    try {
      await supabaseAdmin.from("users").upsert({
        email,
        phone: mobile,
        full_name: name,
        supabase_auth_id: data.user?.id,
        status: "PENDING_ONBOARDING",
        updated_at: new Date().toISOString(),
      }, { onConflict: "email" });
    } catch (upsertErr) {
      console.warn("Direct Supabase users upsert warning:", upsertErr);
    }

    // 4. Redirect to destination or intent screen
    if (redirectTo && redirectTo.startsWith("/register/")) {
      redirect(redirectTo);
    }

    redirect("/onboarding/intent");
  } catch (err: any) {
    if (err?.digest?.startsWith("NEXT_REDIRECT")) {
      throw err;
    }
    console.error("signUp error:", err);
    return { error: err.message || "An unexpected error occurred during sign up." };
  }
}

export async function login(_prev: FormState, formData: FormData): Promise<FormState> {
  const identifier = text(formData, "identifier");
  const password = text(formData, "password");
  const redirectTo = text(formData, "redirectTo");

  if (!identifier) return { error: "Please enter your email or 10-digit mobile number." };
  if (!password) return { error: "Please enter your password." };

  try {
    let emailToUse = identifier.toLowerCase();

    // If identifier is mobile number (no @), look up email from database
    if (!identifier.includes("@")) {
      const cleanPhone = digitsOnly(identifier);
      if (cleanPhone.length !== 10) {
        return { error: "Please enter a valid 10-digit mobile number or email address." };
      }

      const lookup = await api.checkUser(undefined, cleanPhone);
      if (lookup.success && lookup.data?.exists && lookup.data.email) {
        emailToUse = lookup.data.email.toLowerCase();
      } else {
        const { data: dbUser } = await supabaseAdmin
          .from("users")
          .select("email")
          .eq("phone", cleanPhone)
          .maybeSingle();

        if (dbUser?.email) {
          emailToUse = dbUser.email.toLowerCase();
        } else {
          return { error: "No account found matching this mobile number." };
        }
      }
    }

    // Authenticate with Supabase
    const supabase = await createClient();
    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email: emailToUse,
      password,
    });

    if (authError || !data.user) {
      return { error: "Incorrect email/mobile or password." };
    }

    // Sync / refresh user details from NestJS API
    const userRes = await api.checkUser(data.user.email);
    const role = userRes.data?.role;
    const status = userRes.data?.status;

    // Follow redirect if specified
    if (redirectTo && redirectTo.startsWith("/register/")) {
      redirect(redirectTo);
    }

    // Dynamic routing according to role status
    if (!role || status === "PENDING_ONBOARDING") {
      redirect("/onboarding/intent");
    }

    if (status === "PENDING_APPROVAL") {
      redirect("/pending");
    }

    redirect("/dashboard");
  } catch (err: any) {
    if (err?.digest?.startsWith("NEXT_REDIRECT")) {
      throw err;
    }
    console.error("login error:", err);
    return { error: err.message || "An unexpected error occurred during login." };
  }
}

export async function logout(): Promise<void> {
  await endSession();
  redirect("/login");
}

export async function selectRoleIntent(formData: FormData): Promise<void> {
  const role = text(formData, "role");
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  // 1. Record role intent in Supabase Auth metadata
  try {
    const supabase = await createClient();
    await supabase.auth.updateUser({
      data: { role_intent: role },
    });
  } catch (authErr) {
    console.warn("Could not update auth user metadata:", authErr);
  }

  // 2. Direct Supabase Database: ensure user exists and update role
  try {
    await supabaseAdmin
      .from("users")
      .update({ role, updated_at: new Date().toISOString() })
      .or(`id.eq.${user.id},supabase_auth_id.eq.${user.id},email.eq.${user.email}`);
  } catch (dbErr) {
    console.warn("Could not update users table directly:", dbErr);
  }

  // 3. Sync to NestJS API if running/deployed
  try {
    const res = await api.setUserRole(user.id, role);
    if (!res.success) {
      console.warn("NestJS API setUserRole skipped/unreachable:", res.error);
    }
  } catch (apiErr) {
    console.warn("NestJS API setUserRole error:", apiErr);
  }

  // 4. Route to the dedicated registration URL
  const roleRouteMap: Record<string, string> = {
    RUNNER: "/register/runner",
    VOLUNTEER: "/register/volunteer",
    INFLUENCER: "/register/influencer",
    TEAM_CAPTAIN: "/register/team",
    CORPORATE_MANAGER: "/register/corporate",
    SCHOOL_COORDINATOR: "/register/school",
    SPONSOR: "/register/sponsor",
    VENDOR: "/register/vendor",
    TOURISM_PARTNER: "/register/tourism",
  };

  const targetUrl = roleRouteMap[role] || "/dashboard";
  redirect(targetUrl);
}

export async function verifyOtp(_prev: FormState, formData: FormData): Promise<FormState> {
  const code = text(formData, "code");
  if (code.length < 6) return { error: "Enter the complete 6-digit verification code." };
  redirect("/onboarding/intent");
}

export async function verifyTwoFactor(_prev: FormState, formData: FormData): Promise<FormState> {
  const code = text(formData, "code");
  if (code.length < 6) return { error: "Enter the complete 6-digit verification code." };
  redirect("/dashboard");
}

export async function saveOnboarding(_prev: FormState, _formData: FormData): Promise<FormState> {
  redirect("/dashboard");
}

export async function approveRole(_formData: FormData): Promise<void> {
  // Administrative approval action placeholder
}

