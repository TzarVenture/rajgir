"use client";

import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import { FaEnvelopeOpenText } from "react-icons/fa";
import { resendVerification, type FormState } from "@/app/actions/auth";
import SubmitButton from "@/components/auth/SubmitButton";
import { Field, FormError, FormNotice, StepIndicator, cardClass, linkClass } from "@/components/auth/ui";

const COOLDOWN_SECONDS = 60;

export default function VerifyEmailCard({
  email,
  linkError,
  fromLogin,
}: {
  email: string;
  linkError: boolean;
  fromLogin: boolean;
}) {
  const [state, action] = useActionState<FormState, FormData>(resendVerification, undefined);
  const [secondsLeft, setSecondsLeft] = useState(0);

  // Start the cooldown each time an email was (re)sent.
  useEffect(() => {
    if (state?.notice) setSecondsLeft(COOLDOWN_SECONDS);
  }, [state]);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft]);

  const knownEmail = email || state?.values?.email || "";

  return (
    <div className={cardClass}>
      <StepIndicator current={2} />

      <div className="mb-5 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#FEF3C7] text-2xl text-[#C78A12]">
          <FaEnvelopeOpenText />
        </div>
        <h1 className="font-barlow text-3xl font-black uppercase tracking-tight text-[#111827]">
          {linkError ? "That link did not work" : "Check your email"}
        </h1>
        <p className="mt-2 text-sm text-[#4B5563]">
          {linkError ? (
            "The verification link is invalid or has expired. Request a new one below."
          ) : fromLogin ? (
            <>
              Please verify your email before signing in.{" "}
              {knownEmail ? (
                <>
                  We sent a link to <strong>{knownEmail}</strong>.
                </>
              ) : null}
            </>
          ) : knownEmail ? (
            <>
              We sent a verification link to <strong>{knownEmail}</strong>. Open it to activate your account.
            </>
          ) : (
            "We sent you a verification link. Open it to activate your account."
          )}
        </p>
      </div>

      <form action={action} className="space-y-4">
        {knownEmail ? (
          <input type="hidden" name="email" value={knownEmail} />
        ) : (
          <Field
            label="Email address"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            error={state?.fieldErrors?.email}
          />
        )}

        <FormNotice message={state?.notice} />
        <FormError message={state?.error} />

        {secondsLeft > 0 ? (
          <button
            type="button"
            disabled
            className="h-[48px] w-full cursor-not-allowed rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] text-sm font-bold text-[#9CA3AF]"
          >
            Resend available in {secondsLeft}s
          </button>
        ) : (
          <SubmitButton
            label={state?.notice || !linkError ? "Resend verification email" : "Send a new link"}
            pendingLabel="Sending..."
          />
        )}
      </form>

      <ul className="mt-6 space-y-1.5 rounded-lg bg-[#F9FAFB] p-4 text-xs text-[#4B5563]">
        <li>• It can take a minute to arrive. Check your spam or promotions folder.</li>
        <li>• Open the link on this device to continue straight to your next step.</li>
      </ul>

      <div className="mt-6 border-t border-[#E5E7EB] pt-5 text-center text-sm text-[#4B5563]">
        Already verified?{" "}
        <Link href="/login" className={linkClass}>
          Sign in
        </Link>
      </div>
    </div>
  );
}
