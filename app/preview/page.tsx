"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { FaLock, FaArrowRight, FaEye, FaEyeSlash } from "react-icons/fa";

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
    <div className="w-full max-w-md mx-auto p-6">
      <div className="rounded-2xl border border-[#cca043]/35 bg-[#0f0c09]/95 backdrop-blur-md p-6 sm:p-8 shadow-2xl text-center relative overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-24 bg-[#cca043]/20 rounded-full blur-2xl pointer-events-none" />

        {/* Logo */}
        <div className="flex justify-center mb-4">
          <img
            src="/images/rajgir_new_logo.png"
            alt="Rajgir Marathon"
            className="h-16 w-auto object-contain drop-shadow"
          />
        </div>

        {/* Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#cca043]/40 bg-[#cca043]/10 text-[#d49a37] text-[10px] font-black tracking-widest uppercase mb-3">
          <FaLock className="text-[9px]" />
          <span>DEVELOPMENT PREVIEW ACCESS</span>
        </div>

        <h1 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight mb-2">
          AUTHORIZED ACCESS ONLY
        </h1>

        <p className="text-xs text-neutral-400 mb-6 leading-relaxed">
          Please enter the client / stakeholder preview password to inspect the work-in-progress platform.
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-left">
          <div>
            <label className="block text-xs font-bold text-neutral-300 mb-1.5">
              Preview Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 pr-10 text-white placeholder:text-neutral-500 text-sm focus:outline-none focus:border-[#cca043] transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white text-xs cursor-pointer"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          {error && (
            <div className="p-2.5 rounded-lg bg-red-500/15 border border-red-500/40 text-red-300 text-xs text-center font-medium">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-[#b47a1f] via-[#d49a37] to-[#e0a845] text-white font-extrabold tracking-widest text-xs uppercase flex items-center justify-center gap-2 shadow-lg shadow-amber-950/25 hover:brightness-110 active:scale-[0.99] transition-all cursor-pointer disabled:opacity-60"
          >
            {loading ? (
              <span>VERIFYING...</span>
            ) : (
              <>
                <span>ENTER PREVIEW</span>
                <FaArrowRight className="text-xs" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-white/10 text-center">
          <Link
            href="/"
            className="text-[11px] text-neutral-400 hover:text-[#d49a37] transition-colors font-medium inline-block"
          >
            ← Back to Public Coming Soon Page
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function PreviewLoginPage() {
  return (
    <div
      style={{ fontFamily: "'Inter','Segoe UI',sans-serif" }}
      className="relative min-h-screen w-full bg-[#080604] text-white flex flex-col justify-center items-center overflow-x-hidden p-4"
    >
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[350px] bg-[#d49a37]/5 rounded-full blur-[140px] pointer-events-none" />

      <Suspense fallback={<div className="text-neutral-400 text-xs">Loading...</div>}>
        <PreviewLoginContent />
      </Suspense>
    </div>
  );
}

