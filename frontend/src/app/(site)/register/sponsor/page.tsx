import React from "react";
import { LuMapPin } from "react-icons/lu";
import RegistrationPageShell from "@/components/registration/RegistrationPageShell";
import { Badge } from "@/components/ui";
import { guardRegistration } from "@/lib/auth/registrationGate";
import SponsorRegisterForm from "./SponsorRegisterForm";

export const metadata = {
  title: "Official Sponsor Registration | Rajgir Marathon 2027",
  description: "Partner with Rajgir Marathon 2027. Connect your brand with 10,000+ national athletes.",
};

export default async function SponsorRegisterPage() {
  const { user, notice } = await guardRegistration("SPONSOR");
  if (notice) return notice;

  return (
    <RegistrationPageShell
      crumb="Sponsor"
      title="Official brand sponsorship"
      subtitle="Amplify your brand visibility across Bihar's premier international running festival. Connect with thousands of passionate runners and visitors."
      eyebrow={
        <Badge tone="heritage">
          <LuMapPin className="h-3 w-3" aria-hidden /> Rajgir, Bihar | 2027
        </Badge>
      }
    >
      <SponsorRegisterForm user={user} />
    </RegistrationPageShell>
  );
}
