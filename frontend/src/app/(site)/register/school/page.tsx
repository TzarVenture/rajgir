import React from "react";
import { LuMapPin } from "react-icons/lu";
import RegistrationPageShell from "@/components/registration/RegistrationPageShell";
import { Badge } from "@/components/ui";
import { guardRegistration } from "@/lib/auth/registrationGate";
import SchoolRegisterForm from "./SchoolRegisterForm";

export const metadata = {
  title: "School & College Registration | Rajgir Marathon 2027",
  description: "Register school student contingents and athletic teams with special student pricing.",
};

export default async function SchoolRegisterPage() {
  const { user, notice } = await guardRegistration("SCHOOL_COORDINATOR");
  if (notice) return notice;

  return (
    <RegistrationPageShell
      crumb="School and college"
      title="School and college delegation"
      subtitle="Inspire youth fitness and sports excellence. Register student contingents with a dedicated school liaison and student fee tiers."
      eyebrow={
        <Badge tone="heritage">
          <LuMapPin className="h-3 w-3" aria-hidden /> Rajgir, Bihar | 2027
        </Badge>
      }
    >
      <SchoolRegisterForm user={user} />
    </RegistrationPageShell>
  );
}
