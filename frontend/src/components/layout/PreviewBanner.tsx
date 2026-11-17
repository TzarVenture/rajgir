"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LuEye, LuLogOut } from "react-icons/lu";

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
    <div className="sticky top-0 z-50 flex w-full flex-wrap items-center justify-between gap-3 border-b border-[#FCD34D] bg-[#FEF3C7] px-4 py-2 text-xs text-[#78350F]">
      <div className="flex items-center gap-2">
        <span aria-hidden className="h-2 w-2 rounded-full bg-[#B45309]" />
        <span className="font-semibold">Stakeholder preview environment</span>
        <span aria-hidden className="hidden md:inline">|</span>
        <span className="hidden md:inline">Public visitors see the Coming Soon page</span>
      </div>

      <div className="flex items-center gap-2">
        <Link
          href="/coming-soon"
          className="flex items-center gap-1.5 rounded-btn px-2.5 py-1 font-semibold hover:bg-[#FDE68A]"
        >
          <LuEye className="h-3.5 w-3.5" aria-hidden />
          <span>View Public Coming Soon</span>
        </Link>
        <Link href="/wip" className="rounded-btn px-2.5 py-1 font-semibold hover:bg-[#FDE68A]">
          Modules Roadmap
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          disabled={loggingOut}
          className="flex cursor-pointer items-center gap-1.5 rounded-btn border border-[#B45309] px-2.5 py-1 font-semibold hover:bg-[#FDE68A] disabled:opacity-50"
        >
          <LuLogOut className="h-3.5 w-3.5" aria-hidden />
          <span>{loggingOut ? "Exiting..." : "Lock & Exit"}</span>
        </button>
      </div>
    </div>
  );
}
