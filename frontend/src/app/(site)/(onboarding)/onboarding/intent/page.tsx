import { redirect } from "next/navigation";

/** Old role-picker address. Roles now come from registrations, so send people to the registration chooser. */
export default function LegacyIntentPage() {
  redirect("/register");
}
