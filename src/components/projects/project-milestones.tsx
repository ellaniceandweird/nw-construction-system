"use client";

import { CheckCircle2, Circle } from "lucide-react";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useMilestones } from "@/hooks/use-milestones";

function formatDate(d?: string) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function ProjectMilestones({ projectId }: { projectId: string }) {
  const allMilestones = useMilestones();
  const milestones = allMilestones.filter((m) => m.projectId === projectId);

  if (milestones.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Milestones</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          No milestones recorded for this project yet.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Milestones</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {milestones.map((m) => {
          const complete = !!m.actualDate;
          return (
            <div key={m.id} className="flex items-start gap-2.5 text-sm">
              {complete ? (
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" />
              ) : (
                <Circle className="mt-0.5 size-4 shrink-0 text-muted-foreground/50" />
              )}
              <div className="flex flex-1 flex-col">
                <span className="font-medium text-foreground">{m.name}</span>
                <span className="text-xs text-muted-foreground">
                  Planned: {formatDate(m.plannedDate)}
                  {complete && ` · Actual: ${formatDate(m.actualDate)}`}
                </span>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
