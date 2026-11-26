import type { Metadata } from "next";
import SiteHeader from "@/components/layout/SiteHeader";
import SiteFooter from "@/components/layout/SiteFooter";
import { SearchField } from "@/components/search/SearchField";
import { LinkButton, PageHero } from "@/components/ui";

export const metadata: Metadata = { title: "Page not found | Rajgir Marathon" };

/** 404 for the real site: tells people what happened and gives them search and the main ways back. */
export default function SiteNotFound() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-white font-manrope text-charcoal-900">
      <SiteHeader />
      <main className="flex-1 bg-surface-soft">
        <div className="mx-auto w-full max-w-[860px] px-4 pb-20 pt-10 sm:px-6 lg:px-8">
          <PageHero align="center" title="We could not find that page" subtitle="The link may be old or mistyped. Search for what you need, or start from one of the shortcuts below." />
          <SearchField />
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <LinkButton href="/" size="md">
              Go to the home page
            </LinkButton>
            <LinkButton href="/how-it-works" variant="secondary" size="md">
              How it works
            </LinkButton>
            <LinkButton href="/contact" variant="secondary" size="md">
              Contact us
            </LinkButton>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
