import AuthShell from "@/components/auth/AuthShell";

export const dynamic = "force-dynamic";

/** Wider frame for the role picker and the approval-pending screen. */
export default function OnboardingLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <AuthShell width="wide">{children}</AuthShell>;
}
