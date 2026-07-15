"use client";
import * as React from "react";
import { Pencil, Plus, FileInput } from "lucide-react";
import { useBudgets } from "@/hooks/use-budgets";
import { useEstimates } from "@/hooks/use-estimates";
import { useCostTransactions } from "@/hooks/use-cost-transactions";
import { createBudgetFromEstimate } from "@/lib/financial/budget-store";
import { computeActualSpent, computeRemainingBudget } from "@/lib/financial/budget-actuals";
import { MOCK_PROJECTS } from "@/lib/data/mock/projects";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BudgetEditDialog } from "@/components/financial/budget-edit-dialog";
import type { Budget } from "@/types/financial";

const STATUS_CLASS: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  pending_approval: "bg-warning-soft text-warning-foreground",
  approved: "bg-success-soft text-success",
  revised: "bg-info-soft text-info-foreground",
};

function currency(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD" });
}
function projectName(id: string) {
  return MOCK_PROJECTS.find((p) => p.id === id)?.projectName ?? id;
}

export function BudgetTable() {
  const budgets = useBudgets();
  const estimates = useEstimates();
  const transactions = useCostTransactions();
  const [editing, setEditing] = React.useState<Budget | null>(null);
  const [creating, setCreating] = React.useState(false);
  const [fromEstimateId, setFromEstimateId] = React.useState("");

  const budgetedEstimateIds = new Set(budgets.map((b) => b.projectId));
  const availableEstimates = estimates.filter((e) => !budgetedEstimateIds.has(e.projectId));

  function handleCreateFromEstimate() {
    const estimate = estimates.find((e) => e.id === fromEstimateId);
    if (!estimate) return;
    createBudgetFromEstimate(estimate, "Ella Esquivel");
    setFromEstimateId("");
  }

  return (
    <>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          A formal, approvable budget per property. &quot;Actual Spent&quot; and
          &quot;Remaining&quot; are computed live from the Cost Ledger — not a number you
          have to update by hand. Start a budget from an approved estimate to save
          re-entering numbers.
        </p>
        <Button size="sm" onClick={() => setCreating(true)} className="shrink-0">
          <Plus className="size-3.5" /> New Budget
        </Button>
      </div>

      {availableEstimates.length > 0 && (
        <Card className="mb-3 flex flex-wrap items-center gap-2 p-3">
          <FileInput className="size-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Create from estimate:</span>
          <Select value={fromEstimateId} onValueChange={setFromEstimateId}>
            <SelectTrigger className="w-64"><SelectValue placeholder="Select an estimate" /></SelectTrigger>
            <SelectContent>
              {availableEstimates.map((e) => (
                <SelectItem key={e.id} value={e.id}>{projectName(e.projectId)} — {e.estimateNumber}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button size="sm" variant="outline" onClick={handleCreateFromEstimate} disabled={!fromEstimateId}>
            Create Budget
          </Button>
        </Card>
      )}

      <Card className="overflow-x-auto py-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th className="px-4 py-3 font-medium">Property</th>
              <th className="px-4 py-3 font-medium">Rev</th>
              <th className="px-4 py-3 font-medium">Current Budget</th>
              <th className="px-4 py-3 font-medium">Actual Spent</th>
              <th className="px-4 py-3 font-medium">Remaining</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Edit</th>
            </tr>
          </thead>
          <tbody>
            {budgets.map((b) => {
              const actualSpent = computeActualSpent(b.projectId, transactions);
              const remaining = computeRemainingBudget(b, transactions);
              return (
                <tr key={b.id} className="border-b border-border/60 last:border-0 hover:bg-accent/40">
                  <td className="px-4 py-3 font-medium text-foreground">{projectName(b.projectId)}</td>
                  <td className="px-4 py-3 text-muted-foreground">Rev {b.revision}</td>
                  <td className="px-4 py-3 font-medium text-foreground">{currency(b.currentBudget)}</td>
                  <td className="px-4 py-3 text-muted-foreground">{currency(actualSpent)}</td>
                  <td className={`px-4 py-3 font-medium ${remaining >= 0 ? "text-success" : "text-destructive"}`}>
                    {currency(remaining)}
                  </td>
                  <td className="px-4 py-3">
                    <Badge className={`${STATUS_CLASS[b.budgetStatus]} border-transparent`}>{b.budgetStatus.replace(/_/g, " ")}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Button variant="ghost" size="icon" onClick={() => setEditing(b)}><Pencil className="size-3.5" /></Button>
                  </td>
                </tr>
              );
            })}
            {budgets.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-6 text-center text-muted-foreground">No budgets yet — create one above.</td></tr>
            )}
          </tbody>
        </table>
      </Card>

      <BudgetEditDialog budget={editing} open={!!editing} onOpenChange={(open) => !open && setEditing(null)} />
      <BudgetEditDialog budget={null} open={creating} onOpenChange={setCreating} />
    </>
  );
}
