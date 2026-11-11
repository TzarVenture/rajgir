"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { AUTH_UNAVAILABLE, MOCK_OTP, isMockAuthEnabled } from "@/lib/auth/config";
import {
  createUser,
  findUserByLogin,
  findUserById,
  updateUser,
  type MockUser,
  type UserRole,
} from "@/lib/auth/store";
import { homePath } from "@/lib/auth/paths";
import {
  endSession,
  getCurrentUser,
  getTwoFactorUserId,
  getVerifyUserId,
  startSession,
  startTwoFactor,
  startVerify,
} from "@/lib/auth/session";
import { getRole, isRoleId, selfSignupRoles, type RoleId } from "@/lib/roles";

export type FormState = { error?: string } | undefined;

function text(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

export async function signUp(_prev: FormState, formData: FormData): Promise<FormState> {
  if (!isMockAuthEnabled()) return { error: AUTH_UNAVAILABLE };

  const name = text(formData, "name");
  const email = text(formData, "email").toLowerCase();
  const mobile = digitsOnly(text(formData, "mobile"));
  const password = text(formData, "password");
  const confirm = text(formData, "confirm");

  if (name.length < 2) return { error: "Enter your full name." };
  if (!/^\S+@\S+\.\S+$/.test(email)) return { error: "Enter a valid email address." };
  if (mobile.length !== 10) return { error: "Enter a 10-digit mobile number." };
  if (password.length < 8) return { error: "Password must be at least 8 characters." };
  if (password !== confirm) return { error: "Passwords do not match." };
  if (findUserByLogin(email) || findUserByLogin(mobile)) {
    return { error: "An account with this email or mobile already exists." };
  }

  const user = createUser({ name, email, mobile, password });
  await startVerify(user.id);
  redirect("/verify");
}

export async function login(_prev: FormState, formData: FormData): Promise<FormState> {
  if (!isMockAuthEnabled()) return { error: AUTH_UNAVAILABLE };

  const identifier = text(formData, "identifier");
  const password = text(formData, "password");

  const user = findUserByLogin(identifier);
  if (!user || user.password !== password) {
    return { error: "Incorrect email/mobile or password." };
  }

  if (!user.verified) {
    await startVerify(user.id);
    redirect("/verify");
  }

  if (user.twoFactor) {
    await startTwoFactor(user.id);
    redirect("/2fa");
  }

  await startSession(user.id);
  redirect(homePath(user));
}

export async function verifyOtp(_prev: FormState, formData: FormData): Promise<FormState> {
  if (!isMockAuthEnabled()) return { error: AUTH_UNAVAILABLE };

  const userId = await getVerifyUserId();
  const user = userId ? findUserById(userId) : undefined;
  if (!user) redirect("/register");

  if (text(formData, "code") !== MOCK_OTP) {
    return { error: "That code is not correct. For this demo, use 123456." };
  }

  const verified = updateUser(user.id, { verified: true }) as MockUser;
  await startSession(verified.id);
  redirect(homePath(verified));
}

export async function verifyTwoFactor(_prev: FormState, formData: FormData): Promise<FormState> {
  if (!isMockAuthEnabled()) return { error: AUTH_UNAVAILABLE };

  const userId = await getTwoFactorUserId();
  const user = userId ? findUserById(userId) : undefined;
  if (!user) redirect("/login");

  if (text(formData, "code") !== MOCK_OTP) {
    return { error: "That code is not correct. For this demo, use 123456." };
  }

  await startSession(user.id);
  redirect(homePath(user));
}

export async function logout(): Promise<void> {
  await endSession();
  redirect("/login");
}

export async function chooseRoles(_prev: FormState, formData: FormData): Promise<FormState> {
  if (!isMockAuthEnabled()) return { error: AUTH_UNAVAILABLE };

  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const allowed = new Set<RoleId>(selfSignupRoles().map((role) => role.id));
  const selected = formData
    .getAll("roles")
    .map(String)
    .filter((id): id is RoleId => isRoleId(id) && allowed.has(id));

  if (selected.length === 0) return { error: "Choose at least one option to continue." };

  const roles: UserRole[] = [...user.roles];
  for (const id of selected) {
    if (roles.some((entry) => entry.role === id)) continue;
    const config = getRole(id);
    roles.push({
      role: id,
      status: config?.requiresApproval ? "pending" : "active",
      onboarded: false,
    });
  }

  updateUser(user.id, { roles });
  redirect("/onboarding");
}

export async function saveOnboarding(_prev: FormState, formData: FormData): Promise<FormState> {
  if (!isMockAuthEnabled()) return { error: AUTH_UNAVAILABLE };

  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const roleId = text(formData, "role");
  const config = isRoleId(roleId) ? getRole(roleId) : undefined;
  const entry = user.roles.find((item) => item.role === roleId);
  if (!config || !entry) return { error: "This step is not available." };

  const values: Record<string, string> = {};
  for (const field of config.fields) {
    const value = text(formData, field.name);
    if (!value) return { error: `Please enter your ${field.label.toLowerCase()}.` };
    values[field.name] = value;
  }

  const roles = user.roles.map((item) =>
    item.role === roleId ? { ...item, onboarded: true } : item
  );
  const updated = updateUser(user.id, {
    roles,
    profile: { ...user.profile, [roleId]: values },
  }) as MockUser;

  redirect(homePath(updated));
}

export async function approveRole(formData: FormData): Promise<void> {
  if (!isMockAuthEnabled()) return;

  const admin = await getCurrentUser();
  const isAdmin = admin?.roles.some(
    (entry) => entry.role === "super_admin" && entry.status === "active"
  );
  if (!admin || !isAdmin) return;

  const userId = text(formData, "userId");
  const roleId = text(formData, "role");
  const target = findUserById(userId);
  if (!target || !isRoleId(roleId)) return;

  const roles = target.roles.map((entry) =>
    entry.role === roleId ? { ...entry, status: "active" as const } : entry
  );
  updateUser(target.id, { roles });
  revalidatePath("/dashboard/super_admin");
}
