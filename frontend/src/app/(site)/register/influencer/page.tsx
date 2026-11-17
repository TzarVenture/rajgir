import React from "react";
import { LuMapPin } from "react-icons/lu";
import RegistrationPageShell from "@/components/registration/RegistrationPageShell";
import { Badge } from "@/components/ui";
import { guardRegistration } from "@/lib/auth/registrationGate";
import InfluencerRegisterForm from "./InfluencerRegisterForm";

export const metadata = {
  title: "Influencer & Creator Collaboration | Rajgir Marathon 2027",
  description: "Partner with Rajgir Marathon as a content creator, running athlete, or media ambassador.",
};

export default async function InfluencerRegisterPage() {
  const { user, notice } = await guardRegistration("INFLUENCER");
  if (notice) return notice;

  return (
    <RegistrationPageShell
      crumb="Influencer"
      title="Influencer and creator collaboration"
      subtitle="Amplify the historic spirit of Rajgir. Collaborate as an official media ambassador with exclusive race-day access and creator perks."
      eyebrow={
        <Badge tone="heritage">
          <LuMapPin className="h-3 w-3" aria-hidden /> Rajgir, Bihar | 2027
        </Badge>
      }
    >
      <InfluencerRegisterForm user={user} />
    </RegistrationPageShell>
  );
}
