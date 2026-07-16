"use client";
import * as React from "react";
import { Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createBudget, updateBudget, deleteBudget } from "@/lib/financial/budget-store";
import { MOCK_PROJECTS } from "@/lib/data/mock/projects";
import type { Budget, BudgetStatus } from "@/types/financial";

interface Props { budget: Budget | null; open: boolean; onOpenChange: (open: boolean) => void; }
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
  { key: "temporaryFacilities", label: "Temporary Facilities" },
  { key: "overhead", label: "Overhead" },
  { key: "contingency", label: "Contingency" },
  { key: "profit", label: "Profit" },
];
function currency(n: number) { return n.toLocaleString("en-US", { style: "currency", currency: "USD" }); }
function projectName(id: string) { return MOCK_PROJECTS.find((p) => p.id === id)?.projectName ?? id; }

export function BudgetEditDialog({ budget, open, onOpenChange }: Props) {
  const [projectId, setProjectId] = React.useState("");
  const [preparedBy, setPreparedBy] = React.useState("");
  const [budgetStatus, setBudgetStatus] = React.useState<BudgetStatus>("draft");
  const [currentBudget, setCurrentBudget] = React.useState("");
  const [forecastBudget, setForecastBudget] = React.useState("");
  const [categories, setCategories] = React.useState<Budget["categories"]>({
    labor: 0, materials: 0, equipment: 0, subcontracts: 0, generalConditions: 0,
    permits: 0, insurance: 0, temporaryFacilities: 0, overhead: 0, contingency: 0, profit: 0,
  });
  const [confirmingDelete, setConfirmingDelete] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setProjectId(budget?.projectId ?? "");
      setPreparedBy(budget?.preparedBy ?? "");
      setBudgetStatus(budget?.budgetStatus ?? "draft");
      setCurrentBudget(budget ? String(budget.currentBudget) : "");
      setForecastBudget(budget ? String(budget.forecastBudget) : "");
      setCategories(budget?.categories ?? { labor: 0, materials: 0, equipment: 0, subcontracts: 0, generalConditions: 0, permits: 0, insurance: 0, temporaryFacilities: 0, overhead: 0, contingency: 0, profit: 0 });
      setConfirmingDelete(false);
    }
  }, [budget, open]);

  const categorySum = Object.values(categories).reduce((s, v) => s + v, 0);

  function handleSave() {
    if (!projectId || !preparedBy || !currentBudget) return;
    const current = parseFloat(currentBudget);
    const forecast = forecastBudget ? parseFloat(forecastBudget) : current;
    const input = {
      projectId, preparedBy, budgetStatus,
      originalBudget: budget?.originalBudget ?? current,
      currentBudget: current,
      forecastBudget: forecast,
      remainingBudget: budget?.remainingBudget ?? current,
      categories,
    };
    if (budget) { updateBudget(budget.id, input); } else { createBudget(input); }
    onOpenChange(false);
  }
  function handleDelete() { if (!budget) return; deleteBudget(budget.id); onOpenChange(false); }
  const canSave = !!projectId && !!preparedBy && !!currentBudget;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
        <DialogHeader><DialogTitle>{budget ? `Edit Budget — Rev ${budget.revision}` : "New Budget"}</DialogTitle></DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Project</Label>
              <Select value={projectId} onValueChange={setProjectId}>
                <SelectTrigger className="mt-1.5 w-full"><SelectValue placeholder="Select project" /></SelectTrigger>
                <SelectContent>{MOCK_PROJECTS.map((p) => (<SelectItem key={p.id} value={p.id}>{p.projectName}</SelectItem>))}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Status</Label>
              <Select value={budgetStatus} onValueChange={(v) => setBudgetStatus(v as BudgetStatus)}>
                <SelectTrigger className="mt-1.5 w-full"><SelectValue /></SelectTrigger>
                <SelectContent>{STATUS_OPTIONS.map((opt) => (<SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>))}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div><Label htmlFor="preparedBy">Prepared By</Label><Input id="preparedBy" className="mt-1.5" value={preparedBy} onChange={(e) => setPreparedBy(e.target.value)} /></div>
            <div><Label htmlFor="currentBudget">Current Budget ($)</Label><Input id="currentBudget" type="number" className="mt-1.5" value={currentBudget} onChange={(e) => setCurrentBudget(e.target.value)} /></div>
            <div><Label htmlFor="forecastBudget">Forecast Budget ($)</Label><Input id="forecastBudget" type="number" className="mt-1.5" value={forecastBudget} onChange={(e) => setForecastBudget(e.target.value)} /></div>
          </div>
          <div>
            <Label>Categories</Label>
            <div className="mt-1.5 grid grid-cols-2 gap-3 rounded-md border border-border p-3 sm:grid-cols-3">
              {CATEGORY_FIELDS.map((f) => (
                <div key={f.key}>
                  <Label className="text-xs">{f.label}</Label>
                  <Input
                    type="number"
                    className="mt-1"
                    value={categories[f.key]}
                    onChange={(e) => setCategories((prev) => ({ ...prev, [f.key]: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
              ))}
            </div>
            <p className="mt-1.5 text-xs text-muted-foreground">Category sum: {currency(categorySum)}</p>
          </div>
        </div>
        <DialogFooter className="sm:justify-between">
          {budget ? (confirmingDelete ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Delete this budget?</span>
              <Button variant="destructive" size="sm" onClick={handleDelete}>Confirm Delete</Button>
              <Button variant="outline" size="sm" onClick={() => setConfirmingDelete(false)}>Cancel</Button>
            </div>
          ) : (
            <Button variant="ghost" className="text-destructive hover:text-destructive" onClick={() => setConfirmingDelete(true)}><Trash2 className="size-3.5" /> Delete</Button>
          )) : <span />}
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={!canSave}>Save</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
