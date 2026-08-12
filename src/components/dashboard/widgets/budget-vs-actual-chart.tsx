"use client";

import Link from "next/link";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useProjects } from "@/hooks/use-projects";

function formatCurrency(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

/**
 * Plain table, deliberately no chart/graph here — per explicit feedback
 * that budget figures should never be shown as a bar chart. Shows
 * active projects specifically — on-hold/upcoming/closed projects
 * shouldn't be mixed in with active spend tracking.
 */
export function BudgetVsActualChart() {
  const projects = useProjects();

  const rows = [...projects]
    .filter((p) => p.calculatedStatus === "active")
    .sort((a, b) => b.approvedBudget - a.approvedBudget)
    .map((p) => ({
      id: p.id,
      name: p.projectName,
      budget: p.approvedBudget,
      spent: p.actualCostToDate ?? 0,
      remaining: p.approvedBudget - (p.actualCostToDate ?? 0),
    }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Active Projects — Budget Overview</CardTitle>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">No active projects with a budget set yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-muted-foreground">
                  <th className="pb-2 pr-3 font-medium">Project</th>
                  <th className="pb-2 pr-3 font-medium">Budget</th>
                  <th className="pb-2 pr-3 font-medium">Spent to Date</th>
                  <th className="pb-2 font-medium">Remaining</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-b border-border/60 last:border-0">
                    <td className="py-2 pr-3">
                      <Link href={`/projects/${r.id}`} className="font-medium text-foreground hover:text-primary hover:underline">
                        {r.name}
                      </Link>
                    </td>
                    <td className="py-2 pr-3 text-muted-foreground">{formatCurrency(r.budget)}</td>
                    <td className="py-2 pr-3 text-muted-foreground">{formatCurrency(r.spent)}</td>
                    <td className={`py-2 font-medium ${r.remaining < 0 ? "text-destructive" : "text-foreground"}`}>
                      {formatCurrency(r.remaining)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
