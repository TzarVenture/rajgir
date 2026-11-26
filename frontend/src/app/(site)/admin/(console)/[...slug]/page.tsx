import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ModulePage } from "@/components/modules/ModulePage";
import { findAdminNavItem } from "@/lib/navigation";

/**
 * Placeholder pages for the admin modules in lib/navigation/adminNav.ts (PRD section 22). Staff access is
 * enforced by app/(site)/admin/layout.tsx; the sidebar comes from (console)/layout.tsx.
 */
type Params = { params: Promise<{ slug: string[] }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const item = findAdminNavItem(`/admin/${slug.join("/")}`);
  return { title: item ? `${item.label} | Admin | Rajgir Marathon` : "Admin | Rajgir Marathon" };
}

export default async function AdminModuleRoute({ params }: Params) {
  const { slug } = await params;
  const item = findAdminNavItem(`/admin/${slug.join("/")}`);
  if (!item || item.existing) notFound();

  return (
    <ModulePage
      view={{ title: item.label, description: item.description ?? "", status: item.status, phase: item.phase, icon: item.icon, features: item.features }}
      backHref="/admin/dashboard"
      backLabel="Back to admin dashboard"
    />
  );
}
