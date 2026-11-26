import Link from "next/link";
import { redirect } from "next/navigation";
import { api } from "@/lib/api";
import { authContext, requireUser } from "@/lib/auth/session";
import { LiveApprovalsClient } from "@/components/admin/LiveApprovalsClient";
import { buttonClasses } from "@/components/ui";

export const metadata = {
  title: "Live Approvals & Quota Appeals | Rajgir Marathon Admin",
};

export default async function AdminApprovalsPage() {
  const user = await requireUser("/admin/approvals");
  if (user.role !== "ORGANIZER" && user.role !== "SUPER_ADMIN") {
    redirect("/dashboard");
  }

  const ctx = await authContext();
  if (!ctx) redirect("/login");

  const [appealsRes, appsRes] = await Promise.all([
    api.admin.quotaAppeals(ctx),
    api.admin.applications(ctx),
  ]);

  const appeals = appealsRes.success && appealsRes.data ? appealsRes.data : [];
  const applications =
    appsRes.success && appsRes.data
      ? appsRes.data
      : { corporates: [], schools: [], sponsors: [], vendors: [], tourism: [] };

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-barlow text-3xl font-black uppercase text-charcoal-900">
            Live Approvals &amp; 50+ Quota Appeals
          </h1>
          <p className="text-sm text-charcoal-600">
            Connected directly to PostgreSQL. Approve organization accounts and review bulk runner limit increases.
          </p>
        </div>
        <Link href="/admin" className={buttonClasses({ variant: "secondary", size: "md" })}>
          Back to Admin Console
        </Link>
      </div>

      <LiveApprovalsClient appeals={appeals} applications={applications} />
    </div>
  );
}
