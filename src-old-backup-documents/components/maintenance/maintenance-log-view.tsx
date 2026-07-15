"use client";

import { CheckCircle2, Wrench } from "lucide-react";

import { useMaintenanceLog } from "@/hooks/use-maintenance-log";
import { Card, CardContent } from "@/components/ui/card";

function formatTimestamp(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function MaintenanceLogView() {
  const entries = useMaintenanceLog();

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        This log fills in automatically — whenever a General Maintenance task is marked
        complete, or a Recurring Maintenance record&apos;s Last Completed date is updated,
        an entry appears here. Nothing is entered manually.
      </p>

      <Card>
        <CardContent className="flex flex-col gap-3">
          {entries.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No completions logged yet. Mark a task complete or update an equipment&apos;s
              Last Completed date to see it appear here.
            </p>
          )}
          {entries.map((entry) => (
            <div key={entry.id} className="flex items-start gap-3 border-b border-border/60 pb-3 last:border-0 last:pb-0">
              {entry.type === "task_completed" ? (
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" />
              ) : (
                <Wrench className="mt-0.5 size-4 shrink-0 text-primary" />
              )}
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{entry.description}</p>
                <p className="text-xs text-muted-foreground">
                  {entry.propertyName ?? "—"} · {entry.detail}
                </p>
              </div>
              <span className="shrink-0 text-xs text-muted-foreground">
                {formatTimestamp(entry.timestamp)}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
