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
import { MOCK_PROJECTS } from "@/lib/data/mock/projects";

const COLORS: Record<string, string> = {
  "On Track": "var(--color-success)",
  "At Risk": "var(--color-warning)",
  Behind: "var(--color-destructive)",
  Completed: "var(--color-primary)",
};

export function ProjectsOverviewWidget() {
  const breakdown = getProjectHealthBreakdown();
  const total = MOCK_PROJECTS.length;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Projects Overview</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center gap-4">
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
                  style={{ background: COLORS[b.label] }}
                />
                {b.label}
              </span>
              <span className="font-medium text-foreground">
                {b.count} ({total > 0 ? Math.round((b.count / total) * 100) : 0}%)
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <span className="text-xs text-muted-foreground">
          Total Projects: {total}
        </span>
      </CardFooter>
    </Card>
  );
}
