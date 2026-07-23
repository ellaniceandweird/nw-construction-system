"use client";

import * as React from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { MessageSquare } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { MaintenanceTasksTable } from "@/components/maintenance/maintenance-tasks-table";
import { EquipmentMaintenanceTable } from "@/components/maintenance/equipment-maintenance-table";
import { MaintenanceLogView } from "@/components/maintenance/maintenance-log-view";
import { PaintLogTable } from "@/components/maintenance/paint-log-table";
import { KeyCodesTable } from "@/components/maintenance/key-codes-table";
import { MaintenanceCalendarView } from "@/components/maintenance/maintenance-calendar-view";
import { DailyFieldUpdateDialog } from "@/components/scheduling/daily-field-update-dialog";
import { useMaintenanceTasks } from "@/hooks/use-maintenance-tasks";
import { generateVinnieDailyReminderText } from "@/lib/maintenance/vinnie-daily-reminder";

export function MaintenancePageClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const tasks = useMaintenanceTasks();
  const [reminderOpen, setReminderOpen] = React.useState(false);

  const validTabs = ["general", "recurring", "paint", "keys", "calendar", "log"];
  const tabParam = searchParams.get("tab");
  const activeTab = validTabs.includes(tabParam ?? "") ? tabParam! : "general";

  function handleTabChange(value: string) {
    router.push(`${pathname}?tab=${value}`, { scroll: false });
  }

  const reminderText = generateVinnieDailyReminderText(new Date(), tasks);

  return (
    <>
      <PageHeader
        title="Maintenance"
        description="Real maintenance tickets and recurring equipment schedules across every company property."
        actions={
          <Button variant="outline" size="sm" onClick={() => setReminderOpen(true)}>
            <MessageSquare className="size-3.5" /> Generate Reminder for Vinnie
          </Button>
        }
      />

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value="general">General Maintenance</TabsTrigger>
          <TabsTrigger value="recurring">Recurring Maintenance</TabsTrigger>
          <TabsTrigger value="paint">Paint Log</TabsTrigger>
          <TabsTrigger value="keys">Key Codes</TabsTrigger>
          <TabsTrigger value="calendar">Maintenance Calendar</TabsTrigger>
          <TabsTrigger value="log">Maintenance Log</TabsTrigger>
        </TabsList>
        <TabsContent value="general">
          <MaintenanceTasksTable />
        </TabsContent>
        <TabsContent value="recurring">
          <EquipmentMaintenanceTable />
        </TabsContent>
        <TabsContent value="paint">
          <PaintLogTable />
        </TabsContent>
        <TabsContent value="keys">
          <KeyCodesTable />
        </TabsContent>
        <TabsContent value="calendar">
          <MaintenanceCalendarView />
        </TabsContent>
        <TabsContent value="log">
          <MaintenanceLogView />
        </TabsContent>
      </Tabs>

      <DailyFieldUpdateDialog
        open={reminderOpen}
        onOpenChange={setReminderOpen}
        text={reminderText}
        title="Daily Reminder for Vinnie"
        recipientLabel="a text to Vinnie"
      />
    </>
  );
}
