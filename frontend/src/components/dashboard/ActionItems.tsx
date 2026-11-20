import type { ReactNode } from "react";
import Link from "next/link";
import { LuArrowRight, LuCircleCheck, LuCircleDashed, LuHourglass, LuTriangleAlert } from "react-icons/lu";
import { Badge, Card, LinkButton } from "@/components/ui";
import { cn } from "@/components/ui";

/**
 * "todo"    = the user has to do something now (shows an action link).
 * "waiting" = waiting on the organizers; nothing for the user to do yet.
 * "later"   = a future step (e.g. race-day check-in).
 * "done"    = complete.
 */
export type ActionState = "todo" | "waiting" | "later" | "done";

export interface ActionItem {
  id: string;
  title: string;
  detail: ReactNode;
  state: ActionState;
  action?: { label: string; href: string };
}

const STATE_META: Record<ActionState, { icon: typeof LuCircleCheck; badge: string; tone: "warning" | "info" | "neutral" | "success"; iconClass: string }> = {
  todo: { icon: LuTriangleAlert, badge: "Action needed", tone: "warning", iconClass: "text-[#B45309]" },
  waiting: { icon: LuHourglass, badge: "With organizers", tone: "info", iconClass: "text-[#1D4ED8]" },
  later: { icon: LuCircleDashed, badge: "Coming up", tone: "neutral", iconClass: "text-charcoal-400" },
  done: { icon: LuCircleCheck, badge: "Done", tone: "success", iconClass: "text-[#15803D]" },
};

/** Ordered steps for the participant, with pending actions first in visual weight. */
export function ActionItems({ items, title = "Your to-do list" }: { items: ActionItem[]; title?: string }) {
  const todo = items.filter((i) => i.state === "todo").length;
  const done = items.filter((i) => i.state === "done").length;

  return (
    <Card>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3 border-b border-charcoal-200 pb-3">
        <div>
          <h2 className="text-base font-bold text-charcoal-900">{title}</h2>
          <p className="mt-0.5 text-sm text-charcoal-500">
            {done} of {items.length} steps complete
            {todo ? `. ${todo} ${todo === 1 ? "needs" : "need"} your attention.` : "."}
          </p>
        </div>
        {todo ? <Badge tone="warning">{todo} pending</Badge> : <Badge tone="success">You are all set for now</Badge>}
      </div>

      <ol className="space-y-2">
        {items.map((item) => {
          const meta = STATE_META[item.state];
          return (
            <li
              key={item.id}
              className={cn(
                "flex flex-wrap items-start gap-3 rounded-card border p-3 sm:flex-nowrap",
                item.state === "todo" ? "border-[#FCD34D] bg-[#FFFBEB]" : "border-charcoal-200 bg-white"
              )}
            >
              <meta.icon className={cn("mt-0.5 h-5 w-5 shrink-0", meta.iconClass)} aria-hidden />
              <div className="min-w-0 flex-1">
                <p className={cn("font-semibold", item.state === "done" ? "text-charcoal-600" : "text-charcoal-900")}>{item.title}</p>
                <div className="mt-0.5 text-sm text-charcoal-600">{item.detail}</div>
              </div>
              <div className="flex w-full items-center justify-between gap-2 pl-8 sm:w-auto sm:flex-col sm:items-end sm:pl-0">
                <Badge tone={meta.tone}>{meta.badge}</Badge>
                {item.action && item.state !== "done" ? (
                  <Link
                    href={item.action.href}
                    className="inline-flex min-h-9 items-center gap-1 text-sm font-semibold text-brand-red hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-red"
                  >
                    {item.action.label} <LuArrowRight className="h-4 w-4" aria-hidden />
                  </Link>
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>
    </Card>
  );
}

/** Shown on a role dashboard when the account has no registration of that type yet. */
export function RegistrationMissing({ roleLabel, registerHref }: { roleLabel: string; registerHref: string }) {
  return (
    <Card className="mx-auto max-w-xl text-center">
      <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#FEF3C7] text-[#B45309]">
        <LuTriangleAlert className="h-7 w-7" aria-hidden />
      </span>
      <h1 className="font-barlow text-[28px] font-bold leading-tight text-charcoal-900">Finish your {roleLabel.toLowerCase()} registration</h1>
      <p className="mt-2 text-sm text-charcoal-600">
        Your account is set up as a {roleLabel.toLowerCase()}, but we have not received your registration form yet. Complete it to unlock your
        dashboard.
      </p>
      <div className="mt-6">
        <LinkButton href={registerHref} fullWidth iconRight={LuArrowRight}>
          Complete registration
        </LinkButton>
      </div>
    </Card>
  );
}
