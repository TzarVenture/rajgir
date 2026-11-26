import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { dashboardPathForRole } from "@/lib/auth/roles";
import { requireUser } from "@/lib/auth/session";
import { ModulePage } from "@/components/modules/ModulePage";
import { ALL_ROLE_KEYS, ROLE_KEY, findRoleNavItem } from "@/lib/navigation";
import type { DashRoleKey } from "@/lib/navigation";

/**
 * Placeholder pages for role-dashboard entries in lib/navigation/roleNav.ts that have no page of their own yet
 * (e.g. /dashboard/runner/wallet). A real page file at the same path always wins over this catch-all.
 * Each role can only open its own area; the dashboard layout already requires a signed-in user.
 */
type Params = { params: Promise<{ role: string; slug: string[] }> };

function lookup(role: string, slug: string[]) {
  if (!(ALL_ROLE_KEYS as string[]).includes(role)) return null;
  return findRoleNavItem(role as DashRoleKey, `/dashboard/${role}/${slug.join("/")}`) ?? null;
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { role, slug } = await params;
  const item = lookup(role, slug);
  return { title: item ? `${item.label} | Rajgir Marathon 2027` : "Dashboard | Rajgir Marathon 2027" };
}

export default async function DashboardModuleRoute({ params }: Params) {
  const { role, slug } = await params;
  const user = await requireUser(`/dashboard/${role}/${slug.join("/")}`);

  const item = lookup(role, slug);
  if (!item) notFound();
  // Only the owner role may open its area; everyone else goes to their own dashboard.
  if (!user.role || ROLE_KEY[user.role] !== role) redirect(dashboardPathForRole(user.role));

  const home = dashboardPathForRole(user.role);
  return (
    <ModulePage
      view={{
        title: item.label,
        description: item.description ?? "",
        status: item.status,
        phase: item.phase,
        icon: item.icon,
        features: item.features,
      }}
      backHref={home}
      backLabel="Back to overview"
    />
  );
}
