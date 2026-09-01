import { Suspense } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { SchedulingTabs } from "@/components/scheduling/scheduling-tabs";
import { MasterScheduleTable } from "@/components/scheduling/master-schedule-table";

// Never statically cache this page — it computes "today" server-side
// and must reflect the real current date on every request, not whatever
// date happened to be current at the last build/deploy.
export const dynamic = "force-dynamic";

export default function MasterSchedulePage() {
  return (
    <>
      <PageHeader
        title="Master Schedule"
        description="The single source of truth for project planning. Every other schedule view is generated automatically from this data."
      />
      <SchedulingTabs />
      <Suspense fallback={null}>
        <MasterScheduleTable />
      </Suspense>
    </>
  );
}
