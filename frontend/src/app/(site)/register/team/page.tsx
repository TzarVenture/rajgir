import React from "react";
import { LuMapPin } from "react-icons/lu";
import RegistrationPageShell from "@/components/registration/RegistrationPageShell";
import { Badge } from "@/components/ui";
import { guardRegistration } from "@/lib/auth/registrationGate";
import TeamRegisterForm from "./TeamRegisterForm";

export const metadata = {
  title: "Team Captain Registration | Rajgir Marathon 2027",
  description: "Register your running club or community team for Rajgir Marathon.",
};

export default async function TeamRegisterPage() {
  const { user, notice } = await guardRegistration("TEAM_CAPTAIN");
  if (notice) return notice;

  return (
    <RegistrationPageShell
      crumb="Team"
      title="Team captain registration"
      subtitle="Lead your running squad. Create an official team profile, receive your squad invite code, and manage team entries."
      eyebrow={
        <Badge tone="heritage">
          <LuMapPin className="h-3 w-3" aria-hidden /> Rajgir, Bihar | 2027
        </Badge>
      }
    >
      <TeamRegisterForm user={user} />
    </RegistrationPageShell>
  );
}
