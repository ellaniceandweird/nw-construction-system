import { createBrowserClient } from "@supabase/ssr";

/**
 * Supabase client for use in Client Components (the browser). Reads the
 * public URL and publishable key from env vars — both are safe to expose,
 * since real access control lives in Row Level Security policies on the
 * database, not in keeping these values secret.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );
}
