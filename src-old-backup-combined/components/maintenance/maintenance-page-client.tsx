"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";

import { PageHeader } from "@/components/layout/page-header";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { MaintenanceTasksTable } from "@/components/maintenance/maintenance-tasks-table";
import { EquipmentMaintenanceTable } from "@/components/maintenance/equipment-maintenance-table";
import { MaintenanceLogView } from "@/components/maintenance/maintenance-log-view";

export function MaintenancePageClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const validTabs = ["general", "recurring", "log"];
  const tabParam = searchParams.get("tab");
  const activeTab = validTabs.includes(tabParam ?? "") ? tabParam! : "general";

  function handleTabChange(value: string) {
    router.push(`${pathname}?tab=${value}`, { scroll: false });
  }

  return (
    <>
      <PageHeader
        title="Maintenance"
        description="Real maintenance tickets and recurring equipment schedules across every company property."
      />

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value="general">General Maintenance</TabsTrigger>
          <TabsTrigger value="recurring">Recurring Maintenance</TabsTrigger>
          <TabsTrigger value="log">Maintenance Log</TabsTrigger>
        </TabsList>
        <TabsContent value="general">
          <MaintenanceTasksTable />
        </TabsContent>
        <TabsContent value="recurring">
          <EquipmentMaintenanceTable />
        </TabsContent>
        <TabsContent value="log">
          <MaintenanceLogView />
        </TabsContent>
      </Tabs>
    </>
  );
}
