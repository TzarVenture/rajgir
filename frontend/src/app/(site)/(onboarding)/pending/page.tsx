import Link from "next/link";
import { redirect } from "next/navigation";
import { FaClock, FaEnvelope, FaPhoneAlt, FaSignOutAlt } from "react-icons/fa";
import { logout } from "@/app/actions/auth";
import { homePath } from "@/lib/auth/paths";
import { roleLabel } from "@/lib/auth/roles";
import { requireUser } from "@/lib/auth/session";
import { cardClass, primaryButtonClass } from "@/components/auth/ui";

export const metadata = {
  title: "Application under review | Rajgir Marathon 2027",
  description: "Your registration is being reviewed by the organizing committee.",
};

export default async function PendingPage() {
  const user = await requireUser("/pending");

  // Only people waiting for approval belong here.
  if (user.status !== "PENDING_APPROVAL" || homePath(user) !== "/pending") redirect(homePath(user));

  const displayRole = roleLabel(user.role);

  return (
    <div className={`${cardClass} text-center`}>
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#FEF3C7] text-3xl text-[#C78A12]">
        <FaClock />
      </div>

      <span className="inline-block rounded-full bg-amber-50 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-amber-700">
        Application under review
      </span>

      <h1 className="mt-3 font-barlow text-3xl font-black uppercase tracking-tight text-[#111827] sm:text-4xl">{displayRole}</h1>

      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-[#4B5563]">
        Thank you, <strong className="text-[#111827]">{user.name}</strong>. The organizing committee will review your application.
        You will hear from us by email and SMS within 48 to 72 working hours.
      </p>

      <dl className="mt-6 space-y-2.5 rounded-xl bg-[#F9FAFB] p-4 text-left text-sm">
        <div className="flex items-center justify-between gap-4 border-b border-[#E5E7EB] pb-2">
          <dt className="text-[#6B7280]">Email</dt>
          <dd className="font-semibold text-[#111827]">{user.email}</dd>
        </div>
        <div className="flex items-center justify-between gap-4 border-b border-[#E5E7EB] pb-2">
          <dt className="text-[#6B7280]">Mobile</dt>
          <dd className="font-semibold text-[#111827]">{user.phone || "-"}</dd>
        </div>
        <div className="flex items-center justify-between gap-4">
          <dt className="text-[#6B7280]">Status</dt>
          <dd className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-700">Pending review</dd>
        </div>
      </dl>

      <div className="mt-6 space-y-3">
        <Link href="/pending" className={`${primaryButtonClass} flex items-center justify-center`}>
          Check status
        </Link>
        <form action={logout}>
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-1.5 py-2 text-xs font-semibold text-[#6B7280] hover:text-[#E31B23]"
          >
            <FaSignOutAlt className="text-[11px]" /> Sign out
          </button>
        </form>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-center gap-4 border-t border-[#E5E7EB] pt-4 text-xs text-[#6B7280]">
        <span className="flex items-center gap-1.5">
          <FaPhoneAlt className="text-[10px] text-[#C78A12]" /> +91 612 222 3456
        </span>
        <span className="flex items-center gap-1.5">
          <FaEnvelope className="text-[10px] text-[#C78A12]" /> committee@rajgirmarathon.com
        </span>
      </div>
    </div>
  );
}
