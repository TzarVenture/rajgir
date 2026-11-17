import { redirect } from "next/navigation";
import { homePath } from "@/lib/auth/paths";
import { requireUser } from "@/lib/auth/session";

export default async function OnboardingIndex() {
  const user = await requireUser("/onboarding");
  redirect(homePath(user));
}
