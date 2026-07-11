import { PageHeader } from "@/components/layout/page-header";
import { SchedulingTabs } from "@/components/scheduling/scheduling-tabs";
import { WeeklyScheduleGrid } from "@/components/scheduling/weekly-schedule-grid";
import { PrintButton } from "@/components/shared/print-button";

export default function WeeklySchedulePage() {
  return (
    <>
      <PageHeader
        title="Weekly Schedule"
        description="The operational work plan distributed to field supervisors — color-coded per day, generated from the Master Schedule."
        actions={<PrintButton />}
      />
      <SchedulingTabs />
      <WeeklyScheduleGrid />
    </>
  );
}
