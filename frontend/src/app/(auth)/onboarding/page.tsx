import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";

export default async function OnboardingIndex() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  if (!user.role || user.status === "PENDING_ONBOARDING") {
    redirect("/onboarding/intent");
  }

  if (user.status === "PENDING_APPROVAL") {
    redirect("/pending");
  }

  redirect("/dashboard");
}
