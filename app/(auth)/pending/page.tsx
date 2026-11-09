import Link from "next/link";
import { redirect } from "next/navigation";
import { logout } from "@/app/actions/auth";
import { getCurrentUser } from "@/lib/auth/session";
import { homePath } from "@/lib/auth/paths";
import { getRole } from "@/lib/roles";
import { cardClass, AuthHeading, primaryButtonClass } from "@/components/auth/ui";

export const metadata = { title: "Account pending | Rajgir Marathon" };

export default async function PendingPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const pending = user.roles.filter((entry) => entry.status === "pending");
  if (pending.length === 0) redirect(homePath(user));

  return (
    <div className={cardClass}>
      <AuthHeading title="Waiting for approval" subtitle="Our team is checking your details" />

      <ul className="mb-6 space-y-2">
        {pending.map((entry) => (
          <li
            key={entry.role}
            className="flex items-center justify-between rounded-lg border border-white/10 bg-black/30 px-4 py-3 text-sm"
          >
            <span>{getRole(entry.role)?.label ?? entry.role}</span>
            <span className="rounded-full bg-[#cca043]/20 px-3 py-1 text-xs font-semibold text-[#cca043]">
              Pending
            </span>
          </li>
        ))}
      </ul>

      <p className="mb-6 text-center text-sm text-white/70">
        You will get an email and SMS once approved. You can check again any time.
      </p>

      <Link href="/dashboard" className={`${primaryButtonClass} block text-center`}>
        Check again
      </Link>

      <form action={logout} className="mt-4">
        <button type="submit" className="w-full text-center text-xs text-white/50 hover:text-white">
          Log out
        </button>
      </form>
    </div>
  );
}
