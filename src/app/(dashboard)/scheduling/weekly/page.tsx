import { PageHeader } from "@/components/layout/page-header";
import { SchedulingTabs } from "@/components/scheduling/scheduling-tabs";
import { WeeklyScheduleGrid } from "@/components/scheduling/weekly-schedule-grid";

// Never statically cache this page — it computes "today" server-side
// and must reflect the real current date on every request, not whatever
// date happened to be current at the last build/deploy.
export const dynamic = "force-dynamic";

export default function WeeklySchedulePage() {
  return (
    <>
      <PageHeader
        title="Weekly Schedule"
        description="The operational work plan distributed to field supervisors — color-coded per day, generated from the Master Schedule."
      />
      <SchedulingTabs />
      <WeeklyScheduleGrid />
    </>
  );
}
