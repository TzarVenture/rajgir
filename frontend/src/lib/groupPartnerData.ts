import { redirect } from "next/navigation";
import { api, type ApiGroupDashboard, type ApiPartnerDashboard } from "@/lib/api";
import { authContext, requireUser } from "@/lib/auth/session";
import { dashboardPathForRole } from "@/lib/auth/roles";

export async function requireGroupDashboard(expectedRole: ApiGroupDashboard["role"]): Promise<ApiGroupDashboard> {
  const user = await requireUser(dashboardPathForRole(expectedRole));
  if (user.role !== expectedRole) {
    redirect(dashboardPathForRole(user.role));
  }

  const ctx = await authContext();
  if (!ctx) redirect("/login");

  const res = await api.groups.dashboard(ctx);
  if (!res.success || !res.data) {
    redirect("/dashboard");
  }
  return res.data;
}

export async function requirePartnerDashboard(expectedRole: ApiPartnerDashboard["role"]): Promise<ApiPartnerDashboard> {
  const user = await requireUser(dashboardPathForRole(expectedRole));
  if (user.role !== expectedRole) {
    redirect(dashboardPathForRole(user.role));
  }

  const ctx = await authContext();
  if (!ctx) redirect("/login");

  const res = await api.partners.dashboard(ctx);
  if (!res.success || !res.data) {
    redirect("/dashboard");
  }
  return res.data;
}
