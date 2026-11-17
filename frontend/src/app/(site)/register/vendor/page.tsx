import React from "react";
import { LuMapPin } from "react-icons/lu";
import RegistrationPageShell from "@/components/registration/RegistrationPageShell";
import { Badge } from "@/components/ui";
import { guardRegistration } from "@/lib/auth/registrationGate";
import VendorRegisterForm from "./VendorRegisterForm";

export const metadata = {
  title: "Marathon Expo Vendor Registration | Rajgir Marathon 2027",
  description: "Book your expo stall at the Rajgir Marathon 2027 Expo. Reach thousands of runners and visitors.",
};

export default async function VendorRegisterPage() {
  const { user, notice } = await guardRegistration("VENDOR");
  if (notice) return notice;

  return (
    <RegistrationPageShell
      crumb="Expo vendor"
      title="Marathon expo stall booking"
      subtitle="Showcase sports merchandise, healthy foods and regional arts directly to 10,000+ athletes and spectators at the official Marathon Expo."
      eyebrow={
        <Badge tone="heritage">
          <LuMapPin className="h-3 w-3" aria-hidden /> Rajgir, Bihar | 2027
        </Badge>
      }
    >
      <VendorRegisterForm user={user} />
    </RegistrationPageShell>
  );
}
