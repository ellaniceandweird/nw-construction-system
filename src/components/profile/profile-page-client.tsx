"use client";
import { LogOut, Mail, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";

import { PageHeader } from "@/components/layout/page-header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/hooks/use-current-user";
import { createClient } from "@/lib/supabase/client";
import { ROLE_LABELS } from "@/types/roles";

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function ProfilePageClient() {
  const user = useCurrentUser();
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <>
      <PageHeader title="Profile" description="Your account information, signed in through Google." />

      <div className="flex flex-col gap-4 max-w-xl">
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <Avatar className="size-16">
              {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt={user.name} />}
              <AvatarFallback className="text-lg">{initials(user.name)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-lg font-semibold text-foreground">{user.name}</p>
              <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Mail className="size-3.5" /> {user.email}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ShieldCheck className="size-4" /> Access
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Role</span>
              <Badge variant="outline">{ROLE_LABELS[user.role]}</Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Every signed-in team member currently has full access — there&apos;s no
              per-person role assignment yet. That&apos;s a natural next step once more
              people join and access actually needs to differ between roles.
            </p>
          </CardContent>
        </Card>

        <Button variant="outline" className="w-fit" onClick={handleSignOut}>
          <LogOut className="size-4" /> Sign Out
        </Button>
      </div>
    </>
  );
}
