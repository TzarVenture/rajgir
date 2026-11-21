import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { api } from "@/lib/api";
import { AlreadyRegisteredNotice, OtherRegistrationNotice } from "@/components/registration/RegistrationNotice";
import { getRoleOption, registerPathForRole, type RoleValue } from "@/lib/auth/roles";
import { authContext, getPendingRegistration, getSession, requireUser, type AppUser } from "@/lib/auth/session";

/**
 * Shared check for every registration page (/register/runner, /register/volunteer, ...).
 *
 * - Staged registration (pending cookie): allows the user to complete their role form without being in the DB yet.
 * - Authenticated: checks if already registered (same type or another), returns user.
 * - Anonymous / no staged registration: sends to sign-up to enter basic details first.
 */
export async function guardRegistration(role: RoleValue): Promise<{ user: AppUser; notice: ReactNode | null }> {
  const path = registerPathForRole(role);
  const pending = await getPendingRegistration();
  const session = await getSession();

  // If not signed in and has no staged registration, redirect to sign-up
  if (session.status !== "authenticated" && !pending) {
    redirect(`/signup?redirect=${encodeURIComponent(path)}`);
  }

  // If user is already permanently signed in:
  if (session.status === "authenticated") {
    const user = await requireUser(path);
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

  // Staged guest registration (not in database yet):
  const effectiveUser: AppUser = {
    id: "pending",
    email: pending!.email,
    phone: pending!.mobile,
    firstName: pending!.firstName,
    lastName: pending!.lastName,
    name: `${pending!.firstName} ${pending!.lastName}`.trim(),
    role: null,
    status: "PENDING_ONBOARDING",
    emailVerified: true,
    isPending: true,
  };

  return { user: effectiveUser, notice: null };
}
