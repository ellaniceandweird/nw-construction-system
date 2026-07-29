"use client";

import * as React from "react";
import { Trash2 } from "lucide-react";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useProjects } from "@/hooks/use-projects";
import { createBudget, updateBudget, deleteBudget } from "@/lib/financial/budget-store";
import { showErrorToast, showSuccessToast } from "@/lib/toast/toast-store";
import type { Budget, BudgetStatus } from "@/types/financial";

interface Props {
  budget: Budget | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const STATUS_OPTIONS: { value: BudgetStatus; label: string }[] = [
  { value: "draft", label: "Draft" },
  { value: "pending_approval", label: "Pending Approval" },
  { value: "approved", label: "Approved" },
  { value: "revised", label: "Revised" },
];

const CATEGORY_FIELDS: { key: keyof Budget["categories"]; label: string }[] = [
  { key: "labor", label: "Labor" },
  { key: "materials", label: "Materials" },
  { key: "equipment", label: "Equipment" },
  { key: "subcontracts", label: "Subcontracts" },
  { key: "generalConditions", label: "General Conditions" },
  { key: "permits", label: "Permits" },
  { key: "insurance", label: "Insurance" },
  { key: "temporaryFacilities", label: "Temp. Facilities" },
  { key: "overhead", label: "Overhead" },
  { key: "contingency", label: "Contingency" },
  { key: "profit", label: "Profit" },
];

const emptyCategories = (): Budget["categories"] => ({
  labor: 0, materials: 0, equipment: 0, subcontracts: 0, generalConditions: 0,
  permits: 0, insurance: 0, temporaryFacilities: 0, overhead: 0, contingency: 0, profit: 0,
});

export function BudgetEditDialog({ budget, open, onOpenChange }: Props) {
  const projects = useProjects();
  const [projectId, setProjectId] = React.useState("");
  const [preparedBy, setPreparedBy] = React.useState("");
  const [budgetStatus, setBudgetStatus] = React.useState<BudgetStatus>("draft");
  const [categories, setCategories] = React.useState<Budget["categories"]>(emptyCategories());
  const [confirmingDelete, setConfirmingDelete] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    setConfirmingDelete(false);
    if (budget) {
      setProjectId(budget.projectId);
      setPreparedBy(budget.preparedBy);
      setBudgetStatus(budget.budgetStatus);
      setCategories(budget.categories);
    } else {
      setProjectId("");
      setPreparedBy("");
      setBudgetStatus("draft");
      setCategories(emptyCategories());
    }
  }, [budget, open]);

  const total = Object.values(categories).reduce((sum, v) => sum + (v || 0), 0);

  function updateCategory(key: keyof Budget["categories"], value: string) {
    setCategories((prev) => ({ ...prev, [key]: parseFloat(value) || 0 }));
  }

  async function handleSave() {
    if (!projectId || !preparedBy) return;
    const input = {
      projectId,
      preparedBy,
      budgetStatus,
      originalBudget: budget?.originalBudget ?? total,
      currentBudget: total,
      forecastBudget: total,
      remainingBudget: total - (budget ? budget.originalBudget - budget.remainingBudget : 0),
      categories,
    };
    setSaving(true);
    const result = budget ? await updateBudget(budget.id, input) : await createBudget(input);
    setSaving(false);
    if (!result.ok) {
      showErrorToast(result.error ? `Couldn't save: ${result.error}` : "Couldn't save this budget — check your connection and try again.");
      return;
    }
    showSuccessToast(budget ? "Budget updated" : "Budget created");
    onOpenChange(false);
  }

  function handleDelete() {
    if (!budget) return;
    deleteBudget(budget.id);
    onOpenChange(false);
  }

  const canSave = !!projectId && !!preparedBy;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{budget ? `Edit Budget (rev. ${budget.revision})` : "New Budget"}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Project</Label>
              <Select value={projectId} onValueChange={setProjectId}>
                <SelectTrigger className="mt-1.5 w-full"><SelectValue placeholder="Select project" /></SelectTrigger>
                <SelectContent>
                  {projects.map((p) => (<SelectItem key={p.id} value={p.id}>{p.projectName}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="preparedBy">Prepared By</Label>
              <Input id="preparedBy" className="mt-1.5" value={preparedBy} onChange={(e) => setPreparedBy(e.target.value)} />
            </div>
          </div>
          <div>
            <Label>Status</Label>
            <Select value={budgetStatus} onValueChange={(v) => setBudgetStatus(v as BudgetStatus)}>
              <SelectTrigger className="mt-1.5 w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((opt) => (<SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="mb-2 block">Budget Categories</Label>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {CATEGORY_FIELDS.map((field) => (
                <div key={field.key}>
                  <Label htmlFor={field.key} className="text-xs text-muted-foreground">{field.label}</Label>
                  <Input
                    id={field.key}
                    type="number"
                    className="mt-1"
                    value={categories[field.key] || ""}
                    onChange={(e) => updateCategory(field.key, e.target.value)}
                  />
                </div>
              ))}
            </div>
            <p className="mt-3 text-sm font-medium text-foreground">
              Total: {total.toLocaleString("en-US", { style: "currency", currency: "USD" })}
            </p>
          </div>
        </div>
        <DialogFooter className="justify-between">
          {budget ? (confirmingDelete ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Delete this budget?</span>
              <Button variant="destructive" size="sm" onClick={handleDelete}>Confirm Delete</Button>
              <Button variant="outline" size="sm" onClick={() => setConfirmingDelete(false)}>Cancel</Button>
            </div>
          ) : (
            <Button variant="ghost" className="text-destructive hover:text-destructive" onClick={() => setConfirmingDelete(true)}>
              <Trash2 className="size-3.5" /> Delete
            </Button>
          )) : <span />}
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={!canSave || saving}>{saving ? "Saving…" : "Save"}</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
