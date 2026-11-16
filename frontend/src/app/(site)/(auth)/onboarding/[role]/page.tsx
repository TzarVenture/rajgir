import { redirect } from "next/navigation";

const roleToRegisterPath: Record<string, string> = {
  runner: "/register/runner",
  volunteer: "/register/volunteer",
  influencer: "/register/influencer",
  team_captain: "/register/team",
  corporate_manager: "/register/corporate",
  school_coordinator: "/register/school",
  sponsor: "/register/sponsor",
  vendor: "/register/vendor",
  tourism_partner: "/register/tourism",
};

export default async function OnboardingRolePage({
  params,
}: {
  params: Promise<{ role: string }>;
}) {
  const { role: roleId } = await params;
  const target = roleToRegisterPath[roleId.toLowerCase()] || "/onboarding/intent";
  redirect(target);
}
