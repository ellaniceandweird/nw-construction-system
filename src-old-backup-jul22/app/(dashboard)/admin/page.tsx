import { createClient } from "@/lib/supabase/server";
import { AdminPageClient } from "@/components/admin/admin-page-client";
import type { Profile } from "@/components/admin/users-table";

export default async function AdminSettingsPage() {
  const supabase = await createClient();
  const { data: profiles } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: true });

  return <AdminPageClient profiles={(profiles as Profile[]) ?? []} />;
}
