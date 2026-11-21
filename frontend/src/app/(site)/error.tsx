"use client";

import Link from "next/link";
import { useEffect } from "react";

/**
 * Shown when a real-site page fails to render, most commonly because the API could not confirm the
 * session (requireUser -> AuthUnavailableError). The session cookie is left untouched, so "Try
 * again" resumes exactly where the user was once the service is back.
 */
export default function SiteError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 py-16 text-center">
      <h1 className="font-barlow text-3xl font-black uppercase tracking-tight text-[#111827]">Something went wrong</h1>
      <p className="mt-3 text-sm leading-relaxed text-[#4B5563]">
        We could not load this page right now. You are still signed in. Please try again in a moment.
      </p>
      <div className="mt-6 flex items-center gap-4">
        <button
          type="button"
          onClick={() => reset()}
          className="rounded-lg bg-[#E31B23] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#c4161d]"
        >
          Try again
        </button>
        <Link href="/" className="text-sm font-semibold text-[#6B7280] hover:text-[#111827]">
          Go to home
        </Link>
      </div>
    </main>
  );
}
