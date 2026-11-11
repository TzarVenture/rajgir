import { notFound, redirect } from "next/navigation";
import { approveRole } from "@/app/actions/auth";
import { getCurrentUser } from "@/lib/auth/session";
import { listPendingRoles } from "@/lib/auth/store";
import { getRole, isRoleId } from "@/lib/roles";
import { cardClass, primaryButtonClass } from "@/components/auth/ui";

export default async function RoleDashboard({ params }: { params: Promise<{ role: string }> }) {
  const { role: roleId } = await params;
  if (!isRoleId(roleId)) notFound();

  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const config = getRole(roleId);
  const entry = user.roles.find((item) => item.role === roleId);
  if (!config || !entry) redirect("/dashboard");
  if (entry.status !== "active") redirect("/pending");
  if (!entry.onboarded) redirect("/onboarding");

  const profile = user.profile[roleId] ?? {};
  const isAdmin = roleId === "super_admin";
  const approvals = isAdmin ? listPendingRoles() : [];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#cca043]">Dashboard</p>
        <h1 className="font-graduate text-3xl">{config.label}</h1>
        <p className="mt-1 text-sm text-white/60">Welcome back, {user.name.split(" ")[0]}.</p>
      </div>

      {!config.hasDashboard || !config.launch ? (
        <div className={cardClass}>
          <p className="text-sm text-white/70">
            The {config.label} dashboard is planned for a later phase. This build shows the sign-up and approval flow only.
          </p>
        </div>
      ) : null}

      {config.widgets.length > 0 ? (
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {config.widgets.map((widget) => (
            <div key={widget.label} className={cardClass}>
              <p className="text-xs uppercase tracking-wider text-white/50">{widget.label}</p>
              <p className="mt-2 text-lg font-semibold text-[#cca043]">{widget.value}</p>
            </div>
          ))}
        </section>
      ) : null}

      {Object.keys(profile).length > 0 ? (
        <section className={cardClass}>
          <h2 className="mb-4 font-graduate text-xl">Your details</h2>
          <dl className="grid gap-3 sm:grid-cols-2">
            {Object.entries(profile).map(([key, value]) => (
              <div key={key}>
                <dt className="text-xs uppercase tracking-wider text-white/50">{key}</dt>
                <dd className="text-sm">{value}</dd>
              </div>
            ))}
          </dl>
        </section>
      ) : null}

      {isAdmin ? (
        <section className={cardClass}>
          <h2 className="mb-4 font-graduate text-xl">Pending approvals</h2>
          {approvals.length === 0 ? (
            <p className="text-sm text-white/60">Nothing waiting for approval.</p>
          ) : (
            <ul className="space-y-3">
              {approvals.map(({ user: applicant, role }) => (
                <li
                  key={`${applicant.id}-${role}`}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-white/10 bg-black/30 px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-semibold">{applicant.name}</p>
                    <p className="text-xs text-white/50">
                      {getRole(role)?.label ?? role} · {applicant.email}
                    </p>
                  </div>
                  <form action={approveRole}>
                    <input type="hidden" name="userId" value={applicant.id} />
                    <input type="hidden" name="role" value={role} />
                    <button type="submit" className={`${primaryButtonClass} !w-auto px-5`}>
                      Approve
                    </button>
                  </form>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}
    </div>
  );
}
