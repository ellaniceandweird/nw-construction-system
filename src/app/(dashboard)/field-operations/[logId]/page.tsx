"use client";

import * as React from "react";
import { useParams, notFound } from "next/navigation";
import { Cloud, Users, ClipboardList, Package, Pencil, MapPin } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useDailyLogs } from "@/hooks/use-daily-logs";
import { useProjects } from "@/hooks/use-projects";
import { EditableTimeEntriesTable } from "@/components/field-operations/editable-time-entries-table";
import { EditDailyLogDateDialog } from "@/components/field-operations/edit-daily-log-date-dialog";
import { EditDailyLogWeatherDialog } from "@/components/field-operations/edit-daily-log-weather-dialog";

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default function DailyLogDetailPage() {
  const projects = useProjects();
  const params = useParams<{ logId: string }>();
  const logs = useDailyLogs();
  const log = logs.find((l) => l.id === params.logId);
  const [editingDate, setEditingDate] = React.useState(false);
  const [editingWeather, setEditingWeather] = React.useState(false);

  if (!log) notFound();

  const projectNames = Array.from(
    new Set(
      log.timeEntries
        .map((e) => projects.find((p) => p.id === e.projectId)?.projectName)
        .filter((n): n is string => !!n)
    )
  );
  const totalHours = log.timeEntries.reduce((s, e) => s + e.regularHours + e.overtimeHours, 0);
  const totalOvertime = log.timeEntries.reduce((s, e) => s + e.overtimeHours, 0);
  const crewCount = new Set(log.timeEntries.map((e) => e.employeeId)).size;

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <PageHeader
          title={`Daily Log — ${formatDate(log.date)}`}
          description={
            projectNames.length > 0
              ? projectNames.join(", ")
              : "No projects logged yet"
          }
        />
        <Button variant="outline" size="sm" onClick={() => setEditingDate(true)}>
          <Pencil className="size-3.5" /> Edit Date
        </Button>
      </div>

      <EditDailyLogDateDialog logId={log.id} currentDate={log.date} open={editingDate} onOpenChange={setEditingDate} />
      <EditDailyLogWeatherDialog logId={log.id} currentWeather={log.weatherCondition} open={editingWeather} onOpenChange={setEditingWeather} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-info/20 bg-info-soft">
          <CardContent className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Weather</span>
              <button onClick={() => setEditingWeather(true)} className="text-muted-foreground hover:text-foreground">
                <Pencil className="size-3" />
              </button>
            </div>
            <span className="flex items-center gap-1.5 font-medium text-foreground">
              <Cloud className="size-4" />
              {log.weatherCondition.replace("_", " ")}
            </span>
          </CardContent>
        </Card>
        <Card className="border-primary/20 bg-primary-soft">
          <CardContent className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">Crew Present</span>
            <span className="flex items-center gap-1.5 font-medium text-foreground">
              <Users className="size-4" />
              {crewCount}
            </span>
          </CardContent>
        </Card>
        <Card className="border-success/20 bg-success-soft">
          <CardContent className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">Total Hours</span>
            <span className="font-medium text-foreground">
              {totalHours}h {totalOvertime > 0 && `(+${totalOvertime}h OT)`}
            </span>
          </CardContent>
        </Card>
        <Card className="border-warning/20 bg-warning-soft">
          <CardContent className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">Projects Worked</span>
            <span className="flex items-center gap-1.5 font-medium text-foreground">
              <MapPin className="size-4" />
              {projectNames.length}
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
