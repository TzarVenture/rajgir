import type { Metadata } from "next";
import "./site-theme.css";
import { isGateActive } from "@/lib/gate";
import { HeaderAuthProvider } from "@/components/layout/HeaderAuth";
import { PreviewProvider } from "@/components/layout/PreviewContext";
import { getCurrentUser } from "@/lib/auth/session";

/**
 * Layout for the REAL site only (everything behind the Coming Soon gate).
 *
 * The root layout, globals.css and tailwind-built.css are shared with the
 * frozen Coming Soon pages and must not be edited for real-site styling.
 * All real-site theming (light theme, Manrope/Barlow fonts) lives here, scoped
 * to the `.site-root` wrapper.
 */
export const metadata: Metadata = {
  title: "Rajgir Marathon — Run Through History | Official Platform",
  description:
    "Official digital platform for the Rajgir Marathon. Connects runners, volunteers, sponsors, expo vendors, and tourism partners in the historic city of Rajgir, Bihar.",
};

export default async function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await getCurrentUser();

  return (
    <div className="site-root flex flex-1 flex-col bg-white text-[#111827] font-manrope antialiased">
      <PreviewProvider isPreview={isGateActive()}>
        <HeaderAuthProvider user={user ? { name: user.name } : null}>{children}</HeaderAuthProvider>
      </PreviewProvider>
    </div>
  );
}
