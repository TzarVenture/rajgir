import type { AppUser } from "@/lib/auth/session";

/** Where a user should land after sign-in, based on their onboarding and approval state. */
export function homePath(user: AppUser): string {
  if (!user.role || user.status === "PENDING_ONBOARDING") return "/onboarding/intent";
  if (user.status === "PENDING_APPROVAL") return "/pending";
  return "/dashboard";
}
