/**
 * The mock auth only runs while the site is in coming-soon mode.
 * At launch (COMING_SOON=false) the auth pages and dashboards are not served,
 * so mock login can never reach real visitors.
 */
export const MOCK_OTP = "123456";

export const AUTH_UNAVAILABLE =
  "Sign-in is not open yet. Please check back at launch.";

export function isMockAuthEnabled(): boolean {
  return process.env.COMING_SOON === "true";
}
