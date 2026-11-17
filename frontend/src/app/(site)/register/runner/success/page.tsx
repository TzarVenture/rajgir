import React from "react";
import type { Metadata } from "next";
import { LuSearchX } from "react-icons/lu";
import SiteHeader from "@/components/layout/SiteHeader";
import SiteFooter from "@/components/layout/SiteFooter";
import { Card, EmptyState, LinkButton } from "@/components/ui";
import SuccessContent from "./SuccessContent";
import { getRegistrationDetails } from "@/app/actions/registerRunner";

export const metadata: Metadata = {
  title: "Registration Confirmed | Rajgir Marathon 2027",
  description: "Official digital runner confirmation pass for Rajgir Marathon 2027.",
};

export default async function RegisterSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ reg_no?: string }>;
}) {
  const { reg_no } = await searchParams;
  const registration = reg_no ? await getRegistrationDetails(reg_no) : null;

  return (
    <div className="flex min-h-screen w-full flex-col bg-white font-manrope text-charcoal-900">
      <SiteHeader />

      <main className="flex-1 bg-surface-soft px-4 py-10 sm:px-6">
        {registration ? (
          <SuccessContent registration={registration} />
        ) : (
          <Card className="mx-auto max-w-md" padded={false}>
            <div className="p-4 sm:p-6">
              <EmptyState
                icon={LuSearchX}
                title="Registration not found"
                description="We couldn't locate a registration with the provided reference number. If you just registered, please verify your email."
                action={
                  <LinkButton href="/register/runner" size="md">
                    Start new registration
                  </LinkButton>
                }
              />
            </div>
          </Card>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
