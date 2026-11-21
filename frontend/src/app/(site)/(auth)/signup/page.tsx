import { redirect } from "next/navigation";
import { api } from "@/lib/api";
import { homePath } from "@/lib/auth/paths";
import { clientContext, getCurrentUser, getPendingRegistration } from "@/lib/auth/session";
import SignupForm from "./SignupForm";

export const metadata = { title: "Create account | Rajgir Marathon" };

export default async function SignupPage() {
  const user = await getCurrentUser();
  if (user) redirect(homePath(user));

  const pending = await getPendingRegistration();

  // Default to "required" if the backend cannot be reached.
  const config = await api.auth.config(await clientContext());
  return (
    <SignupForm
      withVerification={config.data?.requireEmailVerification ?? true}
      initialValues={pending ?? undefined}
    />
  );
}
