"use client";

import * as React from "react";
import { Trash2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useProjects } from "@/hooks/use-projects";
import { useProperties } from "@/hooks/use-properties";
import { getPropertyDisplayName } from "@/lib/properties/property-relations";
import { updateMaterialRequest, deleteMaterialRequest } from "@/lib/procurement/material-request-store";
import { showErrorToast, showSuccessToast } from "@/lib/toast/toast-store";
import type { MaterialRequest, MaterialRequestStatus } from "@/types/procurement";
import type { Priority } from "@/types/common";

interface Props {
  request: MaterialRequest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const STATUS_OPTIONS: { value: MaterialRequestStatus; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "for_approval", label: "For Approval" },
  { value: "sourcing", label: "Sourcing" },
  { value: "ordered", label: "Ordered" },
  { value: "canceled", label: "Canceled" },
];

const PRIORITY_OPTIONS: { value: Priority; label: string }[] = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "critical", label: "Critical" },
];

export function MaterialRequestEditDialog({ request, open, onOpenChange }: Props) {
  const projects = useProjects();
  const properties = useProperties();

  const [projectId, setProjectId] = React.useState("");
  const [propertyId, setPropertyId] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [quantity, setQuantity] = React.useState("");
  const [unit, setUnit] = React.useState("");
  const [requestedBy, setRequestedBy] = React.useState("");
  const [priority, setPriority] = React.useState<Priority>("medium");
  const [requestDate, setRequestDate] = React.useState("");
  const [requiredOnSiteDate, setRequiredOnSiteDate] = React.useState("");
  const [budget, setBudget] = React.useState("");
  const [requestStatus, setRequestStatus] = React.useState<MaterialRequestStatus>("pending");
  const [notes, setNotes] = React.useState("");
  const [referenceUrl, setReferenceUrl] = React.useState("");
  const [confirmingDelete, setConfirmingDelete] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (request) {
      setProjectId(request.projectId ?? "");
      setPropertyId(request.propertyId ?? "");
      setDescription(request.lineItems[0]?.description ?? "");
      setQuantity(request.lineItems[0] ? String(request.lineItems[0].quantity) : "");
      setUnit(request.lineItems[0]?.unit ?? "");
      setRequestedBy(request.requestedBy ?? "");
      setPriority(request.priority ?? "medium");
      setRequestDate(request.requestDate ?? "");
      setRequiredOnSiteDate(request.requiredOnSiteDate ?? "");
      setBudget(request.estimatedCost != null ? String(request.estimatedCost) : "");
      setRequestStatus(request.requestStatus);
      setNotes(request.notes ?? "");
      setReferenceUrl(request.referenceUrl ?? "");
      setConfirmingDelete(false);
    }
  }, [request]);

  async function handleSave() {
    if (!request) return;
    const property = properties.find((p) => p.id === propertyId);
    const updatedLineItems = request.lineItems.length
      ? [{ ...request.lineItems[0], description, quantity: parseFloat(quantity) || 0, unit }]
      : [{ description, quantity: parseFloat(quantity) || 0, unit }];
    setSaving(true);
    const result = await updateMaterialRequest(request.id, {
      projectId: projectId || undefined,
      propertyId: propertyId || undefined,
      propertyName: property ? getPropertyDisplayName(property) : undefined,
      requestedBy,
      priority,
      requestDate,
      requiredOnSiteDate,
      estimatedCost: budget ? parseFloat(budget) : undefined,
      requestStatus,
      notes,
      referenceUrl,
      lineItems: updatedLineItems,
    });
    setSaving(false);
    if (!result.ok) {
      showErrorToast(result.error ? `Couldn't save: ${result.error}` : "Couldn't save this request — check your connection and try again.");
      return;
    }
    showSuccessToast("Material request updated");
    onOpenChange(false);
  }

  function handleDelete() {
    if (!request) return;
    deleteMaterialRequest(request.id);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Material Request {request?.mrNumber}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div>
            <Label>Property (optional)</Label>
            <Select value={propertyId} onValueChange={setPropertyId}>
              <SelectTrigger className="mt-1.5 w-full"><SelectValue placeholder="Select property" /></SelectTrigger>
              <SelectContent>{properties.map((p) => (<SelectItem key={p.id} value={p.id}>{getPropertyDisplayName(p)}</SelectItem>))}</SelectContent>
            </Select>
          </div>

          <div>
            <Label>Project (optional)</Label>
            <Select value={projectId} onValueChange={setProjectId}>
              <SelectTrigger className="mt-1.5 w-full"><SelectValue placeholder="Select project" /></SelectTrigger>
              <SelectContent>{projects.map((p) => (<SelectItem key={p.id} value={p.id}>{p.projectName}</SelectItem>))}</SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" className="mt-1.5" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="quantity">Quantity</Label>
              <Input id="quantity" type="number" className="mt-1.5" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="unit">Unit</Label>
              <Input id="unit" className="mt-1.5" value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="e.g. each, box, sheet" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="requestedBy">Requested By</Label>
              <Input id="requestedBy" className="mt-1.5" value={requestedBy} onChange={(e) => setRequestedBy(e.target.value)} />
            </div>
            <div>
              <Label>Priority</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as Priority)}>
                <SelectTrigger className="mt-1.5 w-full"><SelectValue /></SelectTrigger>
                <SelectContent>{PRIORITY_OPTIONS.map((opt) => (<SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>))}</SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="requestDate">Request Date</Label>
              <Input id="requestDate" type="date" className="mt-1.5" value={requestDate} onChange={(e) => setRequestDate(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="requiredOnSiteDate">Required On-Site Date</Label>
              <Input id="requiredOnSiteDate" type="date" className="mt-1.5" value={requiredOnSiteDate} onChange={(e) => setRequiredOnSiteDate(e.target.value)} />
            </div>
          </div>

          <div>
            <Label htmlFor="budget">Budget</Label>
            <Input id="budget" type="number" className="mt-1.5" value={budget} onChange={(e) => setBudget(e.target.value)} placeholder="$" />
          </div>

          <div>
            <Label>Status</Label>
            <Select value={requestStatus} onValueChange={(v) => setRequestStatus(v as MaterialRequestStatus)}>
              <SelectTrigger className="mt-1.5 w-full"><SelectValue /></SelectTrigger>
              <SelectContent>{STATUS_OPTIONS.map((opt) => (<SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>))}</SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="referenceUrl">Reference (file, Google Doc, or PDF link)</Label>
            <Input id="referenceUrl" placeholder="https://..." className="mt-1.5" value={referenceUrl} onChange={(e) => setReferenceUrl(e.target.value)} />
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" className="mt-1.5" value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
        </div>

        <DialogFooter className="justify-between">
          {request ? (confirmingDelete ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Delete this request?</span>
              <Button variant="destructive" size="sm" onClick={handleDelete}>Confirm Delete</Button>
              <Button variant="outline" size="sm" onClick={() => setConfirmingDelete(false)}>Cancel</Button>
            </div>
          ) : (
            <Button variant="ghost" className="text-destructive hover:text-destructive" onClick={() => setConfirmingDelete(true)}>
              <Trash2 className="size-3.5" /> Delete
            </Button>
          )) : <span />}
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? "Saving…" : "Save Changes"}</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
