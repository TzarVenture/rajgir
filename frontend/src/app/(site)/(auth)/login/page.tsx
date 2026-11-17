import { redirect } from "next/navigation";
import { homePath } from "@/lib/auth/paths";
import { getCurrentUser } from "@/lib/auth/session";
import LoginForm from "./LoginForm";

export const metadata = { title: "Log in | Rajgir Marathon" };

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect(homePath(user));
  return <LoginForm />;
}
