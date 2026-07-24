import { PageHeader } from "@/components/layout/page-header";
import { SchedulingTabs } from "@/components/scheduling/scheduling-tabs";
import { DailyWorkPlanView } from "@/components/scheduling/daily-work-plan-view";

export default function DailyWorkPlanPage() {
  return (
    <>
      <PageHeader
        title="Daily Work Plan"
        description="The exact work package assigned to each crew today — auto-generated from the Weekly Schedule."
      />
      <SchedulingTabs />
      <DailyWorkPlanView />
    </>
  );
}
