import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { api } from "@/lib/api";

export interface AppUser {
  id: string;
  email: string;
  phone?: string;
  name: string;
  role?: string | null;
  status: "PENDING_ONBOARDING" | "PENDING_APPROVAL" | "ACTIVE" | "SUSPENDED" | string;
}

export async function getCurrentUser(): Promise<AppUser | null> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return null;
    }

    // 1. Try fetching user details from NestJS API
    try {
      const checkRes = await api.checkUser(user.email);
      if (checkRes.success && checkRes.data?.exists) {
        return {
          id: checkRes.data.userId || user.id,
          email: user.email || "",
          phone: checkRes.data.phone || (user.user_metadata?.phone as string) || "",
          name: checkRes.data.fullName || (user.user_metadata?.full_name as string) || user.email || "",
          role: checkRes.data.role || (user.user_metadata?.role_intent as string) || null,
          status: checkRes.data.status || "PENDING_ONBOARDING",
        };
      }
    } catch {
      // Proceed to direct Supabase query
    }

    // 2. Direct Supabase fallback: query users table
    try {
      const { data: dbUser } = await supabaseAdmin
        .from("users")
        .select("*")
        .or(`email.eq.${user.email},supabase_auth_id.eq.${user.id}`)
        .maybeSingle();

      if (dbUser) {
        return {
          id: dbUser.id || user.id,
          email: dbUser.email || user.email || "",
          phone: dbUser.phone || (user.user_metadata?.phone as string) || "",
          name: dbUser.full_name || (user.user_metadata?.full_name as string) || user.email || "",
          role: dbUser.role || (user.user_metadata?.role_intent as string) || null,
          status: dbUser.status || "PENDING_ONBOARDING",
        };
      }
    } catch (dbErr) {
      console.warn("Supabase direct query fallback error:", dbErr);
    }

    // 3. Fallback from Supabase Auth metadata
    return {
      id: user.id,
      email: user.email || "",
      phone: (user.user_metadata?.phone as string) || "",
      name: (user.user_metadata?.full_name as string) || user.email || "",
      role: (user.user_metadata?.role_intent as string) || null,
      status: "PENDING_ONBOARDING",
    };
  } catch (err) {
    console.error("getCurrentUser error:", err);
    return null;
  }
}

export async function endSession(): Promise<void> {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
  } catch (err) {
    console.error("endSession error:", err);
  }
}
