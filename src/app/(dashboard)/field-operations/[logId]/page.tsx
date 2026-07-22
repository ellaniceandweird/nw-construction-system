"use client";

import { useParams, notFound } from "next/navigation";
import { Cloud, Users, ClipboardList, Package } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useDailyLogs } from "@/hooks/use-daily-logs";
import { MOCK_PROJECTS } from "@/lib/data/mock/projects";
import { EditableTimeEntriesTable } from "@/components/field-operations/editable-time-entries-table";

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default function DailyLogDetailPage() {
  const params = useParams<{ logId: string }>();
  const logs = useDailyLogs();
  const log = logs.find((l) => l.id === params.logId);

  if (!log) notFound();

  const project = MOCK_PROJECTS.find((p) => p.id === log.projectId);
  const totalHours = log.timeEntries.reduce((s, e) => s + e.regularHours + e.overtimeHours, 0);
  const totalOvertime = log.timeEntries.reduce((s, e) => s + e.overtimeHours, 0);
  const crewCount = new Set(log.timeEntries.map((e) => e.employeeId)).size;

  return (
    <>
      <PageHeader
        title={`Daily Log — ${formatDate(log.date)}`}
        description={project?.projectName ?? "—"}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <CardContent className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">Weather</span>
            <span className="flex items-center gap-1.5 font-medium text-foreground">
              <Cloud className="size-4" />
              {log.weatherCondition.replace("_", " ")}
            </span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">Crew Present</span>
            <span className="flex items-center gap-1.5 font-medium text-foreground">
              <Users className="size-4" />
              {crewCount}
            </span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">Total Hours</span>
            <span className="font-medium text-foreground">
              {totalHours}h {totalOvertime > 0 && `(+${totalOvertime}h OT)`}
            </span>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="size-4" /> Time Entries
          </CardTitle>
        </CardHeader>
        <CardContent>
          <EditableTimeEntriesTable log={log} />
        </CardContent>
      </Card>

      {(log.materialDeliveries.length > 0 || log.materialConsumption.length > 0) && (
        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
          {log.materialDeliveries.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="size-4" /> Material Deliveries
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                {log.materialDeliveries.map((d, i) => (
                  <p key={i} className="text-sm text-muted-foreground">
                    {d.itemsDelivered} — {d.quantity} ({d.status})
                  </p>
                ))}
              </CardContent>
            </Card>
          )}
          {log.materialConsumption.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="size-4" /> Material Used
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                {log.materialConsumption.map((m, i) => (
                  <p key={i} className="text-sm text-muted-foreground">
                    {m.material}: {m.quantityUsed} {m.unit} used
                  </p>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {log.generalNotes && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{log.generalNotes}</p>
          </CardContent>
        </Card>
      )}
    </>
  );
}
