import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";

export default async function DashboardDispatcher() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  // If user has not picked a role yet
  if (!user.role || user.status === "PENDING_ONBOARDING") {
    redirect("/onboarding/intent");
  }

  // If user application is under review
  if (user.status === "PENDING_APPROVAL") {
    redirect("/pending");
  }

  // 1. Individual Roles Track (Runner, Volunteer, Influencer)
  if (["RUNNER", "VOLUNTEER", "INFLUENCER"].includes(user.role)) {
    redirect("/dashboard/individual");
  }

  // 2. Group & Institutional Delegations Track (Team Captain, Corporate Manager, School Coordinator)
  if (["TEAM_CAPTAIN", "CORPORATE_MANAGER", "SCHOOL_COORDINATOR"].includes(user.role)) {
    redirect("/dashboard/group");
  }

  // 3. Commercial Partners Track (Sponsor, Vendor, Tourism Partner)
  if (["SPONSOR", "VENDOR", "TOURISM_PARTNER"].includes(user.role)) {
    redirect("/dashboard/partner");
  }

  // Admin / Organizer Track
  if (["SUPER_ADMIN", "ORGANIZER"].includes(user.role)) {
    redirect("/admin");
  }

  // Fallback
  redirect("/dashboard/individual");
}
