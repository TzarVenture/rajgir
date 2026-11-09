import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { homePath } from "@/lib/auth/paths";

export default async function OnboardingIndex() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const next = user.roles.find((entry) => !entry.onboarded);
  if (next) redirect(`/onboarding/${next.role}`);

  redirect(homePath(user));
}
