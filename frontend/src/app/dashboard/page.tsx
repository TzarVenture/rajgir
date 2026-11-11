import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { homePath } from "@/lib/auth/paths";

export default async function DashboardHome() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const first = user.roles.find((entry) => entry.status === "active" && entry.onboarded);
  if (!first) redirect(homePath(user));

  redirect(`/dashboard/${first.role}`);
}
