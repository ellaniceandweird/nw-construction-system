"use client";

import Link from "next/link";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useProjects } from "@/hooks/use-projects";

function formatCurrency(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

function shortenLabel(name: string, max = 14) {
  return name.length > max ? `${name.slice(0, max - 1)}…` : name;
}

export function BudgetVsActualChart() {
  const projects = useProjects();

  const data = [...projects]
    .filter((p) => p.approvedBudget > 0 || (p.actualCostToDate ?? 0) > 0)
    .sort((a, b) => b.approvedBudget - a.approvedBudget)
    .slice(0, 8)
    .map((p) => ({
      name: shortenLabel(p.projectName),
      fullName: p.projectName,
      Budget: p.approvedBudget,
      Actual: p.actualCostToDate ?? 0,
    }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Budget vs. Actual by Project</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">No project budgets to show yet.</p>
        ) : (
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                  interval={0}
                  angle={-20}
                  textAnchor="end"
                  height={50}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                  tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                  width={48}
                />
                <Tooltip
                  formatter={(value: any) => formatCurrency(Number(value))}
                  labelFormatter={(_, payload) => payload?.[0]?.payload?.fullName ?? ""}
                  contentStyle={{
                    background: "var(--color-card)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="Budget" fill="var(--color-primary-soft)" stroke="var(--color-primary)" strokeWidth={1} radius={[4, 4, 0, 0]} />
                <Bar dataKey="Actual" fill="var(--color-warning-soft)" stroke="var(--color-warning)" strokeWidth={1} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
        <Link href="/financial" className="mt-2 inline-block text-xs font-medium text-primary hover:underline">
          View financials
        </Link>
      </CardContent>
    </Card>
  );
}
