"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Role } from "@/types/roles";

export async function updateUserRole(userId: string, role: Role) {
  const supabase = await createClient();
  const { error } = await supabase.from("profiles").update({ role }).eq("id", userId);
  if (error) {
    return { error: error.message };
  }
  revalidatePath("/admin");
  return { error: null };
}
