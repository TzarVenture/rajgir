import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { authContext, requireUser } from "@/lib/auth/session";
import { findAdminNavItem } from "@/lib/navigation";
import { SECTION_DATA, loadAdminSection } from "@/lib/admin/sectionData";
import { AdminSectionView } from "@/components/admin/AdminSectionView";

type Params = { params: Promise<{ slug: string[] }> };

/** Only single-segment slugs that are in the admin navigation are console pages. */
function sectionFor(slug: string[]) {
  if (slug.length !== 1) return null;
  const item = findAdminNavItem(`/admin/${slug[0]}`);
  return item && SECTION_DATA[slug[0]] ? item : null;
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const item = sectionFor(slug);
  return { title: item ? `${item.label} | Admin | Rajgir Marathon` : "Admin | Rajgir Marathon" };
}

/**
 * Every admin console page. The staff-only check is in admin/layout.tsx (and enforced again by the
 * API on every admin endpoint); this page loads only the data its section needs.
 */
export default async function AdminSectionPage({ params }: Params) {
  const { slug } = await params;
  // Sign-in first, so signed-out visitors learn nothing about which admin paths exist.
  const user = await requireUser(`/admin/${slug.join("/")}`);
  const item = sectionFor(slug);
  if (!item) notFound();

  const ctx = await authContext();
  if (!ctx) redirect("/login");

  const { data, failed } = await loadAdminSection(slug[0], ctx);

  return (
    <AdminSectionView
      slug={slug[0]}
      title={item.label}
      description={item.description ?? ""}
      data={data}
      failed={failed}
      currentUserId={user.id}
    />
  );
}
