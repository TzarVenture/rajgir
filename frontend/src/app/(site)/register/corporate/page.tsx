import React from "react";
import { LuMapPin } from "react-icons/lu";
import RegistrationPageShell from "@/components/registration/RegistrationPageShell";
import { Badge } from "@/components/ui";
import { guardRegistration } from "@/lib/auth/registrationGate";
import CorporateRegisterForm from "./CorporateRegisterForm";

export const metadata = {
  title: "Corporate Delegation Registration | Rajgir Marathon 2027",
  description: "Register corporate employee delegations and CSR wellness initiatives.",
};

export default async function CorporateRegisterPage() {
  const { user, notice } = await guardRegistration("CORPORATE_MANAGER");
  if (notice) return notice;

  return (
    <RegistrationPageShell
      crumb="Corporate"
      title="Corporate delegation"
      subtitle="Promote employee health and CSR wellness. Register your company delegation with bulk pass management and GST invoicing."
      eyebrow={
        <Badge tone="heritage">
          <LuMapPin className="h-3 w-3" aria-hidden /> Rajgir, Bihar | 2027
        </Badge>
      }
    >
      <CorporateRegisterForm user={user} />
    </RegistrationPageShell>
  );
}
