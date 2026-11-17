import React from "react";
import { LuMapPin } from "react-icons/lu";
import RegistrationPageShell from "@/components/registration/RegistrationPageShell";
import { Badge } from "@/components/ui";
import { guardRegistration } from "@/lib/auth/registrationGate";
import VolunteerRegisterForm from "./VolunteerRegisterForm";

export const metadata = {
  title: "Volunteer Registration | Rajgir Marathon 2027",
  description: "Join the official volunteer crew of Rajgir Marathon 2027.",
};

export default async function VolunteerRegisterPage() {
  const { user, notice } = await guardRegistration("VOLUNTEER");
  if (notice) return notice;

  return (
    <RegistrationPageShell
      crumb="Volunteer"
      title="Volunteer registration"
      subtitle="Be the heartbeat of the marathon. Support runners across water stations, route marshalling, medal distribution and emergency response."
      eyebrow={
        <Badge tone="heritage">
          <LuMapPin className="h-3 w-3" aria-hidden /> Rajgir, Bihar | 2027
        </Badge>
      }
    >
      <VolunteerRegisterForm user={user} />
    </RegistrationPageShell>
  );
}
