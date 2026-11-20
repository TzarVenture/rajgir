"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  LuArrowUpRight,
  LuFileText,
  LuLifeBuoy,
  LuMail,
  LuMessageSquare,
  LuPhoneCall,
  LuX,
} from "react-icons/lu";
import { SupportFaqAccordion } from "./SupportFaqAccordion";
import { SupportTicketForm, type SupportRunnerContext } from "./SupportTicketForm";

export function DashboardSupportDrawer({
  context,
  helpdeskHref = "/dashboard/runner/support",
}: {
  context?: SupportRunnerContext;
  helpdeskHref?: string;
}) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"faqs" | "ticket">("faqs");

  useEffect(() => {
    function handleOpen() {
      setOpen(true);
    }
    window.addEventListener("open-support-drawer", handleOpen);
    return () => window.removeEventListener("open-support-drawer", handleOpen);
  }, []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && open) {
        setOpen(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open]);

  const runnerContext: SupportRunnerContext = context ?? {
    athleteName: "Registered Participant",
    email: "participant@rajgirmarathon.com",
  };

  return (
    <>
      {/* Persistent Floating Quick Support Pill (Approach B Trigger) */}
      <aside aria-label="Quick Support Helpdesk" className="fixed bottom-5 right-5 z-40">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="group flex min-h-[44px] items-center gap-2 rounded-full bg-charcoal-900 px-4 py-2.5 text-xs font-semibold text-white shadow-xl transition-all hover:bg-brand-red hover:shadow-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red active:scale-95"
        >
          <LuLifeBuoy className="h-4 w-4 text-brand-red transition-colors group-hover:text-white shrink-0 animate-spin-slow" aria-hidden />
          <span>Quick Helpdesk</span>
        </button>
      </aside>

      {/* Slide-over Drawer Backdrop & Panel */}
      {open && (
        <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-charcoal-900/50 backdrop-blur-xs transition-opacity duration-300"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />

          <div className="fixed inset-y-0 right-0 flex max-w-full pl-6">
            <div className="w-screen max-w-md sm:max-w-lg bg-white shadow-2xl flex flex-col transform transition-transform duration-300">
              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b border-charcoal-200 px-5 py-4 bg-surface-soft">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-red-light text-brand-red">
                    <LuLifeBuoy className="h-5 w-5" aria-hidden />
                  </span>
                  <div>
                    <h2 className="font-barlow text-lg font-bold text-charcoal-900 leading-tight">
                      Race Helpdesk & Support
                    </h2>
                    <p className="text-[11px] text-charcoal-500">
                      Rajgir Marathon Official Participant Desk
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-charcoal-500 hover:bg-charcoal-200 hover:text-charcoal-900 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-red"
                  aria-label="Close support drawer"
                >
                  <LuX className="h-5 w-5" aria-hidden />
                </button>
              </div>

              {/* Tab Selector */}
              <div className="flex border-b border-charcoal-200 bg-white px-5 pt-3">
                <button
                  type="button"
                  onClick={() => setActiveTab("faqs")}
                  className={`pb-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 mr-6 ${
                    activeTab === "faqs"
                      ? "border-brand-red text-brand-red"
                      : "border-transparent text-charcoal-600 hover:text-charcoal-900"
                  }`}
                >
                  <LuFileText className="h-4 w-4" aria-hidden />
                  <span>Instant Answers (FAQs)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("ticket")}
                  className={`pb-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
                    activeTab === "ticket"
                      ? "border-brand-red text-brand-red"
                      : "border-transparent text-charcoal-600 hover:text-charcoal-900"
                  }`}
                >
                  <LuMessageSquare className="h-4 w-4" aria-hidden />
                  <span>Submit Ticket</span>
                </button>
              </div>

              {/* Drawer Body (Scrollable) */}
              <div className="flex-1 overflow-y-auto p-5 space-y-5">
                {activeTab === "faqs" ? (
                  <div className="space-y-4">
                    <p className="text-xs text-charcoal-600">
                      Top race morning answers. Cannot find your query? Switch to <strong>Submit Ticket</strong>.
                    </p>
                    <SupportFaqAccordion limit={5} />
                    <div className="pt-2 text-center">
                      <button
                        type="button"
                        onClick={() => setActiveTab("ticket")}
                        className="text-xs font-semibold text-brand-red hover:underline"
                      >
                        Still have a question? Contact race directors →
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-xs text-charcoal-600">
                      Your query will be automatically linked to your registered profile for faster resolution.
                    </p>
                    <SupportTicketForm context={runnerContext} compact />
                  </div>
                )}
              </div>

              {/* Drawer Footer with Direct Helpline & Full Page Link */}
              <div className="border-t border-charcoal-200 bg-surface-soft p-4 space-y-2">
                <div className="flex items-center justify-between text-xs text-charcoal-600">
                  <span className="flex items-center gap-1.5 font-medium">
                    <LuPhoneCall className="h-3.5 w-3.5 text-brand-red" aria-hidden />
                    Helpline: +91 94310 12345
                  </span>
                  <span className="flex items-center gap-1.5 font-medium">
                    <LuMail className="h-3.5 w-3.5 text-brand-red" aria-hidden />
                    help@rajgirmarathon.com
                  </span>
                </div>

                <div className="pt-1 border-t border-charcoal-200/60 flex items-center justify-between">
                  <span className="text-[11px] text-charcoal-500">RICC Expo Desk (10am - 7pm)</span>
                  <Link
                    href={helpdeskHref}
                    onClick={() => setOpen(false)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-brand-red hover:underline"
                  >
                    <span>Open Full Helpdesk</span>
                    <LuArrowUpRight className="h-3.5 w-3.5" aria-hidden />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
