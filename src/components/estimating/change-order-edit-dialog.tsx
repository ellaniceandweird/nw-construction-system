"use client";
import * as React from "react";
import { Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createChangeOrder, updateChangeOrder, deleteChangeOrder } from "@/lib/estimating/change-order-store";
import { useEstimates } from "@/hooks/use-estimates";
import { useProjects } from "@/hooks/use-projects";
import type { ChangeOrder, ChangeOrderStatus } from "@/types/change-orders";
import type { Project } from "@/types/project";

interface Props { changeOrder: ChangeOrder | null; open: boolean; onOpenChange: (open: boolean) => void; }

const STATUS_OPTIONS: { value: ChangeOrderStatus; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

const MANUAL_ENTRY = "__manual__";

function projectName(id: string, projects: Project[]) {
  return projects.find((p) => p.id === id)?.projectName ?? id;
}

export function ChangeOrderEditDialog({ changeOrder, open, onOpenChange }: Props) {
  const projects = useProjects();
  const estimates = useEstimates();
  const [estimateId, setEstimateId] = React.useState("");
  const [relatedItem, setRelatedItem] = React.useState("");
  const [manualItem, setManualItem] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [reason, setReason] = React.useState("");
  const [costImpact, setCostImpact] = React.useState("");
  const [scheduleImpactDays, setScheduleImpactDays] = React.useState("");
  const [changeOrderStatus, setChangeOrderStatus] = React.useState<ChangeOrderStatus>("pending");
  const [requestedBy, setRequestedBy] = React.useState("");
  const [requestedDate, setRequestedDate] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const [confirmingDelete, setConfirmingDelete] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setEstimateId(changeOrder?.estimateId ?? "");
      setDescription(changeOrder?.description ?? "");
      setReason(changeOrder?.reason ?? "");
      setCostImpact(changeOrder ? String(changeOrder.costImpact) : "");
      setScheduleImpactDays(changeOrder?.scheduleImpactDays != null ? String(changeOrder.scheduleImpactDays) : "");
      setChangeOrderStatus(changeOrder?.changeOrderStatus ?? "pending");
      setRequestedBy(changeOrder?.requestedBy ?? "");
      setRequestedDate(changeOrder?.requestedDate ?? new Date().toISOString().slice(0, 10));
      setNotes(changeOrder?.notes ?? "");
      setConfirmingDelete(false);

      const estimate = estimates.find((e) => e.id === (changeOrder?.estimateId ?? ""));
      const itemOptions = estimate ? [...new Set(estimate.lineItems.map((li) => li.description))] : [];
      if (changeOrder?.relatedItem && itemOptions.includes(changeOrder.relatedItem)) {
        setRelatedItem(changeOrder.relatedItem);
        setManualItem("");
      } else if (changeOrder?.relatedItem) {
        setRelatedItem(MANUAL_ENTRY);
        setManualItem(changeOrder.relatedItem);
      } else {
        setRelatedItem("");
        setManualItem("");
      }
    }
  }, [changeOrder, open, estimates]);

  function handleSave() {
    const estimate = estimates.find((e) => e.id === estimateId);
    if (!estimate || !description || !costImpact || !requestedDate) return;
    const input = {
      projectId: estimate.projectId,
      estimateId,
      description,
      reason: reason || undefined,
      costImpact: parseFloat(costImpact),
      scheduleImpactDays: scheduleImpactDays ? parseInt(scheduleImpactDays, 10) : undefined,
      relatedItem: (relatedItem === MANUAL_ENTRY ? manualItem : relatedItem) || undefined,
      changeOrderStatus,
      requestedBy: requestedBy || undefined,
      requestedDate,
      approvedBy: changeOrderStatus === "approved" ? requestedBy || undefined : undefined,
      approvedDate: changeOrderStatus === "approved" ? new Date().toISOString().slice(0, 10) : undefined,
      notes: notes || undefined,
    };
    if (changeOrder) { updateChangeOrder(changeOrder.id, input); } else { createChangeOrder(input); }
    onOpenChange(false);
  }
  function handleDelete() {
    if (!changeOrder) return;
    deleteChangeOrder(changeOrder.id);
    onOpenChange(false);
  }
  const canSave = !!estimateId && !!description && !!costImpact && !!requestedDate;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{changeOrder ? `Edit ${changeOrder.changeOrderNumber}` : "New Change Order"}</DialogTitle></DialogHeader>
        <div className="flex flex-col gap-4">
          <div>
            <Label>Estimate / Property</Label>
            <Select value={estimateId} onValueChange={setEstimateId}>
              <SelectTrigger className="mt-1.5 w-full"><SelectValue placeholder="Select estimate" /></SelectTrigger>
              <SelectContent>
                {estimates.map((e) => (
                  <SelectItem key={e.id} value={e.id}>{projectName(e.projectId, projects)} — {e.estimateNumber}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Item (optional)</Label>
            <Select value={relatedItem} onValueChange={setRelatedItem} disabled={!estimateId}>
              <SelectTrigger className="mt-1.5 w-full"><SelectValue placeholder={estimateId ? "Select an item from the estimate" : "Select an estimate first"} /></SelectTrigger>
              <SelectContent>
                {[...new Set(estimates.find((e) => e.id === estimateId)?.lineItems.map((li) => li.description) ?? [])].map((item) => (
                  <SelectItem key={item} value={item}>{item}</SelectItem>
                ))}
                <SelectItem value={MANUAL_ENTRY}>Manual entry…</SelectItem>
              </SelectContent>
            </Select>
            {relatedItem === MANUAL_ENTRY && (
              <Input
                className="mt-2"
                placeholder="Type the item name"
                value={manualItem}
                onChange={(e) => setManualItem(e.target.value)}
              />
            )}
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" className="mt-1.5" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="reason">Reason (optional)</Label>
            <Input id="reason" className="mt-1.5" placeholder="e.g. Concealed condition, owner request" value={reason} onChange={(e) => setReason(e.target.value)} />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="costImpact">Cost Impact ($)</Label>
              <Input id="costImpact" type="number" className="mt-1.5" placeholder="Negative for a deduction" value={costImpact} onChange={(e) => setCostImpact(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="scheduleImpactDays">Schedule Impact (days, optional)</Label>
              <Input id="scheduleImpactDays" type="number" className="mt-1.5" value={scheduleImpactDays} onChange={(e) => setScheduleImpactDays(e.target.value)} />
            </div>
            <div>
              <Label>Status</Label>
              <Select value={changeOrderStatus} onValueChange={(v) => setChangeOrderStatus(v as ChangeOrderStatus)}>
                <SelectTrigger className="mt-1.5 w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((opt) => (<SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="requestedBy">Requested By (optional)</Label>
              <Input id="requestedBy" className="mt-1.5" value={requestedBy} onChange={(e) => setRequestedBy(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="requestedDate">Requested Date</Label>
              <Input id="requestedDate" type="date" className="mt-1.5" value={requestedDate} onChange={(e) => setRequestedDate(e.target.value)} />
            </div>
          </div>
          <div>
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea id="notes" className="mt-1.5" value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
        </div>
        <DialogFooter className="sm:justify-between">
          {changeOrder ? (confirmingDelete ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Delete this change order?</span>
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
