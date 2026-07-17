"use client";
import * as React from "react";
import { createClient } from "@/lib/supabase/client";
import { MOCK_CURRENT_USER, type CurrentUser } from "@/lib/constants/current-user";

/**
 * Returns the real signed-in Supabase user, reshaped into the same
 * CurrentUser shape the rest of the app already expects — every
 * component built before this still works unchanged.
 *
 * Role is temporarily hardcoded to the broadest access level for every
 * real logged-in user, since there's no per-person role table yet (just
 * you and your boss for now). A "profiles" table with a role column is
 * the natural next step once more people join and role-based
 * restrictions actually need to differ between people.
 */
export function useCurrentUser(): CurrentUser {
  const [user, setUser] = React.useState<CurrentUser>(MOCK_CURRENT_USER);

  React.useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUser({
          id: data.user.id,
          name: data.user.user_metadata?.full_name ?? data.user.email ?? "Unknown",
          email: data.user.email ?? "",
          role: "system_administrator",
          avatarUrl: data.user.user_metadata?.avatar_url,
          assignedProjectIds: [],
        });
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          name: session.user.user_metadata?.full_name ?? session.user.email ?? "Unknown",
          email: session.user.email ?? "",
          role: "system_administrator",
          avatarUrl: session.user.user_metadata?.avatar_url,
          assignedProjectIds: [],
        });
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  return user;
}
