import { redirect } from "next/navigation";
import { homePath } from "@/lib/auth/paths";
import { requireUser } from "@/lib/auth/session";

const STAFF_ROLES = new Set(["ORGANIZER", "SUPER_ADMIN"]);

/**
 * Server-side gate for the admin console: signed-in staff only. The page itself is a client
 * component, so the check lives here. Staff data always comes from the API, which enforces the
 * same roles on every admin endpoint.
 */
export default async function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const user = await requireUser("/admin");
  if (!user.role || !STAFF_ROLES.has(user.role)) redirect(homePath(user));
  return children;
}
