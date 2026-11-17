import { redirect } from "next/navigation";
import { homePath } from "@/lib/auth/paths";
import { dashboardPathForRole } from "@/lib/auth/roles";
import { requireUser } from "@/lib/auth/session";

/** Sends each signed-in user to the right place: verify, choose role, registration, approval wait, or their dashboard. */
export default async function DashboardDispatcher() {
  const user = await requireUser("/dashboard");

  const next = homePath(user);
  if (next !== "/dashboard") redirect(next);

  redirect(dashboardPathForRole(user.role));
}
