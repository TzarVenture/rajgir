import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/session";

/** /admin opens the dashboard. Staff-only access is enforced in admin/layout.tsx. */
export default async function AdminRootPage() {
  await requireUser("/admin");
  redirect("/admin/dashboard");
}
