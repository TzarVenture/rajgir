import type { Metadata } from "next";
import { notFound } from "next/navigation";
import SiteHeader from "@/components/layout/SiteHeader";
import SiteFooter from "@/components/layout/SiteFooter";
import { ModulePage } from "@/components/modules/ModulePage";
import { findPublicNode, flattenPublic, hrefOf, needsPlaceholder, publicTrail } from "@/lib/navigation";
import type { ModuleView } from "@/lib/navigation";

/**
 * Placeholder pages for every public PRD module / sub-page in lib/navigation/publicNav.ts that has no page of
 * its own yet. A real page file at the same path always wins over this catch-all. Unknown paths call notFound(),
 * which shows app/(site)/not-found.tsx (dynamicParams is left on so that page, not the bare root 404, is used).
 */
export function generateStaticParams() {
  return flattenPublic()
    .filter(needsPlaceholder)
    .map((n) => ({ path: n.path.split("/").filter(Boolean) }));
}

type Params = { params: Promise<{ path: string[] }> };

async function resolve(params: Params["params"]) {
  const { path } = await params;
  const node = findPublicNode("/" + path.join("/"));
  if (!node || !needsPlaceholder(node)) return null;
  return node;
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const node = await resolve(params);
  if (!node) return {};
  return { title: `${node.title} | Rajgir Marathon`, description: node.description };
}

export default async function PublicModuleRoute({ params }: Params) {
  const node = await resolve(params);
  if (!node) notFound();

  const trail = publicTrail(node.path) ?? [node];
  const view: ModuleView = {
    title: node.title,
    description: node.description,
    status: node.status,
    phase: node.phase,
    icon: node.icon,
    features: node.features,
    links: node.children?.map((c) => ({ title: c.title, href: hrefOf(c), description: c.description, status: c.status })),
  };
  const parent = trail.length > 1 ? trail[trail.length - 2] : null;

  return (
    <div className="flex min-h-screen w-full flex-col bg-white font-manrope text-charcoal-900">
      <SiteHeader />
      <main className="flex-1 bg-surface-soft">
        <div className="mx-auto w-full max-w-[1040px] px-4 pb-16 pt-6 sm:px-6 lg:px-8">
          <ModulePage
            view={view}
            trail={[
              { label: "Home", href: "/" },
              ...trail.map((t, i) => ({ label: t.title, href: i < trail.length - 1 ? hrefOf(t) : undefined })),
            ]}
            backHref={parent ? hrefOf(parent) : "/"}
            backLabel={parent ? `Back to ${parent.title}` : "Back to home"}
          />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
