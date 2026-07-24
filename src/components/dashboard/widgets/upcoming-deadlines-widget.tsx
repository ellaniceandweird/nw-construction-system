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
import type { ProjectCalculatedStatus } from "@/types/project";

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatCurrency(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

const STATUS_MAP: Record<ProjectCalculatedStatus, DashboardStatus> = {
  planning: "upcoming",
  active: "on_track",
  on_hold: "at_risk",
  delayed: "behind_schedule",
  substantially_complete: "on_track",
  closed: "completed",
  archived: "completed",
};

const STATUS_LABEL: Record<ProjectCalculatedStatus, string> = {
  planning: "Planning",
  active: "Active",
  on_hold: "On Hold",
  delayed: "Delayed",
  substantially_complete: "Substantially Complete",
  closed: "Closed",
  archived: "Archived",
};

export function UpcomingDeadlinesWidget() {
  const projects = useProjects();

  const upcoming = [...projects]
    .filter((p) => p.calculatedStatus !== "closed" && p.calculatedStatus !== "archived")
    .sort((a, b) => new Date(a.plannedCompletionDate).getTime() - new Date(b.plannedCompletionDate).getTime())
    .slice(0, 6);

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
                <th className="pb-2 pr-3 font-medium">Project</th>
                <th className="pb-2 pr-3 font-medium">Completion Date</th>
                <th className="pb-2 pr-3 font-medium">Status</th>
                <th className="pb-2 pr-3 font-medium">Budget</th>
                <th className="pb-2 font-medium">Spent to Date</th>
              </tr>
            </thead>
            <tbody>
              {upcoming.map((p) => (
                <tr key={p.id} className="border-b border-border/60 last:border-0">
                  <td className="py-2 pr-3">
                    <Link href={`/projects/${p.id}`} className="block font-medium text-foreground hover:text-primary hover:underline">
                      {p.projectName}
                    </Link>
                  </td>
                  <td className="py-2 pr-3 text-muted-foreground">
                    {formatDate(p.plannedCompletionDate)}
                  </td>
                  <td className="py-2 pr-3">
                    <StatusBadge status={STATUS_MAP[p.calculatedStatus]} label={STATUS_LABEL[p.calculatedStatus]} />
                  </td>
                  <td className="py-2 pr-3 text-muted-foreground">
                    {formatCurrency(p.approvedBudget)}
                  </td>
                  <td className="py-2 text-muted-foreground">
                    {p.actualCostToDate != null ? formatCurrency(p.actualCostToDate) : "—"}
                  </td>
                </tr>
              ))}
              {upcoming.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-muted-foreground">
                    No active projects with an upcoming completion date.
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
