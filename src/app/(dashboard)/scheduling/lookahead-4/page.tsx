import { PageHeader } from "@/components/layout/page-header";
import { SchedulingTabs } from "@/components/scheduling/scheduling-tabs";
import { FourWeekGanttChart } from "@/components/scheduling/four-week-gantt-chart";
import { getTodayInNewYork } from "@/lib/date/today";

// Never statically cache this page — it computes "today" server-side
// and must reflect the real current date on every request, not whatever
// date happened to be current at the last build/deploy.
export const dynamic = "force-dynamic";

export default function Lookahead4Page() {
  const TODAY = getTodayInNewYork();
  return (
    <>
      <PageHeader
        title="4-Week Lookahead"
        description="Everything starting in the next 4 weeks — generated from the Master Schedule."
      />
      <SchedulingTabs />
      <FourWeekGanttChart referenceDate={TODAY} />

      <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
        <span className="font-medium text-foreground">Legend:</span>
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-primary" />
          In Progress
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-success" />
          Completed
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-destructive" />
          Delayed / Blocked
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-muted-foreground/40" />
          Not Started
        </span>
      </div>
    </>
  );
}
