import { redirect } from "next/navigation";
import { homePath } from "@/lib/auth/paths";
import { getCurrentUser } from "@/lib/auth/session";

const STAFF_ROLES = new Set(["ORGANIZER", "SUPER_ADMIN"]);

/**
 * Server-side gate for the admin console: signed-in staff only.
 *
 * Signed-in non-staff are sent to their own home here. Signed-out visitors are left to the page,
 * whose requireUser() knows the exact URL and sends them to /login with it as the return path
 * (a layout cannot see the requested path, so redirecting here always returned people to /admin).
 * Every admin page calls requireUser() before loading data, and the API enforces staff roles on
 * every admin endpoint.
 */
export default async function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const user = await getCurrentUser();
  if (user && (!user.role || !STAFF_ROLES.has(user.role))) redirect(homePath(user));
  return children;
}
