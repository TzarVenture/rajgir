import { cookies } from "next/headers";
import { isMockAuthEnabled } from "@/lib/auth/config";
import { findUserById, type MockUser } from "@/lib/auth/store";

const SESSION_COOKIE = "rajgir_session";
const VERIFY_COOKIE = "rajgir_verify";
const TWO_FACTOR_COOKIE = "rajgir_2fa";

const SEVEN_DAYS = 60 * 60 * 24 * 7;
const TEN_MINUTES = 60 * 10;

function options(maxAge: number) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  };
}

export async function getCurrentUser(): Promise<MockUser | null> {
  if (!isMockAuthEnabled()) return null;
  const jar = await cookies();
  const id = jar.get(SESSION_COOKIE)?.value;
  if (!id) return null;
  return findUserById(id) ?? null;
}

export async function startSession(userId: string): Promise<void> {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, userId, options(SEVEN_DAYS));
  jar.delete(VERIFY_COOKIE);
  jar.delete(TWO_FACTOR_COOKIE);
}

export async function endSession(): Promise<void> {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
}

export async function startVerify(userId: string): Promise<void> {
  const jar = await cookies();
  jar.set(VERIFY_COOKIE, userId, options(TEN_MINUTES));
}

export async function getVerifyUserId(): Promise<string | undefined> {
  const jar = await cookies();
  return jar.get(VERIFY_COOKIE)?.value;
}

export async function startTwoFactor(userId: string): Promise<void> {
  const jar = await cookies();
  jar.set(TWO_FACTOR_COOKIE, userId, options(TEN_MINUTES));
}

export async function getTwoFactorUserId(): Promise<string | undefined> {
  const jar = await cookies();
  return jar.get(TWO_FACTOR_COOKIE)?.value;
}
