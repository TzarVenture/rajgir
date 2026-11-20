import type { AppUser } from "@/lib/auth/session";
import { registerPathForRole } from "@/lib/auth/roles";

/**
 * Where a user lands after signing in or up when they did not come from a specific page.
 * No forced steps: someone without a registration sees the "choose what to register as" page.
 */
export function homePath(user: Pick<AppUser, "role" | "status" | "emailVerified">): string {
  if (!user.emailVerified) return "/verify-email";
  if (!user.role) return "/register";
  // Role saved but the form was never submitted (older accounts): continue that registration.
  if (user.status === "PENDING_ONBOARDING") return registerPathForRole(user.role);
  // Volunteers and Influencers wait for approval on their own dashboard, which shows what is pending.
  if (user.status === "PENDING_APPROVAL") return (user.role === "VOLUNTEER" || user.role === "INFLUENCER") ? "/dashboard" : "/pending";
  return "/dashboard";
}
