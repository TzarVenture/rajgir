import Link from "next/link";
import { cardClass, linkClass } from "@/components/auth/ui";
import ResetPasswordForm from "./ResetPasswordForm";

export const metadata = { title: "Choose a new password | Rajgir Marathon" };

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token_hash?: string }>;
}) {
  const { token_hash: tokenHash } = await searchParams;

  if (!tokenHash) {
    return (
      <div className={`${cardClass} text-center`}>
        <h1 className="font-barlow text-3xl font-black uppercase tracking-tight text-[#111827]">Link not valid</h1>
        <p className="mt-2 text-sm text-[#4B5563]">
          This reset link is missing or incomplete. Request a new one to continue.
        </p>
        <Link href="/forgot-password" className={`${linkClass} mt-5 inline-block text-sm`}>
          Request a new reset link
        </Link>
      </div>
    );
  }

  return <ResetPasswordForm tokenHash={tokenHash} />;
}
