import { PageHeader } from "@/components/layout/page-header";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { MaintenanceTasksTable } from "@/components/maintenance/maintenance-tasks-table";
import { EquipmentMaintenanceTable } from "@/components/maintenance/equipment-maintenance-table";

export default function MaintenancePage() {
  return (
    <>
      <PageHeader
        title="Maintenance"
        description="Real maintenance tickets and recurring equipment schedules across every company property."
      />

      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">General Maintenance</TabsTrigger>
          <TabsTrigger value="recurring">Recurring Maintenance</TabsTrigger>
        </TabsList>
        <TabsContent value="general">
          <MaintenanceTasksTable />
        </TabsContent>
        <TabsContent value="recurring">
          <EquipmentMaintenanceTable />
        </TabsContent>
      </Tabs>
    </>
  );
}
