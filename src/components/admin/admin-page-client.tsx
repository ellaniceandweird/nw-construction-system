"use client";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

import { PageHeader } from "@/components/layout/page-header";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { UsersTable } from "@/components/admin/users-table";
import { PermissionsMatrix } from "@/components/admin/permissions-matrix";
import { AutomationRulesCard } from "@/components/admin/automation-rules-card";
import type { Profile } from "@/components/admin/users-table";

const VALID_TABS = ["users", "permissions", "automation"];

export function AdminPageClient({ profiles }: { profiles: Profile[] }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const tabParam = searchParams.get("tab");
  const activeTab = VALID_TABS.includes(tabParam ?? "") ? tabParam! : "users";

  function handleTabChange(value: string) {
    router.push(`${pathname}?tab=${value}`, { scroll: false });
  }

  return (
    <>
      <PageHeader
        title="Settings"
        description="Users, permissions, and automation rules."
      />

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
          <TabsTrigger value="automation">Automation Rules</TabsTrigger>
        </TabsList>
        <TabsContent value="users">
          <UsersTable profiles={profiles} />
        </TabsContent>
        <TabsContent value="permissions">
          <PermissionsMatrix />
        </TabsContent>
        <TabsContent value="automation">
          <AutomationRulesCard />
        </TabsContent>
      </Tabs>
    </>
  );
}
