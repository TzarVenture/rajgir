import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { homePath } from "@/lib/auth/paths";
import { getRole } from "@/lib/roles";
import OnboardingForm from "./OnboardingForm";

export default async function OnboardingRolePage({
  params,
}: {
  params: Promise<{ role: string }>;
}) {
  const { role: roleId } = await params;

  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const config = getRole(roleId);
  const entry = user.roles.find((item) => item.role === roleId);
  if (!config || !entry) notFound();

  if (entry.onboarded) redirect(homePath(user));

  return (
    <OnboardingForm
      roleId={config.id}
      roleLabel={config.label}
      fields={config.fields}
    />
  );
}
