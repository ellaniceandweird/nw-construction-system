"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight, Users, HardHat, Briefcase, AlertTriangle, MessageSquare, Printer, ImageDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useActivities } from "@/hooks/use-activities";
import type { Activity } from "@/types/scheduling";
import type { Project } from "@/types/project";
import { useProjects } from "@/hooks/use-projects";
import { getCrewCapacityForDay, getWorkType, type WorkType } from "@/lib/scheduling/capacity";
import { generateDailyFieldUpdateText } from "@/lib/scheduling/daily-field-update";
import { DailyFieldUpdateDialog } from "@/components/scheduling/daily-field-update-dialog";
import { openPrintWindow } from "@/lib/estimating/print-window";
import { buildDailyWorkPlanHtml } from "@/lib/scheduling/print-daily-work-plan";
import { generateDailyWorkPlanImage } from "@/lib/scheduling/generate-daily-work-plan-image";
import { getTodayInNewYork } from "@/lib/date/today";

const DAY_MS = 24 * 60 * 60 * 1000;

function formatDate(d: Date) {
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

const CARD_PALETTE = [
  "bg-primary-soft border-primary/20",
  "bg-success-soft border-success/20",
  "bg-warning-soft border-warning/20",
  "bg-info-soft border-info/20",
];

function JobCard({
  number,
  activity,
  crewCount,
  projects,
}: {
  number: number;
  activity: Activity;
  crewCount: number;
  projects: Project[];
}) {
  const project = projects.find((p) => p.id === activity.projectId);
  const workType = getWorkType(activity);
  const palette = CARD_PALETTE[(number - 1) % CARD_PALETTE.length];

  return (
    <div className={`flex items-start gap-4 rounded-2xl border p-5 shadow-sm ${palette}`}>
      <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-card text-lg font-bold text-foreground shadow-sm">
        {number}
      </div>
      <div className="flex flex-1 flex-col gap-2">
        <h3 className="text-lg font-semibold leading-snug text-foreground">
          {project?.projectName ?? "—"}
        </h3>
        <p className="text-base text-muted-foreground">{activity.name}</p>

        <div className="mt-1 flex flex-wrap items-center gap-3">
          <span className="flex items-center gap-1.5 rounded-full bg-card px-3 py-1 text-sm font-medium text-foreground shadow-sm">
            <Users className="size-4" />
            {crewCount} {crewCount === 1 ? "person" : "people"}
          </span>
          <Badge
            className={
              workType === "internal"
                ? "bg-card text-primary border-transparent text-sm py-1 shadow-sm"
                : "bg-card text-info-foreground border-transparent text-sm py-1 shadow-sm"
            }
          >
            {workType === "internal" ? (
              <>
                <HardHat className="mr-1 size-3.5" /> Our Crew
              </>
            ) : (
              <>
                <Briefcase className="mr-1 size-3.5" /> Subcontractor
              </>
            )}
          </Badge>
        </div>
      </div>
    </div>
  );
}

export function DailyWorkPlanView() {
  const TODAY = getTodayInNewYork();
  const projects = useProjects();
  const activities = useActivities();
  const [dayOffset, setDayOffset] = React.useState(0);
  const [workTypeFilter, setWorkTypeFilter] = React.useState<WorkType | "all">("all");
  const [updateDialogOpen, setUpdateDialogOpen] = React.useState(false);
  const [selectedActivityIds, setSelectedActivityIds] = React.useState<Set<string>>(new Set());

  const date = new Date(TODAY.getTime() + dayOffset * DAY_MS);
  const capacity = getCrewCapacityForDay(activities, date);

  const filteredScheduled = capacity.scheduled.filter(
    (s) => workTypeFilter === "all" || getWorkType(s.activity) === workTypeFilter
  );

  // Defaults to everything selected whenever the visible list changes
  // (switching days, changing the work-type filter) — so by default the
  // generated image/reminder match what's on screen, unless someone
  // explicitly deselects something for that day.
  React.useEffect(() => {
    setSelectedActivityIds(new Set(filteredScheduled.map((s) => s.activity.id)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dayOffset, workTypeFilter, activities.length]);

  function toggleActivitySelection(activityId: string) {
    setSelectedActivityIds((prev) => {
      const next = new Set(prev);
      if (next.has(activityId)) next.delete(activityId);
      else next.add(activityId);
      return next;
    });
  }

  const selectedScheduled = filteredScheduled.filter((s) => selectedActivityIds.has(s.activity.id));

  const fieldUpdateText = generateDailyFieldUpdateText(date, selectedScheduled, projects);

  function handlePrint() {
    const rows = [
      ...capacity.scheduled.map((s) => {
        const project = projects.find((p) => p.id === s.activity.projectId);
        return {
          projectName: project?.projectName ?? "—",
          taskName: s.activity.name,
          crew: s.assignedCrew,
          workType: getWorkType(s.activity),
          statusLabel: "Scheduled",
          statusTone: "scheduled" as const,
        };
      }),
      ...capacity.deferred.map((d) => {
        const project = projects.find((p) => p.id === d.activity.projectId);
        return {
          projectName: project?.projectName ?? "—",
          taskName: d.activity.name,
          crew: d.neededCrew,
          workType: getWorkType(d.activity),
          statusLabel: "Needs more crew",
          statusTone: "needs_crew" as const,
        };
      }),
    ];
    openPrintWindow("Daily Work Plan", buildDailyWorkPlanHtml(formatDate(date), rows));
  }

  function handleGenerateImage() {
    generateDailyWorkPlanImage(date, selectedScheduled, projects);
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-3 print:hidden">
        <Button variant="outline" size="icon" onClick={() => setDayOffset((v) => v - 1)}>
          <ChevronLeft className="size-4" />
        </Button>
        <span className="text-xl font-semibold text-foreground">{formatDate(date)}</span>
        <Button variant="outline" size="icon" onClick={() => setDayOffset((v) => v + 1)}>
          <ChevronRight className="size-4" />
        </Button>
        {dayOffset !== 0 && (
          <Button variant="ghost" size="sm" onClick={() => setDayOffset(0)}>
            Back to today
          </Button>
        )}
        <Button variant="outline" size="sm" onClick={handlePrint}>
          <Printer className="size-3.5" /> Print
        </Button>
        <Button variant="outline" size="sm" onClick={handleGenerateImage}>
          <ImageDown className="size-3.5" /> Generate Image for Pedro
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="ml-auto"
          onClick={() => setUpdateDialogOpen(true)}
        >
          <MessageSquare className="size-3.5" /> Generate Daily Update for Pedro
        </Button>
      </div>
      <h2 className="hidden text-lg font-semibold print:block">Daily Work Plan — {formatDate(date)}</h2>

      {/* Crew capacity banner — automation layer against the real 8-person crew limit */}
      <div
        className={`flex items-center gap-3 rounded-xl border p-4 text-sm ${
          capacity.isOverCapacity
            ? "border-destructive/30 bg-destructive-soft text-destructive"
            : "border-success/30 bg-success-soft text-success"
        }`}
      >
        {capacity.isOverCapacity ? (
          <AlertTriangle className="size-5 shrink-0" />
        ) : (
          <Users className="size-5 shrink-0" />
        )}
        <span className="font-medium">
          {capacity.totalRequired} of {capacity.totalAvailable} crew needed today
          {capacity.isOverCapacity && " — not enough people for everything below"}
        </span>
      </div>

      {/* Internal / Subcontractor filter */}
      <div className="flex gap-2 print:hidden">
        {(["all", "internal", "subcontractor"] as const).map((opt) => (
          <button
            key={opt}
            onClick={() => setWorkTypeFilter(opt)}
            className={
              workTypeFilter === opt
                ? "rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
                : "rounded-full border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-accent"
            }
          >
            {opt === "all" ? "All Work" : opt === "internal" ? "Our Crew" : "Subcontractors"}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3 print:hidden">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground">Today&apos;s Jobs</h2>
          <span className="text-xs text-muted-foreground">
            Uncheck anything that shouldn&apos;t appear in the generated image or reminder for Pedro
          </span>
        </div>
        {filteredScheduled.length === 0 && (
          <p className="rounded-xl border border-dashed border-border p-8 text-center text-muted-foreground">
            Nothing planned for this day.
          </p>
        )}
        {filteredScheduled.map((s, i) => (
          <div key={s.activity.id} className="flex items-start gap-3">
            <Checkbox
              className="mt-4"
              checked={selectedActivityIds.has(s.activity.id)}
              onCheckedChange={() => toggleActivitySelection(s.activity.id)}
            />
            <div className="flex-1">
              <JobCard number={i + 1} activity={s.activity} crewCount={s.assignedCrew} projects={projects} />
            </div>
          </div>
        ))}
      </div>

      {capacity.deferred.length > 0 && (
        <div className="flex flex-col gap-3 print:hidden">
          <h2 className="flex items-center gap-2 text-base font-semibold text-destructive">
            <AlertTriangle className="size-4" />
            Needs More Crew — Reschedule or Add Help
          </h2>
          {capacity.deferred.map((d) => {
            const project = projects.find((p) => p.id === d.activity.projectId);
            return (
              <div
                key={d.activity.id}
                className="flex items-center justify-between rounded-2xl border border-dashed border-destructive/40 bg-destructive-soft/40 p-4"
              >
                <div>
                  <p className="font-semibold text-foreground">{project?.projectName}</p>
                  <p className="text-sm text-muted-foreground">{d.activity.name}</p>
                </div>
                <span className="text-sm font-medium text-destructive">
                  Needs {d.neededCrew} people
                </span>
              </div>
            );
          })}
        </div>
      )}


      <DailyFieldUpdateDialog
        open={updateDialogOpen}
        onOpenChange={setUpdateDialogOpen}
        text={fieldUpdateText}
        title="Daily Field Update for Pedro"
        recipientLabel="the group text with Pedro"
      />
    </div>
  );
}
