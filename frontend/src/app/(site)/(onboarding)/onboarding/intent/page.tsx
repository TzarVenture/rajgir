import { redirect } from "next/navigation";
import { api } from "@/lib/api";
import { getAccountTypeForRole } from "@/lib/auth/roles";
import { requireUser } from "@/lib/auth/session";
import IntentForm from "./IntentForm";

export const metadata = { title: "Choose your role | Rajgir Marathon" };

export default async function IntentPage() {
  const user = await requireUser("/onboarding/intent");

  if (!user.emailVerified) redirect("/verify-email");
  // Active or under review: the role is locked, nothing to choose.
  if (user.role && (user.status === "ACTIVE" || user.status === "PENDING_APPROVAL")) redirect("/dashboard");

  const config = await api.auth.config();

  return (
    <IntentForm
      withVerification={config.data?.requireEmailVerification ?? true}
      userName={user.name}
      currentRole={user.role ?? null}
      currentTypeId={getAccountTypeForRole(user.role)?.id ?? null}
    />
  );
}
