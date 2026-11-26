import { redirect } from "next/navigation";
import { api } from "@/lib/api";
import { authContext, requireUser } from "@/lib/auth/session";
import { AdminCommandCenterClient } from "@/components/admin/AdminCommandCenterClient";

export const metadata = {
  title: "Admin Command Center | Rajgir Marathon 2027",
};

export default async function AdminConsolePage() {
  const user = await requireUser("/admin");
  if (!user.role || !["ORGANIZER", "SUPER_ADMIN"].includes(user.role)) {
    redirect("/dashboard");
  }

  const ctx = await authContext();
  if (!ctx) redirect("/login");

  const [overviewRes, runnersRes, volunteersRes, influencersRes, incidentsRes, appealsRes, appsRes, usersRes] =
    await Promise.all([
      api.admin.overview(ctx),
      api.admin.runners(ctx, 200),
      api.admin.volunteers(ctx, 200),
      api.admin.influencers(ctx, 200),
      api.admin.incidents(ctx),
      api.admin.quotaAppeals(ctx),
      api.admin.applications(ctx),
      api.admin.users(ctx, 150),
    ]);

  const overview =
    overviewRes.success && overviewRes.data
      ? overviewRes.data
      : {
          totalRunners: 0,
          kitsCollectedCount: 0,
          totalVolunteers: 0,
          totalInfluencers: 0,
          totalGroups: 0,
          openIncidentsCount: 0,
          pendingApprovalsCount: 0,
          pendingQuotaAppealsCount: 0,
          totalRevenue: 0,
          categoryBreakdown: [],
          tshirtBreakdown: [],
        };

  return (
    <AdminCommandCenterClient
      currentUser={{ name: user.name, email: user.email, role: user.role }}
      overview={overview}
      runners={runnersRes.success && runnersRes.data ? runnersRes.data.runners : []}
      volunteers={volunteersRes.success && volunteersRes.data ? volunteersRes.data.volunteers : []}
      influencers={influencersRes.success && influencersRes.data ? influencersRes.data.influencers : []}
      incidents={incidentsRes.success && incidentsRes.data ? incidentsRes.data : []}
      appeals={appealsRes.success && appealsRes.data ? appealsRes.data : []}
      applications={
        appsRes.success && appsRes.data
          ? appsRes.data
          : { corporates: [], schools: [], sponsors: [], vendors: [], tourism: [] }
      }
      users={usersRes.success && usersRes.data ? usersRes.data : []}
    />
  );
}
