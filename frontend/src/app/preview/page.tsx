"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { LuArrowRight, LuEye, LuEyeOff, LuLoaderCircle, LuLock } from "react-icons/lu";

function PreviewLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/";

  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        router.push(redirectTo);
        router.refresh();
      } else {
        setError(data.message || "Incorrect password. Please try again.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-md p-4">
      <div className="rounded-card border border-charcoal-200 bg-white p-6 text-center sm:p-8">
        <div className="mb-4 flex justify-center">
          <img src="/images/rajgir_new_logo.png" alt="Rajgir Marathon" className="h-16 w-auto object-contain" />
        </div>

        <span className="mb-3 inline-flex items-center gap-1.5 rounded-[6px] bg-charcoal-100 px-2.5 py-1 text-xs font-semibold text-charcoal-700">
          <LuLock className="h-3.5 w-3.5" aria-hidden />
          Development preview access
        </span>

        <h1 className="mb-2 font-barlow text-3xl font-bold uppercase leading-none text-charcoal-900">Authorized access only</h1>

        <p className="mb-6 text-sm leading-relaxed text-charcoal-600">
          Please enter the client / stakeholder preview password to inspect the work-in-progress platform.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-left">
          <div>
            <label htmlFor="preview-password" className="mb-1.5 block text-sm font-semibold text-charcoal-800">
              Preview password
            </label>
            <div className="relative">
              <input
                id="preview-password"
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? "preview-error" : undefined}
                className="h-12 w-full rounded-btn border border-charcoal-300 bg-white px-4 pr-12 text-sm text-charcoal-900 outline-none transition-colors placeholder:text-charcoal-400 focus:border-brand-red focus:ring-2 focus:ring-brand-red/20 aria-[invalid=true]:border-[#DC2626]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-1 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-btn text-charcoal-500 hover:text-charcoal-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-red"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <LuEyeOff className="h-5 w-5" aria-hidden /> : <LuEye className="h-5 w-5" aria-hidden />}
              </button>
            </div>
          </div>

          {error && (
            <div
              id="preview-error"
              role="alert"
              className="rounded-card border border-[#FCA5A5] bg-[#FEE2E2] px-4 py-3 text-center text-sm font-medium text-[#7F1D1D]"
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            aria-busy={loading || undefined}
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-btn bg-brand-red px-6 text-sm font-semibold text-white transition-colors hover:bg-brand-red-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                <LuLoaderCircle className="h-4 w-4 animate-spin" aria-hidden />
                <span>Verifying...</span>
              </>
            ) : (
              <>
                <span>Enter preview</span>
                <LuArrowRight className="h-4 w-4" aria-hidden />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 border-t border-charcoal-200 pt-4 text-center">
          <Link href="/" className="inline-block text-sm font-semibold text-brand-red hover:underline">
            Back to public Coming Soon page
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function PreviewLoginPage() {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-surface-soft font-manrope text-charcoal-900">
      <Suspense fallback={<div className="text-sm text-charcoal-500">Loading...</div>}>
        <PreviewLoginContent />
      </Suspense>
    </div>
  );
}
