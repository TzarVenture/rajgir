import type { MockUser } from "@/lib/auth/store";

/** Where a user should land after sign-in, based on their onboarding and approval state. */
export function homePath(user: MockUser): string {
  if (user.roles.length === 0) return "/onboarding/intent";
  if (user.roles.some((entry) => !entry.onboarded)) return "/onboarding";
  if (!user.roles.some((entry) => entry.status === "active")) return "/pending";
  return "/dashboard";
}
