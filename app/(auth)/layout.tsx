import Link from "next/link";
import { notFound } from "next/navigation";
import { isMockAuthEnabled } from "@/lib/auth/config";

// Read COMING_SOON at request time, not at build time, so the launch switch takes effect without a rebuild.
export const dynamic = "force-dynamic";

export default function AuthLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  // Sign-in is served only in coming-soon mode. At launch these routes 404 until real auth is wired in.
  if (!isMockAuthEnabled()) notFound();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-6 flex justify-center">
          <img src="/images/rajgir_new_logo.png" alt="Rajgir Marathon" className="h-16 w-auto object-contain" />
        </Link>
        {children}
      </div>
    </div>
  );
}
