"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { MOCK_ACTIVITIES } from "@/lib/data/mock/activities";
import { MOCK_PROJECTS } from "@/lib/data/mock/projects";
import { generateWeeklySchedule } from "@/lib/scheduling/generate";
import type { WeeklyScheduleColor } from "@/types/scheduling";

const TODAY = new Date("2026-07-10");
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;
const DAY_KEYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

const COLOR_CLASS: Record<WeeklyScheduleColor, string> = {
  complete: "bg-success-soft text-success",
  in_progress: "bg-primary-soft text-primary",
  upcoming: "bg-warning-soft text-warning-foreground",
  delayed: "bg-destructive-soft text-destructive",
  not_started: "bg-transparent",
  blocked: "bg-destructive text-destructive-foreground",
};

function startOfWeek(date: Date) {
  const d = new Date(date);
  const day = d.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diffToMonday);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatDate(d: Date) {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function WeeklyScheduleGrid() {
  const [weekOffset, setWeekOffset] = React.useState(0);

  const weekStart = new Date(startOfWeek(TODAY).getTime() + weekOffset * WEEK_MS);
  const weekEnd = new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000);

  const entries = generateWeeklySchedule(MOCK_ACTIVITIES, weekStart, TODAY);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon" onClick={() => setWeekOffset((v) => v - 1)}>
          <ChevronLeft className="size-4" />
        </Button>
        <span className="text-sm font-medium text-foreground">
          {formatDate(weekStart)} – {formatDate(weekEnd)}, {weekStart.getFullYear()}
        </span>
        <Button variant="outline" size="icon" onClick={() => setWeekOffset((v) => v + 1)}>
          <ChevronRight className="size-4" />
        </Button>
        {weekOffset !== 0 && (
          <Button variant="ghost" size="sm" onClick={() => setWeekOffset(0)}>
            Back to current week
          </Button>
        )}
      </div>

      <Card className="overflow-x-auto py-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th className="px-4 py-3 font-medium">Project</th>
              <th className="px-4 py-3 font-medium">Task</th>
              <th className="px-4 py-3 font-medium">Crew</th>
              {DAY_LABELS.map((label) => (
                <th key={label} className="px-2 py-3 text-center font-medium">
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => {
              const activity = MOCK_ACTIVITIES.find((a) => a.id === entry.activityId);
              const project = MOCK_PROJECTS.find((p) => p.id === activity?.projectId);
              return (
                <tr key={entry.activityId} className="border-b border-border/60 last:border-0">
                  <td className="px-4 py-3 font-medium text-foreground">{project?.projectName ?? "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{entry.taskDescription}</td>
                  <td className="px-4 py-3 text-muted-foreground">{entry.crew ?? "—"}</td>
                  {DAY_KEYS.map((key) => {
                    const color = entry.dailyAllocation[key];
                    return (
                      <td key={key} className="px-1 py-2 text-center">
                        {color && (
                          <span
                            className={cn(
                              "inline-block h-6 w-full min-w-8 rounded",
                              COLOR_CLASS[color]
                            )}
                            title={color.replace("_", " ")}
                          />
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
            {entries.length === 0 && (
              <tr>
                <td colSpan={10} className="px-4 py-10 text-center text-muted-foreground">
                  No scheduled work this week.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>

      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
        <span className="font-medium text-foreground">Legend:</span>
        {(Object.keys(COLOR_CLASS) as WeeklyScheduleColor[])
          .filter((c) => c !== "not_started")
          .map((c) => (
            <span key={c} className="flex items-center gap-1.5">
              <span className={cn("size-2.5 rounded-full", COLOR_CLASS[c])} />
              {c.replace("_", " ")}
            </span>
          ))}
      </div>
    </div>
  );
}
