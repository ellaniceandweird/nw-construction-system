import { PageHeader } from "@/components/layout/page-header";
import { SchedulingTabs } from "@/components/scheduling/scheduling-tabs";
import { DailyWorkPlanView } from "@/components/scheduling/daily-work-plan-view";

// Never statically cache this page — it computes "today" server-side
// and must reflect the real current date on every request, not whatever
// date happened to be current at the last build/deploy.
export const dynamic = "force-dynamic";

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
