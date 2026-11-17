import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa";

/** Shared page frame for sign-in, sign-up, verification and onboarding screens. */
export default function AuthShell({
  children,
  width = "narrow",
}: {
  children: React.ReactNode;
  width?: "narrow" | "wide";
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12 bg-[#F8F8F6] text-[#111827] selection:bg-[#E31B23] selection:text-white relative overflow-hidden font-manrope">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-80 bg-gradient-to-b from-[#F5A623]/10 to-transparent pointer-events-none blur-3xl" />
      <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-red-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className={`w-full relative z-10 ${width === "wide" ? "max-w-3xl" : "max-w-md"}`}>
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6B7280] hover:text-[#E31B23] transition-colors"
          >
            <FaArrowLeft className="text-[10px]" />
            <span>Back to Rajgir Marathon Home</span>
          </Link>
        </div>

        <Link href="/" className="mb-8 flex flex-col items-center group">
          <img
            src="/images/mainLogo.png"
            alt="Rajgir Marathon"
            className="h-14 sm:h-16 w-auto object-contain transition-transform duration-200 group-hover:scale-105"
          />
          <span className="font-extrabold text-base tracking-wider text-[#111827] font-graduate mt-2.5">
            RAJGIR MARATHON
          </span>
          <span className="text-[10px] tracking-widest uppercase text-[#C78A12] font-bold">
            Run Through History • 2027
          </span>
        </Link>

        {children}

        <div className="mt-8 text-center text-xs text-[#9CA3AF]">
          <p>© 2027 Rajgir Marathon Digital Platform. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
