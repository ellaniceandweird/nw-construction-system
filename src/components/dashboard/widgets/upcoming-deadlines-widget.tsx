"use client";
import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { StatusBadge, type DashboardStatus } from "@/components/shared/status-badge";
import { useProjects } from "@/hooks/use-projects";
import { useMaintenanceTasks } from "@/hooks/use-maintenance-tasks";
import type { ProjectCalculatedStatus } from "@/types/project";
import type { MaintenanceTaskStatus } from "@/types/maintenance";

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatCurrency(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

const PROJECT_STATUS_MAP: Record<ProjectCalculatedStatus, DashboardStatus> = {
  planning: "upcoming",
  active: "on_track",
  on_hold: "at_risk",
  delayed: "behind_schedule",
  substantially_complete: "on_track",
  closed: "completed",
  archived: "completed",
};

const PROJECT_STATUS_LABEL: Record<ProjectCalculatedStatus, string> = {
  planning: "Upcoming",
  active: "Active",
  on_hold: "On Hold",
  delayed: "Delayed",
  substantially_complete: "Substantially Complete",
  closed: "Closed",
  archived: "Archived",
};

const TASK_STATUS_MAP: Record<MaintenanceTaskStatus, DashboardStatus> = {
  not_started: "upcoming",
  working_on: "on_track",
  stuck: "at_risk",
  complete: "completed",
};

const TASK_STATUS_LABEL: Record<MaintenanceTaskStatus, string> = {
  not_started: "Not Started",
  working_on: "Working On",
  stuck: "Stuck",
  complete: "Complete",
};

interface DeadlineRow {
  key: string;
  kind: "project" | "maintenance";
  title: string;
  href: string;
  dueDate: string;
  statusTone: DashboardStatus;
  statusLabel: string;
  budget?: number;
  spent?: number;
}

export function UpcomingDeadlinesWidget() {
  const projects = useProjects();
  const maintenanceTasks = useMaintenanceTasks();

  const projectRows: DeadlineRow[] = projects
    .filter((p) => p.calculatedStatus !== "closed" && p.calculatedStatus !== "archived")
    .map((p) => ({
      key: `project-${p.id}`,
      kind: "project",
      title: p.projectName,
      href: `/projects/${p.id}`,
      dueDate: p.plannedCompletionDate,
      statusTone: PROJECT_STATUS_MAP[p.calculatedStatus],
      statusLabel: PROJECT_STATUS_LABEL[p.calculatedStatus],
      budget: p.approvedBudget,
      spent: p.actualCostToDate,
    }));

  const maintenanceRows: DeadlineRow[] = maintenanceTasks
    .filter((t) => t.taskStatus !== "complete" && !!t.plannedCompletionDate)
    .map((t) => ({
      key: `maint-${t.id}`,
      kind: "maintenance",
      title: `${t.propertyName ?? "Maintenance"}: ${t.taskDescription}`,
      href: `/maintenance?taskId=${t.id}`,
      dueDate: t.plannedCompletionDate!,
      statusTone: TASK_STATUS_MAP[t.taskStatus],
      statusLabel: TASK_STATUS_LABEL[t.taskStatus],
    }));

  const upcoming = [...projectRows, ...maintenanceRows]
    .filter((r) => !!r.dueDate)
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 8);

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>Upcoming Deadlines</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted-foreground">
                <th className="pb-2 pr-3 font-medium">Project / Task</th>
                <th className="pb-2 pr-3 font-medium">Completion Date</th>
                <th className="pb-2 pr-3 font-medium">Status</th>
                <th className="pb-2 pr-3 font-medium">Budget</th>
                <th className="pb-2 font-medium">Spent to Date</th>
              </tr>
            </thead>
            <tbody>
              {upcoming.map((r) => (
                <tr key={r.key} className="border-b border-border/60 last:border-0">
                  <td className="py-2 pr-3">
                    <Link href={r.href} className="block font-medium text-foreground hover:text-primary hover:underline">
                      {r.title}
                    </Link>
                  </td>
                  <td className="py-2 pr-3 text-muted-foreground">
                    {formatDate(r.dueDate)}
                  </td>
                  <td className="py-2 pr-3">
                    <StatusBadge status={r.statusTone} label={r.statusLabel} />
                  </td>
                  <td className="py-2 pr-3 text-muted-foreground">
                    {r.budget != null ? formatCurrency(r.budget) : "—"}
                  </td>
                  <td className="py-2 text-muted-foreground">
                    {r.spent != null ? formatCurrency(r.spent) : "—"}
                  </td>
                </tr>
              ))}
              {upcoming.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-muted-foreground">
                    No upcoming project or maintenance deadlines.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
