"use client";
import * as React from "react";
import { createClient } from "@/lib/supabase/client";
import { MOCK_CURRENT_USER, type CurrentUser } from "@/lib/constants/current-user";

/**
 * Returns the real signed-in Supabase user, reshaped into the same
 * CurrentUser shape the rest of the app already expects — every
 * component built before this still works unchanged. Role now comes
 * from the real "profiles" table (set in Settings > Users), falling
 * back to a broad default if that row hasn't loaded yet or doesn't
 * exist (shouldn't happen once the profiles trigger is set up).
 */
export function useCurrentUser(): CurrentUser {
  const [user, setUser] = React.useState<CurrentUser>(MOCK_CURRENT_USER);

  React.useEffect(() => {
    const supabase = createClient();

    async function loadUser(authUser: { id: string; email?: string; user_metadata?: Record<string, unknown> }) {
      const { data: profile } = await supabase.from("profiles").select("role").eq("id", authUser.id).single();
      setUser({
        id: authUser.id,
        name: (authUser.user_metadata?.full_name as string) ?? authUser.email ?? "Unknown",
        email: authUser.email ?? "",
        role: (profile?.role as CurrentUser["role"]) ?? "operations_manager",
        avatarUrl: authUser.user_metadata?.avatar_url as string | undefined,
        assignedProjectIds: [],
      });
    }

    supabase.auth.getUser().then(({ data }) => {
      if (data.user) loadUser(data.user);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) loadUser(session.user);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  return user;
}
