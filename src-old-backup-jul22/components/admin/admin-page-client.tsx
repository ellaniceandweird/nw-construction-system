"use client";
import { PageHeader } from "@/components/layout/page-header";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { UsersTable } from "@/components/admin/users-table";
import { PermissionsMatrix } from "@/components/admin/permissions-matrix";
import { AutomationRulesCard } from "@/components/admin/automation-rules-card";
import type { Profile } from "@/components/admin/users-table";

export function AdminPageClient({ profiles }: { profiles: Profile[] }) {
  return (
    <>
      <PageHeader
        title="Settings"
        description="Users, permissions, and automation rules."
      />

      <Tabs defaultValue="users">
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
