"use client";
import * as React from "react";
import { Pencil, Plus, Search } from "lucide-react";

import { useBudgets } from "@/hooks/use-budgets";
import { useProjects } from "@/hooks/use-projects";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BudgetEditDialog } from "@/components/financial/budget-edit-dialog";
import type { Budget, BudgetStatus } from "@/types/financial";

const STATUS_CLASS: Record<BudgetStatus, string> = {
  draft: "bg-muted text-muted-foreground",
  pending_approval: "bg-warning-soft text-warning-foreground",
  approved: "bg-success-soft text-success",
  revised: "bg-info-soft text-info-foreground",
};

const STATUS_LABEL: Record<BudgetStatus, string> = {
  draft: "Draft",
  pending_approval: "Pending Approval",
  approved: "Approved",
  revised: "Revised",
};

function currency(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

export function BudgetsTable() {
  const budgets = useBudgets();
  const projects = useProjects();
  const [search, setSearch] = React.useState("");
  const [editing, setEditing] = React.useState<Budget | null>(null);
  const [creating, setCreating] = React.useState(false);

  function projectName(id: string) {
    return projects.find((p) => p.id === id)?.projectName ?? "—";
  }

  const filtered = budgets.filter((b) => {
    if (!search) return true;
    return projectName(b.projectId).toLowerCase().includes(search.toLowerCase()) ||
      b.preparedBy.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <>
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          Project budgets by category — approval status here also drives the Approvals module.
        </p>
        <Button size="sm" onClick={() => setCreating(true)}>
          <Plus className="size-3.5" /> New Budget
        </Button>
      </div>

      <div className="mb-3 relative max-w-sm">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input className="pl-8" placeholder="Search project, prepared by…" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <Card className="overflow-x-auto py-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th className="px-4 py-3 font-medium">Project</th>
              <th className="px-4 py-3 font-medium">Rev.</th>
              <th className="px-4 py-3 font-medium">Prepared By</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Current Budget</th>
              <th className="px-4 py-3 font-medium">Remaining</th>
              <th className="px-4 py-3 font-medium w-10"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((b) => (
              <tr key={b.id} className="border-b border-border/60 last:border-0 hover:bg-accent/40">
                <td className="px-4 py-3 font-medium text-foreground">{projectName(b.projectId)}</td>
                <td className="px-4 py-3 text-muted-foreground">{b.revision}</td>
                <td className="px-4 py-3 text-muted-foreground">{b.preparedBy}</td>
                <td className="px-4 py-3">
                  <Badge className={`border-transparent ${STATUS_CLASS[b.budgetStatus]}`}>{STATUS_LABEL[b.budgetStatus]}</Badge>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{currency(b.currentBudget)}</td>
                <td className="px-4 py-3 text-muted-foreground">{currency(b.remainingBudget)}</td>
                <td className="px-4 py-3">
                  <Button variant="ghost" size="icon" onClick={() => setEditing(b)}>
                    <Pencil className="size-3.5" />
                  </Button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">
                  {budgets.length === 0 ? "No budgets yet — click \"New Budget\" above." : "No budgets match your search."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>

      <BudgetEditDialog budget={editing} open={!!editing} onOpenChange={(open) => !open && setEditing(null)} />
      <BudgetEditDialog budget={null} open={creating} onOpenChange={setCreating} />
    </>
  );
}
