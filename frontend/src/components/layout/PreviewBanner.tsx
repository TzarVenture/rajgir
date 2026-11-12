"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FaEye, FaSignOutAlt } from "react-icons/fa";

export default function PreviewBanner() {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch("/api/preview", { method: "DELETE" });
      router.push("/");
      router.refresh();
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <div className="w-full bg-gradient-to-r from-neutral-900 via-[#18120a] to-neutral-900 border-b border-[#cca043]/30 px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-3 sticky top-0 z-50 backdrop-blur-md">
      <div className="flex items-center gap-2">
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <span className="font-bold uppercase tracking-wider text-[#d49a37]">
          Stakeholder Preview Environment
        </span>
        <span className="hidden md:inline text-neutral-400">|</span>
        <span className="hidden md:inline text-neutral-300">
          Public visitors see the Coming Soon page
        </span>
      </div>

      <div className="flex items-center gap-2">
        <Link
          href="/coming-soon"
          className="px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-white font-semibold transition-colors flex items-center gap-1.5"
        >
          <FaEye className="text-[10px]" />
          <span>View Public Coming Soon</span>
        </Link>
        <Link
          href="/wip"
          className="px-2.5 py-1 rounded bg-[#cca043]/20 hover:bg-[#cca043]/30 text-[#e0a845] font-semibold transition-colors"
        >
          Modules Roadmap
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          disabled={loggingOut}
          className="px-2.5 py-1 rounded bg-red-600/20 hover:bg-red-600/30 text-red-400 font-semibold transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
        >
          <FaSignOutAlt className="text-[10px]" />
          <span>{loggingOut ? "Exiting..." : "Lock & Exit"}</span>
        </button>
      </div>
    </div>
  );
}

