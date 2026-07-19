import { PageHeader } from "@/components/layout/page-header";
import { SchedulingTabs } from "@/components/scheduling/scheduling-tabs";
import { SixteenWeekGanttChart } from "@/components/scheduling/sixteen-week-gantt-chart";
import { PrintButton } from "@/components/shared/print-button";

const TODAY = new Date("2026-07-10");

export default function Lookahead16Page() {
  return (
    <>
      <PageHeader
        title="16-Week Lookahead"
        description="Every activity planned to start or finish in the next 16 weeks — generated automatically from the Master Schedule, not edited here."
        actions={<PrintButton />}
      />
      <SchedulingTabs />
      <SixteenWeekGanttChart referenceDate={TODAY} />

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
        <span className="flex items-center gap-1.5">
          <span className="size-3 rounded-md ring-2 ring-foreground/60" />
          Critical Path
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-destructive" />
          High AI Risk
        </span>
      </div>
    </>
  );
}
