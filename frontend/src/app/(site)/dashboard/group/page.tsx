import { redirect } from "next/navigation";
import { dashboardPathForRole } from "@/lib/auth/roles";
import { requireUser } from "@/lib/auth/session";

export default async function GroupRedirectPage() {
  const user = await requireUser("/dashboard/group");
  redirect(dashboardPathForRole(user.role));
}
