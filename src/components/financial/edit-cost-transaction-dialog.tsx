"use client";

import * as React from "react";
import { Trash2 } from "lucide-react";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useProjects } from "@/hooks/use-projects";
import { updateCostTransaction, deleteCostTransaction } from "@/lib/financial/cost-transaction-store";
import { showErrorToast, showSuccessToast } from "@/lib/toast/toast-store";
import type { CostTransaction } from "@/types/financial";

interface Props {
  transaction: CostTransaction | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CATEGORY_OPTIONS: { value: CostTransaction["category"]; label: string }[] = [
  { value: "labor", label: "Labor" },
  { value: "material", label: "Material" },
  { value: "equipment", label: "Equipment" },
  { value: "subcontract", label: "Subcontract" },
  { value: "miscellaneous", label: "Miscellaneous" },
];

export function EditCostTransactionDialog({ transaction, open, onOpenChange }: Props) {
  const projects = useProjects();
  const [projectId, setProjectId] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [costCode, setCostCode] = React.useState("");
  const [category, setCategory] = React.useState<CostTransaction["category"]>("miscellaneous");
  const [date, setDate] = React.useState("");
  const [amount, setAmount] = React.useState("");
  const [referenceNumber, setReferenceNumber] = React.useState("");
  const [confirmingDelete, setConfirmingDelete] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (transaction && open) {
      setProjectId(transaction.projectId);
      setDescription(transaction.description);
      setCostCode(transaction.costCode ?? "");
      setCategory(transaction.category);
      setDate(transaction.date);
      setAmount(String(transaction.amount));
      setReferenceNumber(transaction.referenceNumber ?? "");
      setConfirmingDelete(false);
    }
  }, [transaction, open]);

  async function handleSave() {
    if (!transaction || !projectId || !description || !amount) return;
    setSaving(true);
    const result = await updateCostTransaction(transaction.id, {
      projectId, description, costCode, category, date,
      amount: parseFloat(amount),
      referenceNumber: referenceNumber || undefined,
    });
    setSaving(false);
    if (!result.ok) {
      showErrorToast(result.error ? `Couldn't save: ${result.error}` : "Couldn't save this entry — check your connection and try again.");
      return;
    }
    showSuccessToast("Cost entry updated");
    onOpenChange(false);
  }

  function handleDelete() {
    if (!transaction) return;
    deleteCostTransaction(transaction.id);
    onOpenChange(false);
  }

  const canSave = !!projectId && !!description && !!amount;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Edit Cost Entry</DialogTitle></DialogHeader>
        <div className="flex flex-col gap-4">
          <div>
            <Label>Project</Label>
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
          <div><Label htmlFor="referenceNumber">Reference # (optional)</Label><Input id="referenceNumber" className="mt-1.5" value={referenceNumber} onChange={(e) => setReferenceNumber(e.target.value)} /></div>
        </div>
        <DialogFooter className="justify-between">
          {confirmingDelete ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Delete this entry?</span>
              <Button variant="destructive" size="sm" onClick={handleDelete}>Confirm Delete</Button>
              <Button variant="outline" size="sm" onClick={() => setConfirmingDelete(false)}>Cancel</Button>
            </div>
          ) : (
            <Button variant="ghost" className="text-destructive hover:text-destructive" onClick={() => setConfirmingDelete(true)}>
              <Trash2 className="size-3.5" /> Delete
            </Button>
          )}
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={!canSave || saving}>{saving ? "Saving…" : "Save"}</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
