import { redirect } from "next/navigation";
import AuthShell from "@/components/auth/AuthShell";
import { getCurrentUser } from "@/lib/auth/session";
import { AdminSetupForm } from "./AdminSetupForm";

export const metadata = {
  title: "Admin Setup | Rajgir Marathon 2027",
  description: "Create an organizer admin account using your server setup key.",
};

export default async function AdminSetupPage() {
  const user = await getCurrentUser();
  if (user && (user.role === "ORGANIZER" || user.role === "SUPER_ADMIN")) {
    redirect("/admin");
  }

  return (
    <AuthShell width="narrow">
      <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-xl shadow-gray-200/50 sm:p-8">
        <div className="mb-6 text-center">
          <span className="inline-block rounded-full bg-brand-red-light px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-brand-red-dark">
            Staff Bootstrap
          </span>
          <h1 className="mt-2 font-barlow text-3xl font-black uppercase tracking-tight text-[#111827]">
            Create Admin Account
          </h1>
          <p className="mt-1.5 text-sm text-[#4B5563]">
            Protected by <code className="rounded bg-charcoal-100 px-1.5 py-0.5 text-xs">ADMIN_SETUP_KEY</code> in{" "}
            <code className="rounded bg-charcoal-100 px-1.5 py-0.5 text-xs">backend/.env</code>.
          </p>
        </div>

        <AdminSetupForm />
      </div>
    </AuthShell>
  );
}
