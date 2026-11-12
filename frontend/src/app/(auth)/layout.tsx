import Link from "next/link";

export const dynamic = "force-dynamic";

export default function AuthLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12 bg-[#080604] text-white selection:bg-[#cca043] selection:text-black relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-[#cca043]/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-10 w-[400px] h-[400px] bg-[#991b1b]/8 rounded-full blur-[150px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <Link href="/" className="mb-8 flex flex-col items-center group">
          <img
            src="/images/mainLogo.png"
            alt="Rajgir Marathon"
            className="h-14 sm:h-16 w-auto object-contain drop-shadow transition-transform duration-200 group-hover:scale-105"
          />
          <span className="font-extrabold text-sm sm:text-base tracking-wider text-white font-graduate mt-2">
            RAJGIR MARATHON
          </span>
          <span className="text-[10px] tracking-widest uppercase text-[#cca043] font-bold">
            Run Through History • 2027
          </span>
        </Link>
        {children}
      </div>
    </div>
  );
}
