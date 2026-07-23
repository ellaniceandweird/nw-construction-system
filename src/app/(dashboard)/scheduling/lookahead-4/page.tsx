import { PageHeader } from "@/components/layout/page-header";
import { SchedulingTabs } from "@/components/scheduling/scheduling-tabs";
import { FourWeekGanttChart } from "@/components/scheduling/four-week-gantt-chart";

const TODAY = new Date("2026-07-10");

export default function Lookahead4Page() {
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
