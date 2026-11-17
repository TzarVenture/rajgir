import type { ReactNode } from "react";
import SiteFooter from "@/components/layout/SiteFooter";
import SiteHeader from "@/components/layout/SiteHeader";
import { Breadcrumb, PageHero } from "@/components/ui";
import { cn } from "@/components/ui/cn";

/**
 * Light page frame for every registration page: site header, breadcrumb, page heading, centered content,
 * footer. The root layout's body is dark (the Coming Soon pages need it), so this wrapper paints its own
 * full-height light background.
 */
export default function RegistrationPageShell({
  title,
  subtitle,
  eyebrow,
  crumb,
  width = "form",
  children,
}: {
  title: string;
  subtitle?: string;
  eyebrow?: ReactNode;
  /** Last breadcrumb label, e.g. "Volunteer". */
  crumb: string;
  /** "form" = 760px column, "wide" = 1100px (runner wizard with order summary). */
  width?: "form" | "wide";
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full flex-col bg-white font-manrope text-charcoal-900">
      <SiteHeader />
      <main className="flex-1 bg-surface-soft">
        <div className={cn("mx-auto w-full px-4 pb-16 pt-6 sm:px-6 lg:px-8", width === "wide" ? "max-w-[1180px]" : "max-w-[824px]")}>
          <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Register", href: "/register" }, { label: crumb }]} />
          <PageHero title={title} subtitle={subtitle} eyebrow={eyebrow} align="left" />
          {children}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
