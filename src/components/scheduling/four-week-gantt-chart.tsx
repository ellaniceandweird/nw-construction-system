"use client";

import { Printer } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useActivities } from "@/hooks/use-activities";
import { useProjects } from "@/hooks/use-projects";
import { generateLookahead4 } from "@/lib/scheduling/generate";
import { openPrintWindow } from "@/lib/estimating/print-window";
import { buildLookaheadGanttHtml } from "@/lib/scheduling/print-lookahead-gantt";
import { cn } from "@/lib/utils";

const DAY_MS = 24 * 60 * 60 * 1000;
const WINDOW_DAYS = 28;

const BAR_COLOR: Record<string, string> = {
  completed: "bg-success",
  in_progress: "bg-primary",
  delayed: "bg-destructive",
  blocked: "bg-destructive",
  not_started: "bg-muted-foreground/40",
  ready: "bg-primary",
};

function parseDate(d: string) {
  return new Date(d + "T00:00:00");
}

function formatShort(d: Date) {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function FourWeekGanttChart({ referenceDate }: { referenceDate: Date }) {
  const projects = useProjects();
  const activities = useActivities();
  const windowStart = new Date(referenceDate);
  windowStart.setHours(0, 0, 0, 0);
  const windowEnd = new Date(windowStart.getTime() + WINDOW_DAYS * DAY_MS);

  const items = generateLookahead4(activities, referenceDate);

  // Week column markers for the header ruler
  const weekMarkers = Array.from({ length: 4 }, (_, i) => {
    const weekStart = new Date(windowStart.getTime() + i * 7 * DAY_MS);
    return { label: formatShort(weekStart), leftPercent: (i * 7 * 100) / WINDOW_DAYS };
  });

  function handlePrint() {
    const groups = projects
      .filter((p) => items.some((item) => activities.find((a) => a.id === item.activityId)?.projectId === p.id))
      .map((project) => {
        const projectItems = items.filter(
          (item) => activities.find((a) => a.id === item.activityId)?.projectId === project.id
        );
        return {
          projectName: project.projectName,
          items: projectItems.map((item) => {
            const activity = activities.find((a) => a.id === item.activityId);
            const start = parseDate(item.plannedStart);
            const end = parseDate(item.plannedFinish);
            const clampedStart = start < windowStart ? windowStart : start;
            const clampedEnd = end > windowEnd ? windowEnd : end;
            const leftPercent = ((clampedStart.getTime() - windowStart.getTime()) / DAY_MS / WINDOW_DAYS) * 100;
            const widthPercent = ((clampedEnd.getTime() - clampedStart.getTime()) / DAY_MS / WINDOW_DAYS) * 100;
            return {
              label: item.description,
              sublabel: `${formatShort(start)} – ${formatShort(end)} (${activity?.percentComplete ?? 0}%)`,
              leftPercent,
              widthPercent,
              status: activity?.status ?? "not_started",
              isSubActivity: !!activity?.parentActivityId,
            };
          }),
        };
      });
    openPrintWindow("4-Week Lookahead", buildLookaheadGanttHtml("4-Week Lookahead", weekMarkers, groups));
  }

  return (
    <>
    <div className="mb-3 flex justify-end print:hidden">
      <Button variant="outline" onClick={handlePrint}>
        <Printer className="size-3.5" /> Print
      </Button>
    </div>
    <div className="overflow-x-auto rounded-xl border border-border bg-card print:hidden">
      <div className="min-w-[900px]">
        {/* Header ruler */}
        <div className="flex border-b border-border">
          <div className="w-64 shrink-0 border-r border-border px-4 py-2.5 text-xs font-medium text-muted-foreground">
            Activity
          </div>
          <div className="relative h-9 flex-1">
            {weekMarkers.map((w) => (
              <div
                key={w.label}
                className="absolute top-0 h-full border-l border-border px-2 py-2.5 text-xs font-medium text-muted-foreground"
                style={{ left: `${w.leftPercent}%` }}
              >
                Week of {w.label}
              </div>
            ))}
          </div>
        </div>

        {/* Rows */}
        {items.map((item) => {
          const activity = activities.find((a) => a.id === item.activityId);
          const project = projects.find((p) => p.id === activity?.projectId);

          const start = parseDate(item.plannedStart);
          const end = parseDate(item.plannedFinish);
          const clampedStart = start < windowStart ? windowStart : start;
          const clampedEnd = end > windowEnd ? windowEnd : end;

          const leftPercent = ((clampedStart.getTime() - windowStart.getTime()) / DAY_MS / WINDOW_DAYS) * 100;
          const widthPercent = Math.max(
            2,
            ((clampedEnd.getTime() - clampedStart.getTime()) / DAY_MS / WINDOW_DAYS) * 100
          );

          const color = BAR_COLOR[activity?.status ?? "not_started"];

          return (
            <div key={item.activityId} className="flex border-b border-border/60 last:border-0">
              <div className="w-64 shrink-0 border-r border-border px-4 py-3">
                <p className="truncate text-sm font-semibold text-foreground">{project?.projectName}</p>
                <p className="truncate text-xs text-muted-foreground">{item.description}</p>
              </div>
              <div className="relative flex-1 py-3">
                {/* week gridlines */}
                {weekMarkers.map((w) => (
                  <div
                    key={w.label}
                    className="absolute top-0 h-full border-l border-border/40"
                    style={{ left: `${w.leftPercent}%` }}
                  />
                ))}
                <div
                  className={cn("absolute h-5 rounded-md", color)}
                  style={{
                    left: `${leftPercent}%`,
                    width: `${widthPercent}%`,
                    top: "50%",
                    transform: "translateY(-50%)",
                  }}
                  title={`${item.description}: ${formatShort(start)} – ${formatShort(end)} (${activity?.percentComplete ?? 0}%)`}
                />
              </div>
            </div>
          );
        })}

        {items.length === 0 && (
          <div className="px-4 py-10 text-center text-muted-foreground">
            No activities fall within the next 4 weeks.
          </div>
        )}
      </div>
    </div>
    </>
  );
}
