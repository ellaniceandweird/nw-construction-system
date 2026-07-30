"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { getProjectHealthBreakdown } from "@/lib/dashboard/metrics";
import { useProjects } from "@/hooks/use-projects";

const COLORS: Record<string, string> = {
  "On Track": "var(--color-success-soft)",
  "At Risk": "var(--color-warning-soft)",
  Behind: "var(--color-destructive-soft)",
  Completed: "var(--color-primary-soft)",
};

const TEXT_COLORS: Record<string, string> = {
  "On Track": "var(--color-success)",
  "At Risk": "var(--color-warning)",
  Behind: "var(--color-destructive)",
  Completed: "var(--color-primary)",
};

export function ProjectsOverviewWidget() {
  const projects = useProjects();
  const breakdown = getProjectHealthBreakdown(projects);
  const total = projects.length;

  const statusCounts = [
    { label: "Upcoming", count: projects.filter((p) => p.calculatedStatus === "planning").length, className: "bg-primary-soft text-primary" },
    { label: "Active", count: projects.filter((p) => p.calculatedStatus === "active").length, className: "bg-success-soft text-success" },
    { label: "On Hold", count: projects.filter((p) => p.calculatedStatus === "on_hold").length, className: "bg-warning-soft text-warning-foreground" },
    { label: "Cancelled", count: projects.filter((p) => p.calculatedStatus === "archived").length, className: "bg-muted text-muted-foreground" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Projects Overview</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <div className="relative size-28 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={breakdown}
                  dataKey="count"
                  nameKey="label"
                  innerRadius={38}
                  outerRadius={54}
                  paddingAngle={2}
                  strokeWidth={0}
                >
                  {breakdown.map((b) => (
                    <Cell key={b.label} fill={COLORS[b.label]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-lg font-semibold text-foreground">{total}</span>
              <span className="text-[10px] text-muted-foreground">Total</span>
            </div>
          </div>
          <ul className="flex flex-1 flex-col gap-1.5 text-sm">
            {breakdown.map((b) => (
              <li key={b.label} className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <span
                    className="size-2 rounded-full"
                    style={{ background: TEXT_COLORS[b.label] }}
                  />
                  {b.label}
                </span>
                <span className="font-medium text-foreground">
                  {b.count} ({total > 0 ? Math.round((b.count / total) * 100) : 0}%)
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="grid grid-cols-4 gap-2 border-t border-border pt-3">
          {statusCounts.map((s) => (
            <div key={s.label} className={`rounded-lg px-2 py-1.5 text-center ${s.className}`}>
              <div className="text-base font-semibold leading-none">{s.count}</div>
              <div className="mt-1 text-[10px] leading-none">{s.label}</div>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <span className="text-xs text-muted-foreground">
          Total Projects: {total}
        </span>
      </CardFooter>
    </Card>
  );
}
