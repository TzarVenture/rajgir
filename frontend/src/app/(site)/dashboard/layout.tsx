import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { logout } from "@/app/actions/auth";
import { getCurrentUser } from "@/lib/auth/session";
import { FaUserCircle, FaSignOutAlt, FaShieldAlt } from "react-icons/fa";

export default async function DashboardLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const roleLabels: Record<string, string> = {
    RUNNER: "Marathon Runner",
    VOLUNTEER: "Event Volunteer",
    INFLUENCER: "Influencer Ambassador",
    TEAM_CAPTAIN: "Team Captain",
    CORPORATE_MANAGER: "Corporate Manager",
    SCHOOL_COORDINATOR: "School Coordinator",
    SPONSOR: "Official Sponsor",
    VENDOR: "Expo Vendor",
    TOURISM_PARTNER: "Tourism Partner",
    ORGANIZER: "Race Organizer",
    SUPER_ADMIN: "Super Administrator",
  };

  const roleLabel = user.role ? roleLabels[user.role] || user.role.replace(/_/g, " ") : "Participant";

  return (
    <div className="min-h-screen bg-[#080604] text-white flex flex-col">
      {/* Top Navigation */}
      <header className="border-b border-[#cca043]/25 bg-[#0f0c09]/95 backdrop-blur-md sticky top-0 z-50">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-3.5">
          <Link href="/" className="flex items-center gap-3">
            <img
              src="/images/rajgir_new_logo.png"
              alt="Rajgir Marathon"
              className="h-9 sm:h-10 w-auto object-contain"
            />
          </Link>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2.5 text-right">
              <div className="hidden sm:block">
                <p className="text-xs font-bold text-white leading-tight">{user.name}</p>
                <div className="flex items-center justify-end gap-1.5 mt-0.5">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#cca043] bg-[#cca043]/10 border border-[#cca043]/30 px-2 py-0.2 rounded">
                    {roleLabel}
                  </span>
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-[#cca043]/20 border border-[#cca043]/40 flex items-center justify-center text-[#cca043] text-sm">
                <FaUserCircle />
              </div>
            </div>

            <form action={logout}>
              <button
                type="submit"
                title="Sign Out"
                className="rounded-full border border-white/20 bg-white/5 p-2 sm:px-3.5 sm:py-1.5 text-xs font-bold uppercase tracking-wider text-neutral-300 hover:border-[#cca043] hover:text-[#cca043] transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <FaSignOutAlt className="text-xs" />
                <span className="hidden sm:inline">Log out</span>
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Dashboard Content */}
      <main className="mx-auto max-w-6xl px-4 py-8 flex-1 w-full">{children}</main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-4 text-center text-xs text-neutral-500">
        Rajgir Marathon 2027 • Official Participant Portal • 1 User = 1 Role Policy Enforced
      </footer>
    </div>
  );
}
