import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { api } from "@/lib/api";
import { AlreadyRegisteredNotice, OtherRegistrationNotice } from "@/components/registration/RegistrationNotice";
import { getRoleOption, registerPathForRole, type RoleValue } from "@/lib/auth/roles";
import { authContext, getCurrentUser, type AppUser } from "@/lib/auth/session";

/**
 * Shared check for every registration page (/register/runner, /register/volunteer, ...).
 *
 * - Not signed in: send to sign-up and come back to this same page afterwards.
 * - Signed in and free to register: returns the user so the page can show its form.
 * - Already registered (same type or another): returns a notice to show instead of the form.
 */
export async function guardRegistration(role: RoleValue): Promise<{ user: AppUser; notice: ReactNode | null }> {
  const path = registerPathForRole(role);
  const user = await getCurrentUser();
  if (!user) redirect(`/signup?redirect=${encodeURIComponent(path)}`);
  if (!user.emailVerified) redirect("/verify-email");

  const ctx = await authContext();
  const mine = ctx ? await api.registrations.me(ctx) : null;

  if (mine?.success && mine.data?.registered) {
    const { role: currentRole, status } = mine.data;
    if (currentRole === role) {
      return { user, notice: <AlreadyRegisteredNotice name={user.name} role={currentRole} status={status} /> };
    }
    return {
      user,
      notice: (
        <OtherRegistrationNotice
          name={user.name}
          currentRole={currentRole}
          currentStatus={status}
          targetLabel={getRoleOption(role)?.title ?? "this type"}
        />
      ),
    };
  }

  return { user, notice: null };
}
