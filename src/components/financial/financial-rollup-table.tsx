"use client";
import * as React from "react";
import { ArrowUpDown } from "lucide-react";
import { useBudgets } from "@/hooks/use-budgets";
import { useCostTransactions } from "@/hooks/use-cost-transactions";
import { useProjects } from "@/hooks/use-projects";
import { computeFinancialRollup } from "@/lib/financial/financial-rollup";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Project } from "@/types/project";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function currency(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD" });
}
function projectName(id: string, projects: Project[]) {
  return projects.find((p) => p.id === id)?.projectName ?? id;
}

function SummaryCard({ label, value, tone }: { label: string; value: string; tone?: "success" | "destructive" }) {
  return (
    <Card className="p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`mt-1 font-mono text-xl font-semibold ${tone === "success" ? "text-success" : tone === "destructive" ? "text-destructive" : "text-foreground"}`}>
        {value}
      </p>
    </Card>
  );
}

export function FinancialRollupTable() {
  const projects = useProjects();
  const budgets = useBudgets();
  const transactions = useCostTransactions();
  const [sortBy, setSortBy] = React.useState<"project" | "budget_desc" | "remaining_asc">("project");

  const totals = computeFinancialRollup(budgets, transactions);
  const sortedRows = [...totals.rows].sort((a, b) => {
    if (sortBy === "budget_desc") return b.currentBudget - a.currentBudget;
    if (sortBy === "remaining_asc") return a.remaining - b.remaining;
    return projectName(a.projectId, projects).localeCompare(projectName(b.projectId, projects));
  });

  return (
    <>
      <p className="mb-3 text-xs text-muted-foreground">
        Totals every property with a budget into one view — current budget, real spend
        from the Cost Ledger, and what&apos;s left.
      </p>

      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <SummaryCard label="Total Budget" value={currency(totals.totalBudget)} />
        <SummaryCard label="Actual Spent" value={currency(totals.totalActualSpent)} />
        <SummaryCard
          label="Remaining"
          value={currency(totals.totalRemaining)}
          tone={totals.totalRemaining >= 0 ? "success" : "destructive"}
        />
      </div>

      <div className="mb-3 flex items-center gap-3">
        <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
          <SelectTrigger className="w-[180px]"><ArrowUpDown className="size-3.5 text-muted-foreground" /><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="project">Property (A-Z)</SelectItem>
            <SelectItem value="budget_desc">Budget (Highest)</SelectItem>
            <SelectItem value="remaining_asc">Remaining (Lowest First)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="overflow-x-auto py-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th className="px-4 py-3 font-medium">Property</th>
              <th className="px-4 py-3 font-medium">Current Budget</th>
              <th className="px-4 py-3 font-medium">Actual Spent</th>
              <th className="px-4 py-3 font-medium">Remaining</th>
            </tr>
          </thead>
          <tbody>
            {sortedRows.map((r) => (
              <tr key={r.budgetId} className="border-b border-border/60 last:border-0 hover:bg-accent/40">
                <td className="px-4 py-3 font-medium text-foreground">{projectName(r.projectId, projects)}</td>
                <td className="px-4 py-3 text-muted-foreground">{currency(r.currentBudget)}</td>
                <td className="px-4 py-3 text-muted-foreground">{currency(r.actualSpent)}</td>
                <td className="px-4 py-3">
                  <Badge className={`${r.remaining >= 0 ? "bg-success-soft text-success" : "bg-destructive-soft text-destructive"} border-transparent`}>
                    {currency(r.remaining)}
                  </Badge>
                </td>
              </tr>
            ))}
            {sortedRows.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-muted-foreground">
                  No budgets yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </>
  );
}
