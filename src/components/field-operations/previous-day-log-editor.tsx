"use client";

import * as React from "react";
import { History } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MOCK_PROJECTS } from "@/lib/data/mock/projects";
import { useDailyLogs } from "@/hooks/use-daily-logs";
import { getMostRecentLog } from "@/lib/field-operations/daily-log-store";
import { EditableTimeEntriesTable } from "@/components/field-operations/editable-time-entries-table";

interface Props {
  /** The date of the log currently being created/viewed — the previous log is whatever came before this. */
  currentDate: string;
}

function formatDate(d: string) {
  return new Date(d + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
}

export function PreviousDayLogEditor({ currentDate }: Props) {
  const allLogs = useDailyLogs();

  const previousLog = React.useMemo(
    () => (currentDate ? getMostRecentLog(currentDate) : undefined),
    [currentDate, allLogs]
  );

  if (!currentDate || !previousLog) return null;

  const project = MOCK_PROJECTS.find((p) => p.id === previousLog.projectId);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="size-4" /> Previous Day&apos;s Log — {formatDate(previousLog.date)}
        </CardTitle>
        <p className="mt-1 text-xs text-muted-foreground">
          {project?.projectName ?? "—"} · Edits here save immediately since this log is already
          saved — fix a missed hour or add something you forgot without leaving this page.
        </p>
      </CardHeader>
      <CardContent>
        <EditableTimeEntriesTable log={previousLog} />
      </CardContent>
    </Card>
  );
}
