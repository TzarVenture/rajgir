import Link from "next/link";
import { redirect } from "next/navigation";
import { logout } from "@/app/actions/auth";
import { getCurrentUser } from "@/lib/auth/session";
import { getRole } from "@/lib/roles";

export default async function DashboardLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="min-h-screen bg-[#080604] text-white">
      <header className="border-b border-[#cca043]/25 bg-[#0f0c09]/90">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4">
          <Link href="/" className="flex items-center gap-3">
            <img src="/images/rajgir_new_logo.png" alt="Rajgir Marathon" className="h-10 w-auto object-contain" />
          </Link>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-semibold">{user.name}</p>
              <p className="text-[11px] text-white/50">{user.email}</p>
            </div>
            <form action={logout}>
              <button type="submit" className="rounded-full border border-white/20 px-4 py-2 text-xs font-semibold uppercase tracking-wide hover:border-[#cca043] hover:text-[#cca043]">
                Log out
              </button>
            </form>
          </div>
        </div>

        <nav className="mx-auto flex max-w-6xl flex-wrap gap-2 px-4 pb-4" aria-label="Your roles">
          {user.roles.map((entry) => {
            const label = getRole(entry.role)?.label ?? entry.role;
            const isActive = entry.status === "active";
            return isActive ? (
              <Link
                key={entry.role}
                href={`/dashboard/${entry.role}`}
                className="rounded-full border border-[#cca043]/40 px-3 py-1.5 text-xs font-semibold text-[#cca043] hover:bg-[#cca043]/10"
              >
                {label}
              </Link>
            ) : (
              <span
                key={entry.role}
                className="rounded-full border border-white/15 px-3 py-1.5 text-xs text-white/50"
              >
                {label} (pending)
              </span>
            );
          })}
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
