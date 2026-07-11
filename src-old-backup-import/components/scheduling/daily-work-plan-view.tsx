"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight, Users, HardHat, Briefcase, AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MOCK_ACTIVITIES } from "@/lib/data/mock/activities";
import { MOCK_PROJECTS } from "@/lib/data/mock/projects";
import { getCrewCapacityForDay, getWorkType, type WorkType } from "@/lib/scheduling/capacity";

const TODAY = new Date("2026-07-10");
const DAY_MS = 24 * 60 * 60 * 1000;

function formatDate(d: Date) {
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

function JobCard({
  number,
  activity,
  crewCount,
}: {
  number: number;
  activity: (typeof MOCK_ACTIVITIES)[number];
  crewCount: number;
}) {
  const project = MOCK_PROJECTS.find((p) => p.id === activity.projectId);
  const workType = getWorkType(activity);

  return (
    <div className="flex items-start gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
        {number}
      </div>
      <div className="flex flex-1 flex-col gap-2">
        <h3 className="text-lg font-semibold leading-snug text-foreground">
          {project?.projectName ?? "—"}
        </h3>
        <p className="text-base text-muted-foreground">{activity.name}</p>

        <div className="mt-1 flex flex-wrap items-center gap-3">
          <span className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-sm font-medium text-foreground">
            <Users className="size-4" />
            {crewCount} {crewCount === 1 ? "person" : "people"}
          </span>
          <Badge
            className={
              workType === "internal"
                ? "bg-primary-soft text-primary border-transparent text-sm py-1"
                : "bg-info-soft text-info-foreground border-transparent text-sm py-1"
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
  const [dayOffset, setDayOffset] = React.useState(0);
  const [workTypeFilter, setWorkTypeFilter] = React.useState<WorkType | "all">("all");

  const date = new Date(TODAY.getTime() + dayOffset * DAY_MS);
  const capacity = getCrewCapacityForDay(MOCK_ACTIVITIES, date);

  const filteredScheduled = capacity.scheduled.filter(
    (s) => workTypeFilter === "all" || getWorkType(s.activity) === workTypeFilter
  );

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-3">
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
      </div>

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
      <div className="flex gap-2">
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

      <div className="flex flex-col gap-3">
        <h2 className="text-base font-semibold text-foreground">Today&apos;s Jobs</h2>
        {filteredScheduled.length === 0 && (
          <p className="rounded-xl border border-dashed border-border p-8 text-center text-muted-foreground">
            Nothing planned for this day.
          </p>
        )}
        {filteredScheduled.map((s, i) => (
          <JobCard key={s.activity.id} number={i + 1} activity={s.activity} crewCount={s.assignedCrew} />
        ))}
      </div>

      {capacity.deferred.length > 0 && (
        <div className="flex flex-col gap-3">
          <h2 className="flex items-center gap-2 text-base font-semibold text-destructive">
            <AlertTriangle className="size-4" />
            Needs More Crew — Reschedule or Add Help
          </h2>
          {capacity.deferred.map((d) => {
            const project = MOCK_PROJECTS.find((p) => p.id === d.activity.projectId);
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
    </div>
  );
}
