"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  LuArrowRight,
  LuBuilding2,
  LuCircleCheck,
  LuCompass,
  LuHandHeart,
  LuLogOut,
  LuActivity,
  LuShieldCheck,
  LuStore,
} from "react-icons/lu";
import SiteHeader from "@/components/layout/SiteHeader";
import SiteFooter from "@/components/layout/SiteFooter";
import { Badge, Breadcrumb, Button, Card, LinkButton, Notice, PageHero } from "@/components/ui";

export default function WipPreviewHome() {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/preview", { method: "DELETE" });
    router.push("/");
    router.refresh();
  };

  const portalModules = [
    { title: "Runner Portal", path: "/portal/runner", icon: LuActivity, desc: "Registration, Digital Bib, Results & Certificates" },
    { title: "Volunteer Portal", path: "/portal/volunteer", icon: LuHandHeart, desc: "Shift rosters, QR check-in & SOS alerts" },
    { title: "Institutional / B2B", path: "/portal/corporate", icon: LuBuilding2, desc: "Corporate & School bulk roster uploads" },
    { title: "Expo & Vendors", path: "/portal/vendor", icon: LuStore, desc: "Interactive booth map & exhibitor passes" },
    { title: "Tourism & Hotels", path: "/portal/tourism", icon: LuCompass, desc: "Rajgir stay, transit & heritage packages" },
    { title: "Admin Command Center", path: "/portal/admin", icon: LuShieldCheck, desc: "Race day operations, RFID timing & finances" },
  ];

  return (
    <div className="flex min-h-screen w-full flex-col bg-white font-manrope text-charcoal-900">
      <SiteHeader />
      <main className="flex-1 bg-surface-soft">
        <div className="mx-auto w-full max-w-[1180px] px-4 pb-16 pt-6 sm:px-6 lg:px-8">
          <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Preview" }]} />
          <PageHero
            eyebrow={<Badge>Stakeholder preview environment</Badge>}
            title="Platform modules"
            subtitle="Rajgir Marathon Platform v1.0. Modules below are in progress."
          >
            <div className="flex flex-wrap gap-3">
              <LinkButton href="/" variant="secondary" size="md">
                Real marathon home
              </LinkButton>
              <LinkButton href="/coming-soon" variant="secondary" size="md">
                Public coming soon view
              </LinkButton>
              <Button type="button" variant="secondary" size="md" icon={LuLogOut} onClick={handleLogout}>
                Lock and exit
              </Button>
            </div>
          </PageHero>

          <Notice tone="success" title="Preview session active" className="mb-8">
            You are authenticated. The Coming Soon page remains active for public visitors, while you can inspect and build
            all internal pages here. <span className="font-mono text-xs">ENV: COMING_SOON=true</span>
          </Notice>

          <h2 className="mb-4 text-base font-bold text-charcoal-900">Platform modules architecture (in progress)</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {portalModules.map((mod) => {
              const Icon = mod.icon;
              return (
                <Card key={mod.path} className="flex flex-col justify-between">
                  <div>
                    <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-[10px] bg-brand-red-light text-brand-red">
                      <Icon className="h-5 w-5" aria-hidden />
                    </span>
                    <h3 className="text-base font-bold text-charcoal-900">{mod.title}</h3>
                    <p className="mt-1 text-sm text-charcoal-600">{mod.desc}</p>
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-charcoal-200 pt-3 text-xs font-semibold text-charcoal-500">
                    <span className="inline-flex items-center gap-1.5">
                      <LuCircleCheck className="h-4 w-4" aria-hidden />
                      Ready for scaffolding
                    </span>
                    <LuArrowRight className="h-4 w-4" aria-hidden />
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
