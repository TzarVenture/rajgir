import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { selfSignupRoles } from "@/lib/roles";
import IntentForm, { type IntentOption } from "./IntentForm";

export const metadata = { title: "Choose your role | Rajgir Marathon" };

export default async function IntentPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const options: IntentOption[] = selfSignupRoles().map((role) => ({
    id: role.id,
    intentLabel: role.intentLabel,
    requiresApproval: role.requiresApproval,
  }));

  return <IntentForm options={options} />;
}
