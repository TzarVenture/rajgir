import Link from "next/link";
import { FaCheckCircle, FaInfoCircle } from "react-icons/fa";
import { withdrawRegistration } from "@/app/actions/registerPeople";
import SiteFooter from "@/components/layout/SiteFooter";
import SiteHeader from "@/components/layout/SiteHeader";
import { roleLabel } from "@/lib/auth/roles";

/** Full-page frame used when a registration page shows a message instead of its form. */
function NoticeFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen w-full flex-col bg-[#080604] text-white">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-4xl flex-1 items-center justify-center px-4 py-12">{children}</main>
      <SiteFooter />
    </div>
  );
}

const STATUS_TEXT: Record<string, string> = {
  pending: "Waiting for organizer review",
  CONFIRMED: "Confirmed",
  submitted: "Submitted",
  approved: "Approved",
};

function WithdrawButton() {
  return (
    <form action={withdrawRegistration} className="mt-3">
      <button
        type="submit"
        className="w-full rounded-lg border border-[#D1D5DB] px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-[#374151] transition hover:border-[#E31B23] hover:text-[#E31B23]"
      >
        Withdraw this registration to register as something else
      </button>
      <p className="mt-2 text-center text-[11px] text-[#6B7280]">
        Only possible while the organizers have not reviewed it yet.
      </p>
    </form>
  );
}

/** Shown when the person is already registered as this exact type. */
export function AlreadyRegisteredNotice({ name, role, status }: { name: string; role: string; status: string }) {
  return (
    <NoticeFrame>
      <div className="w-full max-w-lg rounded-2xl border border-[#E5E7EB] bg-white p-6 text-center text-[#111827] shadow-xl sm:p-8">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-3xl text-emerald-600">
          <FaCheckCircle />
        </div>
        <h1 className="font-barlow text-3xl font-black uppercase tracking-tight">You are registered</h1>
        <p className="mt-2 text-sm text-[#4B5563]">
          {name}, your <strong>{roleLabel(role)}</strong> registration is in. Status:{" "}
          <strong>{STATUS_TEXT[status] ?? status}</strong>.
        </p>
        <Link
          href="/dashboard"
          className="mt-6 flex h-[48px] w-full items-center justify-center rounded-lg bg-[#E31B23] text-sm font-bold uppercase tracking-wider text-white transition hover:bg-[#B5121B]"
        >
          Go to my dashboard
        </Link>
        {status === "pending" ? <WithdrawButton /> : null}
      </div>
    </NoticeFrame>
  );
}

/** Shown when the account already holds a different registration (one registration per account). */
export function OtherRegistrationNotice({
  name,
  currentRole,
  currentStatus,
  targetLabel,
}: {
  name: string;
  currentRole: string;
  currentStatus: string;
  targetLabel: string;
}) {
  return (
    <NoticeFrame>
      <div className="w-full max-w-lg rounded-2xl border border-[#E5E7EB] bg-white p-6 text-center text-[#111827] shadow-xl sm:p-8">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 text-3xl text-amber-600">
          <FaInfoCircle />
        </div>
        <h1 className="font-barlow text-3xl font-black uppercase tracking-tight">Already registered</h1>
        <p className="mt-2 text-sm leading-relaxed text-[#4B5563]">
          {name}, this account is registered as <strong>{roleLabel(currentRole)}</strong>. Each account can hold one
          registration, so it cannot also register as <strong>{targetLabel}</strong>.
        </p>
        <p className="mt-3 text-xs text-[#6B7280]">
          To register as {targetLabel}, use a different email and mobile number
          {currentStatus === "pending" ? ", or withdraw your current registration below." : "."}
        </p>
        <Link
          href="/dashboard"
          className="mt-6 flex h-[48px] w-full items-center justify-center rounded-lg bg-[#E31B23] text-sm font-bold uppercase tracking-wider text-white transition hover:bg-[#B5121B]"
        >
          Go to my dashboard
        </Link>
        {currentStatus === "pending" ? <WithdrawButton /> : null}
      </div>
    </NoticeFrame>
  );
}
