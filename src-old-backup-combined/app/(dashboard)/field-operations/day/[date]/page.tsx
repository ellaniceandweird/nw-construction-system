"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Users, ExternalLink } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useDailyLogs } from "@/hooks/use-daily-logs";
import { MOCK_PROJECTS } from "@/lib/data/mock/projects";

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default function DailyRollupPage() {
  const params = useParams<{ date: string }>();
  const logs = useDailyLogs();

  const logsForDay = logs.filter((l) => l.date === params.date);
  const uniqueCrewNames = new Set(
    logsForDay.flatMap((l) => l.crewAttendance.map((c) => c.crewName))
  );
  const totalCrew = uniqueCrewNames.size;
  const totalHours = logsForDay.reduce(
    (s, l) => s + l.crewAttendance.reduce((s2, c) => s2 + c.hoursWorked, 0),
    0
  );

  return (
    <>
      <PageHeader
        title={`All Projects — ${formatDate(params.date)}`}
        description="Every crew across every project for this one day — combined for your morning call rundown."
      />

      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">Projects Active</span>
            <span className="font-medium text-foreground">{logsForDay.length}</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">Total Crew</span>
            <span className="flex items-center gap-1.5 font-medium text-foreground">
              <Users className="size-4" />
              {totalCrew}
            </span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">Total Hours</span>
            <span className="font-medium text-foreground">{totalHours}h</span>
          </CardContent>
        </Card>
      </div>

      <Card className="overflow-x-auto py-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th className="px-4 py-3 font-medium">Worker</th>
              <th className="px-4 py-3 font-medium">Trade</th>
              <th className="px-4 py-3 font-medium">Project</th>
              <th className="px-4 py-3 font-medium">Task</th>
              <th className="px-4 py-3 font-medium">Hours</th>
              <th className="px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {logsForDay.map((log) => {
              const project = MOCK_PROJECTS.find((p) => p.id === log.projectId);
              const taskSummary =
                log.activitiesPerformed.map((a) => a.description).join(", ") || "—";
              return log.crewAttendance.map((crew, i) => (
                <tr key={`${log.id}-${i}`} className="border-b border-border/60 last:border-0 hover:bg-accent/40">
                  <td className="px-4 py-3 font-medium text-foreground">{crew.crewName}</td>
                  <td className="px-4 py-3 text-muted-foreground">{crew.trade}</td>
                  <td className="px-4 py-3 text-muted-foreground">{project?.projectName ?? "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground max-w-xs">{taskSummary}</td>
                  <td className="px-4 py-3 text-muted-foreground">{crew.hoursWorked}h</td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/field-operations/${log.id}`}
                      className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                    >
                      Edit this log <ExternalLink className="size-3" />
                    </Link>
                  </td>
                </tr>
              ));
            })}
            {logsForDay.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                  No daily logs recorded for this date.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </>
  );
}
