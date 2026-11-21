import Link from "next/link";
import type { IconType } from "react-icons";
import {
  FaArrowLeft,
  FaAward,
  FaBuilding,
  FaBullhorn,
  FaGraduationCap,
  FaHandsHelping,
  FaHotel,
  FaRunning,
  FaStore,
  FaUsers,
} from "react-icons/fa";
import AuthShell from "@/components/auth/AuthShell";
import { cancelPendingRegistration } from "@/app/actions/auth";
import { ACCOUNT_TYPES, type RoleOption } from "@/lib/auth/roles";
import { getCurrentUser, getPendingRegistration } from "@/lib/auth/session";

export const metadata = {
  title: "Register | Rajgir Marathon 2027",
  description: "Choose how you want to take part in the Rajgir Marathon 2027.",
};

const ICONS: Record<RoleOption["icon"], IconType> = {
  runner: FaRunning,
  volunteer: FaHandsHelping,
  influencer: FaBullhorn,
  team: FaUsers,
  corporate: FaBuilding,
  school: FaGraduationCap,
  sponsor: FaAward,
  vendor: FaStore,
  tourism: FaHotel,
};

/**
 * "What do you want to register as?" Every card is a plain link to that registration page, which handles
 * sign-in/sign-up itself. Nothing is saved here.
 */
export default async function RegisterChooserPage() {
  const [user, pending] = await Promise.all([
    getCurrentUser(),
    getPendingRegistration(),
  ]);

  const isAuthenticated = user && !user.isPending;

  return (
    <AuthShell width="wide">
      <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-xl shadow-gray-200/50 sm:p-8">
        {pending ? (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-[#E5E7EB] pb-4">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-lg border border-[#E5E7EB] bg-neutral-50 px-3.5 py-1.5 text-xs font-semibold text-[#374151] hover:bg-neutral-100 hover:text-[#111827] transition"
            >
              <FaArrowLeft className="text-[11px] text-[#6B7280]" />
              <span>Back to Account Details</span>
            </Link>
            <div className="flex items-center gap-2.5 text-xs text-[#6B7280]">
              <span>
                Staged registration for <strong className="font-semibold text-[#111827]">{pending.email}</strong>
              </span>
              <span>•</span>
              <form action={cancelPendingRegistration} className="inline">
                <button type="submit" className="font-medium text-[#E31B23] hover:underline cursor-pointer">
                  Clear / Start fresh
                </button>
              </form>
            </div>
          </div>
        ) : null}

        <div className="mb-6 text-center">
          <h1 className="font-barlow text-3xl font-black uppercase tracking-tight text-[#111827] sm:text-4xl">
            {isAuthenticated ? `Welcome, ${user.name.split(" ")[0]}` : "Register for the marathon"}
          </h1>
          <p className="mt-1.5 text-sm text-[#4B5563]">
            {pending
              ? "Select how you want to participate to complete your registration."
              : isAuthenticated
              ? "Choose how you want to take part."
              : "Choose how you want to take part. You will create a free account on the next step."}
          </p>
        </div>

        <div className="space-y-7">
          {ACCOUNT_TYPES.map((type) => (
            <section key={type.id} aria-labelledby={`type-${type.id}`}>
              <div className="mb-3">
                <h2 id={`type-${type.id}`} className="text-sm font-extrabold uppercase tracking-wider text-[#111827]">
                  {type.title}
                </h2>
                <p className="text-xs text-[#6B7280]">{type.description}</p>
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                {type.roles.map((role) => {
                  const Icon = ICONS[role.icon];
                  return (
                    <Link
                      key={role.value}
                      href={role.registerPath}
                      className="group flex flex-col rounded-xl border border-[#E5E7EB] bg-white p-4 transition hover:border-[#E31B23] hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#E31B23]"
                    >
                      <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-[#FEE2E2] text-base text-[#E31B23]">
                        <Icon />
                      </span>
                      <span className="text-base font-extrabold text-[#111827]">{role.title}</span>
                      <span className="mt-1 text-xs leading-relaxed text-[#4B5563]">{role.description}</span>
                      <span
                        className={`mt-3 inline-flex w-fit rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${
                          role.approval === "instant" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {role.approval === "instant" ? "Active right away" : "Needs organizer approval"}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </section>
          ))}
        </div>

        {!isAuthenticated ? (
          <p className="mt-7 border-t border-[#E5E7EB] pt-5 text-center text-sm text-[#4B5563]">
            Already have an account?{" "}
            <Link href="/login" className="font-bold text-[#E31B23] hover:underline">
              Sign in
            </Link>
          </p>
        ) : null}
      </div>
    </AuthShell>
  );
}
