import { LuCircleCheck, LuInfo } from "react-icons/lu";
import { withdrawRegistration } from "@/app/actions/registerPeople";
import SiteFooter from "@/components/layout/SiteFooter";
import SiteHeader from "@/components/layout/SiteHeader";
import { Badge, Button, FeatureCard, LinkButton } from "@/components/ui";
import { roleLabel } from "@/lib/auth/roles";

/** Light full-page frame used when a registration page shows a message instead of its form. */
function NoticeFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen w-full flex-col bg-white font-manrope text-charcoal-900">
      <SiteHeader />
      <main className="flex flex-1 items-center justify-center bg-surface-soft px-4 py-12">{children}</main>
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
      <Button type="submit" variant="secondary" size="lg" fullWidth>
        Withdraw this registration to register as something else
      </Button>
      <p className="mt-2 text-center text-xs text-charcoal-500">Only possible while the organizers have not reviewed it yet.</p>
    </form>
  );
}

/** Shown when the person is already registered as this exact type. */
export function AlreadyRegisteredNotice({ name, role, status }: { name: string; role: string; status: string }) {
  return (
    <NoticeFrame>
      <FeatureCard className="w-full max-w-lg text-center">
        <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#DCFCE7] text-[#15803D]">
          <LuCircleCheck className="h-8 w-8" aria-hidden />
        </span>
        <h1 className="font-barlow text-[32px] font-bold uppercase leading-none text-charcoal-900">You are registered</h1>
        <p className="mt-3 text-[15px] leading-relaxed text-charcoal-600">
          {name}, your <strong className="text-charcoal-900">{roleLabel(role)}</strong> registration is in.
        </p>
        <div className="mt-3 flex justify-center">
          <Badge tone={status === "pending" ? "warning" : "success"}>{STATUS_TEXT[status] ?? status}</Badge>
        </div>
        <div className="mt-6">
          <LinkButton href="/dashboard" fullWidth>
            Go to my dashboard
          </LinkButton>
        </div>
        {status === "pending" ? <WithdrawButton /> : null}
      </FeatureCard>
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
      <FeatureCard className="w-full max-w-lg text-center">
        <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#DBEAFE] text-[#1D4ED8]">
          <LuInfo className="h-8 w-8" aria-hidden />
        </span>
        <h1 className="font-barlow text-[32px] font-bold uppercase leading-none text-charcoal-900">Already registered</h1>
        <p className="mt-3 text-[15px] leading-relaxed text-charcoal-600">
          {name}, this account is registered as <strong className="text-charcoal-900">{roleLabel(currentRole)}</strong>. Each account can
          hold one registration, so it cannot also register as <strong className="text-charcoal-900">{targetLabel}</strong>.
        </p>
        <p className="mt-3 text-sm text-charcoal-500">
          To register as {targetLabel}, use a different email and mobile number
          {currentStatus === "pending" ? ", or withdraw your current registration below." : "."}
        </p>
        <div className="mt-6">
          <LinkButton href="/dashboard" fullWidth>
            Go to my dashboard
          </LinkButton>
        </div>
        {currentStatus === "pending" ? <WithdrawButton /> : null}
      </FeatureCard>
    </NoticeFrame>
  );
}
