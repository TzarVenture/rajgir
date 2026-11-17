import React from "react";
import { LuMapPin } from "react-icons/lu";
import RegistrationPageShell from "@/components/registration/RegistrationPageShell";
import { Badge } from "@/components/ui";
import { guardRegistration } from "@/lib/auth/registrationGate";
import TourismRegisterForm from "./TourismRegisterForm";

export const metadata = {
  title: "Tourism & Hotel Partner Registration | Rajgir Marathon 2027",
  description: "Register your Rajgir hotel, resort, transport fleet, or tour agency as an official partner.",
};

export default async function TourismRegisterPage() {
  const { user, notice } = await guardRegistration("TOURISM_PARTNER");
  if (notice) return notice;

  return (
    <RegistrationPageShell
      crumb="Tourism partner"
      title="Tourism and hospitality partnership"
      subtitle="Welcome thousands of runners and families to historic Rajgir. List your hotel, transport fleet or guided heritage tours on the official race portal."
      eyebrow={
        <Badge tone="heritage">
          <LuMapPin className="h-3 w-3" aria-hidden /> Rajgir, Bihar | 2027
        </Badge>
      }
    >
      <TourismRegisterForm user={user} />
    </RegistrationPageShell>
  );
}
