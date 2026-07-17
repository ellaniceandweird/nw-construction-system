import { Suspense } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { SchedulingTabs } from "@/components/scheduling/scheduling-tabs";
import { MasterScheduleTable } from "@/components/scheduling/master-schedule-table";
import { PrintButton } from "@/components/shared/print-button";

export default function MasterSchedulePage() {
  return (
    <>
      <PageHeader
        title="Master Schedule"
        description="The single source of truth for project planning. Every other schedule view is generated automatically from this data."
        actions={<PrintButton />}
      />
      <SchedulingTabs />
      <Suspense fallback={null}>
        <MasterScheduleTable />
      </Suspense>
    </>
  );
}
