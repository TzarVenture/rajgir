import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import IntentForm from "./IntentForm";

export const metadata = { title: "Choose your role | Rajgir Marathon" };

export default async function IntentPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return <IntentForm />;
}
