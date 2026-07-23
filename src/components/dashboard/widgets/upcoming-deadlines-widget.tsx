"use client";
import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/status-badge";
import { getUpcomingDeadlines } from "@/lib/dashboard/metrics";
import { useActivities } from "@/hooks/use-activities";
import { useMaintenanceTasks } from "@/hooks/use-maintenance-tasks";
import { useProjects } from "@/hooks/use-projects";

function formatDate(d: Date) {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function daysBetween(a: Date, b: Date): number {
  const msPerDay = 24 * 60 * 60 * 1000;
  const aStart = new Date(a.getFullYear(), a.getMonth(), a.getDate());
  const bStart = new Date(b.getFullYear(), b.getMonth(), b.getDate());
  return Math.round((aStart.getTime() - bStart.getTime()) / msPerDay);
}

function specificDeadlineLabel(dueDate: Date): string {
  const diff = daysBetween(dueDate, new Date());
  if (diff < 0) return `Overdue by ${Math.abs(diff)} day${Math.abs(diff) === 1 ? "" : "s"}`;
  if (diff === 0) return "Due today";
  if (diff === 1) return "Due tomorrow";
  return `Due in ${diff} days`;
}

function deadlineHref(type: "Activity" | "Maintenance", id: string): string {
  return type === "Activity" ? `/scheduling/master?highlight=${id}` : `/maintenance?tab=general&highlight=${id}`;
}

export function UpcomingDeadlinesWidget() {
  const activities = useActivities();
  const maintenanceTasks = useMaintenanceTasks();
  const projects = useProjects();
  const deadlines = getUpcomingDeadlines(activities, maintenanceTasks, projects, 6);

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
                <th className="pb-2 pr-3 font-medium">Type</th>
                <th className="pb-2 pr-3 font-medium">Item</th>
                <th className="pb-2 pr-3 font-medium">Project / Property</th>
                <th className="pb-2 pr-3 font-medium">Due Date</th>
                <th className="pb-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {deadlines.map((d) => (
                <tr key={d.id} className="border-b border-border/60 last:border-0">
                  <td className="py-2 pr-3">
                    <Link href={deadlineHref(d.type, d.id)} className="block text-muted-foreground hover:text-primary hover:underline">
                      {d.type}
                    </Link>
                  </td>
                  <td className="py-2 pr-3">
                    <Link href={deadlineHref(d.type, d.id)} className="block text-foreground hover:text-primary hover:underline">
                      {d.item}
                    </Link>
                  </td>
                  <td className="py-2 pr-3 text-muted-foreground">
                    {d.projectOrProperty}
                  </td>
                  <td className="py-2 pr-3 text-muted-foreground">
                    {formatDate(d.dueDate)}
                  </td>
                  <td className="py-2">
                    <StatusBadge
                      status={
                        d.status === "overdue"
                          ? "behind_schedule"
                          : d.status === "due_soon"
                          ? "due_soon"
                          : "upcoming"
                      }
                      label={specificDeadlineLabel(d.dueDate)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
