import type { AppUser } from "@/lib/auth/session";
import { registerPathForRole } from "@/lib/auth/roles";

/** Where a user should land after sign-in, based on their verification, onboarding and approval state. */
export function homePath(user: Pick<AppUser, "role" | "status" | "emailVerified">): string {
  if (!user.emailVerified) return "/verify-email";
  if (!user.role) return "/onboarding/intent";
  // Role chosen but registration form not submitted yet: continue where they left off.
  if (user.status === "PENDING_ONBOARDING") return registerPathForRole(user.role);
  if (user.status === "PENDING_APPROVAL") return "/pending";
  return "/dashboard";
}
