import { redirect } from "next/navigation";
import { homePath } from "@/lib/auth/paths";
import { getCurrentUser } from "@/lib/auth/session";
import { api } from "@/lib/api";
import RegisterForm from "./RegisterForm";

export const metadata = { title: "Create account | Rajgir Marathon" };

export default async function RegisterPage() {
  const user = await getCurrentUser();
  if (user) redirect(homePath(user));

  // Default to "required" if the backend cannot be reached.
  const config = await api.auth.config();
  return <RegisterForm withVerification={config.data?.requireEmailVerification ?? true} />;
}
