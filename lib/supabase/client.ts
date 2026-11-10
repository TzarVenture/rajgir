import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://aarzqkhpmiqxljwerxpa.supabase.co";
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    "sb_publishable_SOdqG44FVhzxCrkJTTNp9A_jtPprB45";

  return createBrowserClient(supabaseUrl, supabaseKey);
}

