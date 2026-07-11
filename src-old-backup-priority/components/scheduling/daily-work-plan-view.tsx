"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight, Users, Wrench, Package } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { MOCK_ACTIVITIES } from "@/lib/data/mock/activities";
import { MOCK_PROJECTS } from "@/lib/data/mock/projects";
import { generateDailyWorkPlan } from "@/lib/scheduling/generate";

const TODAY = new Date("2026-07-10");
const DAY_MS = 24 * 60 * 60 * 1000;

function formatDate(d: Date) {
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function DailyWorkPlanView() {
  const [dayOffset, setDayOffset] = React.useState(0);

  const date = new Date(TODAY.getTime() + dayOffset * DAY_MS);
  const entries = generateDailyWorkPlan(MOCK_ACTIVITIES, date);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon" onClick={() => setDayOffset((v) => v - 1)}>
          <ChevronLeft className="size-4" />
        </Button>
        <span className="text-sm font-medium text-foreground">{formatDate(date)}</span>
        <Button variant="outline" size="icon" onClick={() => setDayOffset((v) => v + 1)}>
          <ChevronRight className="size-4" />
        </Button>
        {dayOffset !== 0 && (
          <Button variant="ghost" size="sm" onClick={() => setDayOffset(0)}>
            Back to today
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {entries.map((entry) => {
          const activity = MOCK_ACTIVITIES.find((a) => a.id === entry.activityId);
          const project = MOCK_PROJECTS.find((p) => p.id === activity?.projectId);
          return (
            <Card key={entry.activityId}>
              <CardHeader>
                <CardTitle className="text-sm">{entry.task}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2 text-sm">
                <p className="text-xs text-muted-foreground">{project?.projectName}</p>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="size-3.5" />
                  {entry.crew ?? "Unassigned"}
                  {entry.plannedWorkers ? ` · ${entry.plannedWorkers} workers` : ""}
                </div>
                {!!entry.equipment?.length && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Wrench className="size-3.5" />
                    {entry.equipment.join(", ")}
                  </div>
                )}
                {!!entry.materials?.length && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Package className="size-3.5" />
                    {entry.materials.join(", ")}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
        {entries.length === 0 && (
          <p className="col-span-full py-10 text-center text-muted-foreground">
            No work planned for this day.
          </p>
        )}
      </div>
    </div>
  );
}
