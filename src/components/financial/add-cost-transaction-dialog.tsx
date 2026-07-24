"use client";
import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createCostTransaction } from "@/lib/financial/cost-transaction-store";
import { useProjects } from "@/hooks/use-projects";
import type { CostTransaction } from "@/types/financial";

interface Props { open: boolean; onOpenChange: (open: boolean) => void; }
const CATEGORY_OPTIONS: { value: CostTransaction["category"]; label: string }[] = [
  { value: "labor", label: "Labor" },
  { value: "material", label: "Material" },
  { value: "equipment", label: "Equipment" },
  { value: "subcontract", label: "Subcontract" },
  { value: "miscellaneous", label: "Miscellaneous" },
];

export function AddCostTransactionDialog({ open, onOpenChange }: Props) {
  const projects = useProjects();
  const [projectId, setProjectId] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [costCode, setCostCode] = React.useState("");
  const [category, setCategory] = React.useState<CostTransaction["category"]>("miscellaneous");
  const [date, setDate] = React.useState(() => new Date().toISOString().slice(0, 10));
  const [amount, setAmount] = React.useState("");
  const [referenceNumber, setReferenceNumber] = React.useState("");

  function reset() {
    setProjectId(""); setDescription(""); setCostCode(""); setCategory("miscellaneous");
    setDate(new Date().toISOString().slice(0, 10)); setAmount(""); setReferenceNumber("");
  }
  function handleSave() {
    if (!projectId || !description || !amount) return;
    createCostTransaction({
      projectId, description, costCode, category, date,
      amount: parseFloat(amount),
      referenceNumber: referenceNumber || undefined,
    });
    reset();
    onOpenChange(false);
  }
  const canSave = !!projectId && !!description && !!amount;

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!next) reset(); onOpenChange(next); }}>
      <DialogContent>
        <DialogHeader><DialogTitle>Add Manual Cost Entry</DialogTitle></DialogHeader>
        <div className="flex flex-col gap-4">
          <div>
            <Label>Property</Label>
            <Select value={projectId} onValueChange={setProjectId}>
              <SelectTrigger className="mt-1.5 w-full"><SelectValue placeholder="Select project" /></SelectTrigger>
              <SelectContent>{projects.map((p) => (<SelectItem key={p.id} value={p.id}>{p.projectName}</SelectItem>))}</SelectContent>
            </Select>
          </div>
          <div><Label htmlFor="description">Description</Label><Input id="description" className="mt-1.5" value={description} onChange={(e) => setDescription(e.target.value)} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label htmlFor="costCode">Cost Code (optional)</Label><Input id="costCode" className="mt-1.5" value={costCode} onChange={(e) => setCostCode(e.target.value)} /></div>
            <div>
              <Label>Category</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as CostTransaction["category"])}>
                <SelectTrigger className="mt-1.5 w-full"><SelectValue /></SelectTrigger>
                <SelectContent>{CATEGORY_OPTIONS.map((opt) => (<SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>))}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label htmlFor="date">Date</Label><Input id="date" type="date" className="mt-1.5" value={date} onChange={(e) => setDate(e.target.value)} /></div>
            <div><Label htmlFor="amount">Amount ($)</Label><Input id="amount" type="number" className="mt-1.5" value={amount} onChange={(e) => setAmount(e.target.value)} /></div>
          </div>
          <div><Label htmlFor="referenceNumber">Reference # (optional)</Label><Input id="referenceNumber" className="mt-1.5" placeholder="e.g. Receipt #4471" value={referenceNumber} onChange={(e) => setReferenceNumber(e.target.value)} /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={!canSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
