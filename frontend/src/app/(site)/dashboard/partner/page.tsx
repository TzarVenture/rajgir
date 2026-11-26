import { redirect } from "next/navigation";
import { dashboardPathForRole } from "@/lib/auth/roles";
import { requireUser } from "@/lib/auth/session";

export default async function PartnerRedirectPage() {
  const user = await requireUser("/dashboard/partner");
  redirect(dashboardPathForRole(user.role));
}
