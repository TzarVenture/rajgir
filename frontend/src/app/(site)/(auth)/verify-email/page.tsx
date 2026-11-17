import { redirect } from "next/navigation";
import { homePath } from "@/lib/auth/paths";
import { getCurrentUser } from "@/lib/auth/session";
import VerifyEmailCard from "./VerifyEmailCard";

export const metadata = { title: "Verify your email | Rajgir Marathon" };

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string; error?: string; from?: string }>;
}) {
  const user = await getCurrentUser();
  if (user?.emailVerified) redirect(homePath(user));

  const { email, error, from } = await searchParams;
  return <VerifyEmailCard email={email ?? ""} linkError={error === "link"} fromLogin={from === "login"} />;
}
